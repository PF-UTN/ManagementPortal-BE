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
            width: 'auto',
            table: {
              body: [
                [
                  {
                    text: facturaTipo,
                    alignment: 'center',
                    fontSize: 48,
                    bold: true,
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 2,
              vLineWidth: () => 2,
              hLineColor: () => '#65558f',
              vLineColor: () => '#65558f',
            },
            alignment: 'center',
          },
          {
            width: '*',
            text: [
              {
                text: `FACTURA #${bill.billId}\n`,
                bold: true,
                fontSize: 16,
              },
              {
                text: '\nFecha de emisión: ',
                bold: true,
                fontSize: 10,
              },
              {
                text: bill.createdAt.toLocaleDateString('es-AR'),
                fontSize: 10,
              },
              {
                text: '\nMétodo de entrega: ',
                bold: true,
                fontSize: 10,
              },
              {
                text: bill.deliveryMethod,
                fontSize: 10,
              },
            ],
            alignment: 'right',
          },
        ],
        columnGap: 150,
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            text: [
              {
                text: '\nCliente: ',
                bold: true,
              },
              {
                text: `${bill.clientCompanyName}\n`,
              },
              {
                text: 'CUIT/DNI: ',
                bold: true,
              },
              {
                text: `${bill.clientDocumentNumber}\n`,
              },
              {
                text: 'IVA: ',
                bold: true,
              },
              {
                text: `${bill.clientTaxCategory}\n`,
              },
              {
                text: 'Dirección: ',
                bold: true,
              },
              {
                text: `${bill.clientAddress}\n`,
              },
              {
                text: 'Tipo de pago: ',
                bold: true,
              },
              {
                text: `${bill.paymentType}\n`,
              },
            ],
          },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20],
      },

      {
        margin: [0, 20],
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) {
              return '#65558f';
            }
            return rowIndex % 2 === 0 ? '#f9f7fc' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              { text: 'Producto', bold: true, color: 'white' },
              {
                text: 'Precio',
                bold: true,
                color: 'white',
                alignment: 'right',
              },
              {
                text: 'Cantidad',
                bold: true,
                color: 'white',
                alignment: 'center',
              },
              { text: 'Total', bold: true, color: 'white', alignment: 'right' },
            ],

            ...bill.orderItems.map((item) => [
              item.productName,
              { text: `$ ${item.unitPrice.toFixed(2)}`, alignment: 'right' },
              { text: item.quantity.toString(), alignment: 'center' },
              {
                text: `$ ${item.subtotalPrice.toFixed(2)}`,
                alignment: 'right',
              },
            ]),

            [
              { text: 'Subtotal', colSpan: 3, alignment: 'right', bold: true },
              {},
              {},
              {
                text: `$ ${bill.totalAmount.toFixed(2)}`,
                alignment: 'right',
                bold: true,
              },
            ],
            [
              { text: 'IVA', colSpan: 3, alignment: 'right', bold: true },
              {},
              {},
              {
                text: `$ ${(Number(bill.totalAmount) * 0.21).toFixed(2)}`,
                alignment: 'right',
                bold: true,
              },
            ],
            [
              {
                text: 'Total',
                colSpan: 3,
                alignment: 'right',
                bold: true,
                fillColor: '#65558f',
                color: 'white',
              },
              {},
              {},
              {
                text: `$ ${(Number(bill.totalAmount) * 1.21).toFixed(2)}`,
                alignment: 'right',
                bold: true,
                fillColor: '#65558f',
                color: 'white',
              },
            ],
          ],
        },
      },

      bill.observation
        ? {
            text: `Observaciones: ${bill.observation}`,
            italics: true,
          }
        : {
            text: `Observaciones: No se realizaron observaciones.`,
            italics: true,
          },
    ],
  };
};
