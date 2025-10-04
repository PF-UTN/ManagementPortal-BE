import { Decimal } from '@prisma/client/runtime/library';
import { ContentColumns, Content, Table } from 'pdfmake/interfaces';

import { BillReportGenerationDataDto } from '@mp/common/dtos';

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

  it('debe generar el documento PDF con los datos principales', async () => {
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
});
