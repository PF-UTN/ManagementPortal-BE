import { Decimal } from '@prisma/client/runtime/library';
import { ContentColumns, Content, Table } from 'pdfmake/interfaces';

import { BillReportGenerationDataDto } from './../../../dtos/bill/bill-report-generation-data.dto';
import { billReport } from './bill.report';

jest.mock('../../../helpers', () => ({
  urlToBase64: jest.fn().mockResolvedValue('mockLogoBase64'),
}));

describe('billReport', () => {
  //Arrange
  const mockBill: BillReportGenerationDataDto = {
    orderId: 1,
    billId: 1,
    clientCompanyName: 'Empresa Test',
    clientDocumentType: 'CUIT',
    clientDocumentNumber: '30-12345678-9',
    clientTaxCategory: 'Responsable Inscripto',
    clientAddress: 'Calle Falsa 123',
    createdAt: new Date('2024-01-01'),
    deliveryMethod: 'Envío',
    paymentType: 'Efectivo',
    orderItems: [
      {
        quantity: 2,
        productName: 'Producto A',
        unitPrice: new Decimal(100),
        subtotalPrice: new Decimal(200),
      },
      {
        quantity: 1,
        productName: 'Producto B',
        unitPrice: new Decimal(50),
        subtotalPrice: new Decimal(50),
      },
    ],
    totalAmount: new Decimal(250),
    observation: 'Sin observaciones',
  };
  interface ProductTableLayout {
    hLineWidth: () => number;
    vLineWidth: () => number;
    hLineColor: () => string;
    vLineColor: () => string;
  }

  it('should generate the PDF document with the main data', async () => {
    //Act
    const doc = await billReport(mockBill);

    //Assert
    expect(doc.images).toBeDefined();
    expect(doc.images && doc.images.logo).toBe('mockLogoBase64');
    expect(doc.content).toBeDefined();
    const contentArr = doc.content as Content[];

    const encabezado = contentArr[0] as ContentColumns;
    const columns = encabezado.columns as Array<{
      text: Array<{ text: string }>;
    }>;
    expect(columns[2].text[0].text).toContain(mockBill.clientCompanyName);

    const tablaProductos = contentArr[2] as { table: Table };
    expect(tablaProductos.table.body[1][1]).toBe('Producto A');
    expect(tablaProductos.table.body[2][1]).toBe('Producto B');

    const tablaTotales = contentArr[3] as { table: Table };
    expect(tablaTotales.table.body[0][1]).toBe('$ 250.00');
    expect(tablaTotales.table.body[1][1]).toBe('$ 52.50');

    const cell = tablaTotales.table.body[2][1];
    if (typeof cell === 'object' && cell !== null && 'text' in cell) {
      expect(cell.text).toBe('$ 302.50');
    } else {
      throw new Error('La celda no tiene la propiedad text');
    }

    const observaciones = contentArr[4] as { text: string };
    expect(observaciones.text).toContain(mockBill.observation);
  });
  it('should apply styles to the TOTAL cell', async () => {
    //Arrange
    const doc = await billReport(mockBill);
    //Assert
    const tablaTotales = (doc.content as Content[])[3] as { table: Table };
    const cell = tablaTotales.table.body[2][1];
    if (
      typeof cell === 'object' &&
      cell !== null &&
      'fillColor' in cell &&
      'color' in cell
    ) {
      expect(cell.fillColor).toBe('#65558f');
      expect(cell.color).toBe('white');
    } else {
      throw new Error('La celda no tiene estilos');
    }
  });
  it('should display the products in the table correctly', async () => {
    //Arrange
    const doc = await billReport(mockBill);
    //Assert
    const tablaProductos = (doc.content as Content[])[2] as { table: Table };
    expect(tablaProductos.table.body[1][1]).toBe('Producto A');
    expect(tablaProductos.table.body[2][1]).toBe('Producto B');
  });
  it('should calculate VAT and total correctly', async () => {
    //Arrange
    const billIVA = { ...mockBill, totalAmount: new Decimal(1000) };
    //Act
    const doc = await billReport(billIVA);
    //Assert
    const tablaTotales = (doc.content as Content[])[3] as { table: Table };
    expect(tablaTotales.table.body[0][1]).toBe('$ 1000.00');
    expect(tablaTotales.table.body[1][1]).toBe('$ 210.00');
    const cell = tablaTotales.table.body[2][1];
    if (typeof cell === 'object' && cell !== null && 'text' in cell) {
      expect(cell.text).toBe('$ 1210.00');
    } else {
      throw new Error('La celda no tiene la propiedad text');
    }
  });
  it('should display default text if there are no observations', async () => {
    //Arrange
    const billSinObs = { ...mockBill, observation: '' };
    //Act
    const doc = await billReport(billSinObs);
    //Assert
    const observaciones = (doc.content as Content[])[4] as { text: string };
    expect(observaciones.text).toContain('No se realizaron observaciones.');
  });
  it('should display the delivery method in the header', async () => {
    const doc = await billReport(mockBill);
    const encabezado = (doc.content as Content[])[0] as ContentColumns;
    const columns = encabezado.columns as Array<{
      text: Array<{ text: string }>;
    }>;
    const headerText = columns[3].text.map((t) => t.text).join('');
    expect(headerText).toContain('Método de entrega: Envío');
  });
  it('should display client data in the client table', async () => {
    const doc = await billReport(mockBill);
    const tablaCliente = (doc.content as Content[])[1] as { table: Table };
    expect(tablaCliente.table.body[0][1]).toBe(mockBill.clientCompanyName);
    expect(tablaCliente.table.body[1][1]).toBe(mockBill.clientDocumentNumber);
    expect(tablaCliente.table.body[2][1]).toBe(mockBill.clientTaxCategory);
    expect(tablaCliente.table.body[3][1]).toBe(mockBill.clientAddress);
    expect(tablaCliente.table.body[4][1]).toBe(mockBill.paymentType);
  });
  it('should handle empty orderItems array', async () => {
    const billEmpty = { ...mockBill, orderItems: [] };
    const doc = await billReport(billEmpty);
    const tablaProductos = (doc.content as Content[])[2] as { table: Table };
    expect(tablaProductos.table.body.length).toBe(1);
  });
  it('should handle empty orderItems array and only show table header', async () => {
    const billEmpty = { ...mockBill, orderItems: [] };
    const doc = await billReport(billEmpty);
    const tablaProductos = (doc.content as Content[])[2] as { table: Table };
    expect(tablaProductos.table.body.length).toBe(1);
  });
  it('should define a layout for the products table', async () => {
    const doc = await billReport(mockBill);
    const tablaProductos = (doc.content as Content[])[2] as {
      layout?: unknown;
      table: Table;
    };

    expect(tablaProductos.layout).toBeDefined();

    if (
      typeof tablaProductos.layout === 'object' &&
      tablaProductos.layout !== null
    ) {
      if (
        'hLineWidth' in tablaProductos.layout &&
        typeof (tablaProductos.layout as ProductTableLayout).hLineWidth ===
          'function'
      ) {
        expect((tablaProductos.layout as ProductTableLayout).hLineWidth()).toBe(
          1,
        );
        expect((tablaProductos.layout as ProductTableLayout).vLineWidth()).toBe(
          1,
        );
        expect((tablaProductos.layout as ProductTableLayout).hLineColor()).toBe(
          '#65558f',
        );
        expect((tablaProductos.layout as ProductTableLayout).vLineColor()).toBe(
          '#65558f',
        );
      }
    } else if (typeof tablaProductos.layout === 'string') {
      expect(typeof tablaProductos.layout).toBe('string');
    } else {
      throw new Error(
        'Product table layout is not defined as object or string',
      );
    }
  });
});
