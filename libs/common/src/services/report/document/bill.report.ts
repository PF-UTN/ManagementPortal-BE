import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { BillReportGenerationDataDto } from '@mp/common/dtos';

import { DOG_URL } from '../../../constants';
import { urlToBase64 } from '../../../helpers';

export const billReport = async (
  bill: BillReportGenerationDataDto,
): Promise<TDocumentDefinitions> => {
  const logoBase64 = await urlToBase64(DOG_URL);

  let facturaTipo = 'B';
  if (bill.clientDocumentType === 'CUIT') {
    facturaTipo = 'A';
  }

  return {
    images: { logo: logoBase64 },
    content: [
      {
        columns: [
          { image: 'logo', width: 80, alignment: 'left' },
          {
            width: 60,
            table: {
              body: [
                [
                  {
                    text: facturaTipo,
                    alignment: 'center',
                    fontSize: 36,
                    bold: true,
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#65558f',
              vLineColor: () => '#65558f',
            },
            margin: [10, 0, 10, 0],
          },
          {
            width: '*',
            text: [
              { text: `${bill.clientCompanyName}\n`, bold: true, fontSize: 14 },
              { text: `CUIT: ${bill.clientDocumentNumber}\n`, fontSize: 10 },
              {
                text: `Categoría IVA: ${bill.clientTaxCategory}\n`,
                fontSize: 10,
              },
            ],
            margin: [10, 0, 0, 0],
          },
          {
            width: 'auto',
            text: [
              { text: `FACTURA Nº ${bill.billId}\n`, bold: true, fontSize: 14 },
              {
                text: `Fecha: ${bill.createdAt.toLocaleDateString('es-AR')}\n`,
                fontSize: 10,
              },
              {
                text: `Método de entrega: ${bill.deliveryMethod}\n`,
                fontSize: 10,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [{ text: 'Señor(es):', bold: true }, bill.clientCompanyName],
            [{ text: 'CUIT/DNI:', bold: true }, bill.clientDocumentNumber],
            [{ text: 'IVA:', bold: true }, bill.clientTaxCategory],
            [{ text: 'Dirección:', bold: true }, bill.clientAddress],
            [{ text: 'Tipo de pago:', bold: true }, bill.paymentType],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },
      {
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#65558f' : null),
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd',
        },
        table: {
          widths: ['auto', '*', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                text: 'Cant.',
                color: 'white',
                bold: true,
                alignment: 'center',
              },
              { text: 'Descripción', color: 'white', bold: true },
              {
                text: 'Precio Unit.',
                color: 'white',
                bold: true,
                alignment: 'right',
              },
              {
                text: 'Importe',
                color: 'white',
                bold: true,
                alignment: 'right',
              },
            ],
            ...bill.orderItems.map((item) => [
              { text: item.quantity.toString(), alignment: 'center' },
              item.productName,
              { text: `$ ${item.unitPrice.toFixed(2)}`, alignment: 'right' },
              {
                text: `$ ${item.subtotalPrice.toFixed(2)}`,
                alignment: 'right',
              },
            ]),
          ],
        },
      },
      {
        alignment: 'right',
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Subtotal', bold: true },
              `$ ${bill.totalAmount.toFixed(2)}`,
            ],
            [
              { text: 'IVA (21%)', bold: true },
              `$ ${(Number(bill.totalAmount) * 0.21).toFixed(2)}`,
            ],
            [
              {
                text: 'TOTAL',
                bold: true,
                fillColor: '#65558f',
                color: 'white',
              },
              {
                text: `$ ${(Number(bill.totalAmount) * 1.21).toFixed(2)}`,
                bold: true,
                fillColor: '#65558f',
                color: 'white',
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 0],
      },

      {
        text: `Observaciones: ${bill.observation || 'No se realizaron observaciones.'}`,
        italics: true,
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
