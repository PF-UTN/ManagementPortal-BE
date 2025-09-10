import { join } from 'path';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { PurchaseOrderReportGenerationDataDto } from '@mp/common/dtos';

const logo: Content = {
  image: join(process.cwd(), 'public', 'images', 'dog.png'),
  width: 120,
};

export const purchaseOrderReport = (
  purchaseOrder: PurchaseOrderReportGenerationDataDto,
): TDocumentDefinitions => {
  return {
    content: [
      {
        columns: [
          logo,
          {
            text: [
              {
                text: `ORDEN DE COMPRA #${purchaseOrder.purchaseOrderId}\n`,
                bold: true,
                fontSize: 16,
              },
              {
                text: '\nFecha de emisión: ',
                bold: true,
                fontSize: 10,
              },
              {
                text: purchaseOrder.createdAt.toLocaleDateString('es-AR'),
                fontSize: 10,
              },
              {
                text: '\nFecha de entrega: ',
                bold: true,
                fontSize: 10,
              },
              {
                text: purchaseOrder.estimatedDeliveryDate.toLocaleDateString(
                  'es-AR',
                ),
                fontSize: 10,
              },
            ],
            alignment: 'right',
          },
        ],
      },

      {
        columns: [
          {
            text: [
              {
                text: '\nCUIT: ',
                bold: true,
              },
              {
                text: '30-12345678-9\n',
              },
              {
                text: 'IVA: ',
                bold: true,
              },
              {
                text: 'Responsable Inscripto\n',
              },
              {
                text: 'Dirección: ',
                bold: true,
              },
              {
                text: 'Zeballos 1341, Rosario, Santa Fe',
              },
            ],
          },
          {
            text: [
              {
                text: '\nProveedor: ',
                bold: true,
              },
              {
                text: `${purchaseOrder.supplierBusinessName}\n`,
              },
              {
                text: 'Tipo Doc.: ',
                bold: true,
              },
              {
                text: `${purchaseOrder.supplierDocumentType}\n`,
              },
              {
                text: 'Nro. Doc.: ',
                bold: true,
              },
              {
                text: `${purchaseOrder.supplierDocumentNumber}\n`,
              },
            ],
            alignment: 'right',
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

            ...purchaseOrder.purchaseOrderItems.map((item) => [
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
                text: `$ ${purchaseOrder.totalAmount.toFixed(2)}`,
                alignment: 'right',
                bold: true,
              },
            ],
            [
              { text: 'IVA 10.5%', colSpan: 3, alignment: 'right', bold: true },
              {},
              {},
              {
                text: `$ ${(purchaseOrder.totalAmount * 0.105).toFixed(2)}`,
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
                text: `$ ${(purchaseOrder.totalAmount * 1.105).toFixed(2)}`,
                alignment: 'right',
                bold: true,
                fillColor: '#65558f',
                color: 'white',
              },
            ],
          ],
        },
      },

      {
        text: `Observaciones: ${purchaseOrder.observation}`,
        italics: true,
      },
    ],
  };
};
