import { ContentColumns, Content, Table } from 'pdfmake/interfaces';

import { ShipmentReportGenerationDataDto } from '@mp/common/dtos';

import { shipmentReport } from './shipment.report';

jest.mock('../../../helpers', () => ({
  urlToBase64: jest.fn().mockResolvedValue('mockLogoBase64'),
}));

describe('shipmentReport', () => {
  // Arrange
  const mockShipment: ShipmentReportGenerationDataDto = {
    shipmentId: 30,
    date: new Date('2025-01-15'),
    estimatedKm: 25.5,
    effectiveKm: 28.3,
    finishedAt: new Date('2025-01-15T18:30:00'),
    routeLink: 'https://maps.google.com/route/abc123',
    vehiclePlate: 'ABC123',
    vehicleDescription: 'Mercedes Sprinter',
    driverName: 'Juan Pérez',
    driverPhone: '3414315832',
    orders: [
      {
        orderId: 1,
        clientName: 'Tomás Amori',
        clientAddress: 'Corrientes 1489, Rosario, Santa Fe, Argentina',
        clientPhone: '3414567890',
        deliveryMethod: 'HomeDelivery',
        totalAmount: 804.0,
        items: [
          {
            productName: 'Producto A',
            quantity: 2,
            unitPrice: 100,
            subtotalPrice: 200,
          },
          {
            productName: 'Producto B',
            quantity: 1,
            unitPrice: 604,
            subtotalPrice: 604,
          },
        ],
      },
      {
        orderId: 2,
        clientName: 'María González',
        clientAddress: 'San Martín 500, Rosario, Santa Fe, Argentina',
        clientPhone: '3414123456',
        deliveryMethod: 'PickUpAtStore',
        totalAmount: 500.0,
        items: [
          {
            productName: 'Producto C',
            quantity: 5,
            unitPrice: 100,
            subtotalPrice: 500,
          },
        ],
      },
    ],
  };

  it('should generate the PDF document with the main data', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    expect(doc.images).toBeDefined();
    expect(doc.images && doc.images.logo).toBe('mockLogoBase64');
    expect(doc.content).toBeDefined();

    const contentArr = doc.content as Content[];

    // Verificar header
    const header = contentArr[0] as ContentColumns;
    const columns = header.columns as Array<{
      stack?: Array<{ text: string | Array<{ text?: string }> }>;
    }>;

    const stackContent = columns[1].stack;
    expect(stackContent).toBeDefined();

    if (stackContent) {
      const titleObj = stackContent[0];
      if (typeof titleObj === 'object' && 'text' in titleObj) {
        expect(titleObj.text).toContain(
          `Hoja de ruta #${mockShipment.shipmentId}`,
        );
      }
    }

    // Verificar tabla de órdenes
    const ordersTable = contentArr[1] as { table: Table };
    expect(ordersTable.table.body[1][0]).toEqual({
      text: '#1',
      alignment: 'center',
    });
    expect(ordersTable.table.body[1][1]).toBe('Tomás Amori');
    expect(ordersTable.table.body[2][0]).toEqual({
      text: '#2',
      alignment: 'center',
    });
    expect(ordersTable.table.body[2][1]).toBe('María González');
  });

  it('should display vehicle and driver information in header', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const header = (doc.content as Content[])[0] as ContentColumns;
    const columns = header.columns as Array<{
      stack?: Array<{ text: string | Array<{ text?: string }> }>;
    }>;

    const stackContent = columns[1].stack;
    if (stackContent) {
      const infoObj = stackContent[1];
      if (
        typeof infoObj === 'object' &&
        'text' in infoObj &&
        Array.isArray(infoObj.text)
      ) {
        const textArray = infoObj.text
          .map((item) => (typeof item === 'string' ? item : item.text || ''))
          .join('');

        expect(textArray).toContain('ABC123');
        expect(textArray).toContain('Mercedes Sprinter');
        expect(textArray).toContain('Juan Pérez');
        expect(textArray).toContain('3414315832');
      }
    }
  });

  it('should display estimated and effective km when provided', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const header = (doc.content as Content[])[0] as ContentColumns;
    const columns = header.columns as Array<{
      stack?: Array<{ text: string | Array<{ text?: string }> }>;
    }>;

    const stackContent = columns[1].stack;
    if (stackContent && stackContent.length > 2) {
      const kmObj = stackContent[2];
      if (typeof kmObj === 'object' && 'text' in kmObj) {
        const kmText = kmObj.text as string;
        expect(kmText).toContain('Km estimados: 25.5');
        expect(kmText).toContain('Km efectivos: 28.3');
      }
    }
  });

  it('should display orders in the table correctly', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const ordersTable = (doc.content as Content[])[1] as { table: Table };

    expect(ordersTable.table.body[1][1]).toBe('Tomás Amori');
    expect(ordersTable.table.body[1][2]).toBe(
      'Corrientes 1489, Rosario, Santa Fe, Argentina',
    );
    expect(ordersTable.table.body[1][5]).toEqual({
      text: '$ 804.00',
      alignment: 'right',
    });

    expect(ordersTable.table.body[2][1]).toBe('María González');
    expect(ordersTable.table.body[2][5]).toEqual({
      text: '$ 500.00',
      alignment: 'right',
    });
  });

  it('should display order details per order', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const contentArr = doc.content as Content[];
    const detailsPerOrder = contentArr.slice(3); // Los detalles empiezan después del título

    expect(detailsPerOrder.length).toBeGreaterThan(0);

    const firstOrderDetail = detailsPerOrder[0] as { stack: Array<unknown> };
    expect(firstOrderDetail.stack).toBeDefined();

    const orderTable = firstOrderDetail.stack[2] as { table: Table };
    expect(orderTable.table.body[1][1]).toBe('Producto A');
    expect(orderTable.table.body[2][1]).toBe('Producto B');
  });

  it('should include QR section when routeLink is provided', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const contentArr = doc.content as Content[];
    const qrSection = contentArr[contentArr.length - 1] as {
      stack: Array<unknown>;
    };

    expect(qrSection.stack).toBeDefined();
    expect(qrSection.stack.length).toBeGreaterThan(0);

    const qrCode = qrSection.stack[1] as { qr: string; fit: number };
    expect(qrCode.qr).toBe(mockShipment.routeLink);
    expect(qrCode.fit).toBe(200);

    const linkText = qrSection.stack[3] as { text: string; link: string };
    expect(linkText.text).toBe(mockShipment.routeLink);
    expect(linkText.link).toBe(mockShipment.routeLink);
  });

  it('should not include QR section when routeLink is not provided', async () => {
    // Arrange
    const shipmentWithoutRoute = { ...mockShipment, routeLink: undefined };

    // Act
    const doc = await shipmentReport(shipmentWithoutRoute);

    // Assert
    const contentArr = doc.content as Content[];
    const lastItem = contentArr[contentArr.length - 1];

    if (
      typeof lastItem === 'object' &&
      lastItem !== null &&
      'text' in lastItem
    ) {
      expect(lastItem.text).toBe('');
    }
  });

  it('should handle orders without items', async () => {
    // Arrange
    const shipmentWithEmptyItems = {
      ...mockShipment,
      orders: [
        {
          ...mockShipment.orders[0],
          items: [],
        },
      ],
    };

    // Act
    const doc = await shipmentReport(shipmentWithEmptyItems);

    // Assert
    const contentArr = doc.content as Content[];
    const orderDetail = contentArr[3] as { stack: Array<unknown> };
    const orderTable = orderDetail.stack[2] as { table: Table };

    // Solo el header más la fila de TOTAL
    expect(orderTable.table.body.length).toBe(2);
  });

  it('should handle optional fields as undefined', async () => {
    // Arrange
    const minimalShipment: ShipmentReportGenerationDataDto = {
      shipmentId: 1,
      date: new Date('2025-01-15'),
      vehiclePlate: 'XYZ789',
      driverName: 'Test Driver',
      orders: [
        {
          orderId: 1,
          clientName: 'Test Client',
          clientAddress: 'Test Address',
          deliveryMethod: 'Test',
          totalAmount: 100,
          items: [],
        },
      ],
    };

    // Act
    const doc = await shipmentReport(minimalShipment);

    // Assert
    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();

    const header = (doc.content as Content[])[0] as ContentColumns;
    expect(header.columns).toBeDefined();
  });

  it('should define correct page margins', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    expect(doc.pageMargins).toEqual([40, 40, 40, 40]);
  });

  it('should define styles for headings', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    expect(doc.styles).toBeDefined();
    expect(doc.styles?.h1).toEqual({ fontSize: 14, bold: true });
    expect(doc.styles?.h2).toEqual({ fontSize: 12, bold: true });
  });

  it('should set table layout colors correctly', async () => {
    // Act
    const doc = await shipmentReport(mockShipment);

    // Assert
    const ordersTable = (doc.content as Content[])[1] as {
      layout?: {
        fillColor?: (rowIndex: number) => string | null;
        hLineColor?: () => string;
        vLineColor?: () => string;
      };
    };

    expect(ordersTable.layout).toBeDefined();
    if (ordersTable.layout) {
      expect(ordersTable.layout.fillColor?.(0)).toBe('#65558f');
      expect(ordersTable.layout.fillColor?.(1)).toBeNull();
      expect(ordersTable.layout.hLineColor?.()).toBe('#ddd');
      expect(ordersTable.layout.vLineColor?.()).toBe('#ddd');
    }
  });
});
