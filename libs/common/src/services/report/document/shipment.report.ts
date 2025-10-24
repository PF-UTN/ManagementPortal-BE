import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

import { ShipmentReportGenerationDataDto } from '@mp/common/dtos';

import { DOG_URL } from '../../../constants';
import { urlToBase64 } from '../../../helpers';

export const shipmentReport = async (
  shipment: ShipmentReportGenerationDataDto,
): Promise<TDocumentDefinitions> => {
  const logoBase64 = await urlToBase64(DOG_URL);

  const header: Content = {
    columns: [
      { image: 'logo', width: 80, alignment: 'left' },
      {
        width: '*',
        stack: [
          { text: `Hoja de ruta #${shipment.shipmentId}`, style: 'h1' },
          {
            text: [
              { text: 'Fecha: ', bold: true },
              `${shipment.date.toLocaleDateString('es-AR')}   `,
              { text: 'Vehículo: ', bold: true },
              `${shipment.vehiclePlate}${shipment.vehicleDescription ? ` (${shipment.vehicleDescription})` : ''}   `,
              { text: 'Conductor: ', bold: true },
              `${shipment.driverName}${shipment.driverPhone ? ` - ${shipment.driverPhone}` : ''}`,
            ],
            margin: [0, 4, 0, 0],
          },
          {
            text: [
              shipment.estimatedKm != null
                ? `Km estimados: ${shipment.estimatedKm}   `
                : '',
              shipment.effectiveKm != null
                ? `Km efectivos: ${shipment.effectiveKm}   `
                : '',
              shipment.finishedAt
                ? `Finalizado: ${shipment.finishedAt.toLocaleString('es-AR')}`
                : '',
            ]
              .filter(Boolean)
              .join(''),
            fontSize: 9,
            color: '#555',
            margin: [0, 2, 0, 0],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 10],
  };

  const ordersTableHeader = [
    { text: 'Pedido', color: 'white', bold: true, alignment: 'center' },
    { text: 'Cliente', color: 'white', bold: true },
    { text: 'Dirección', color: 'white', bold: true },
    { text: 'Teléfono', color: 'white', bold: true, alignment: 'center' },
    { text: 'Entrega', color: 'white', bold: true, alignment: 'center' },
    { text: 'Total', color: 'white', bold: true, alignment: 'right' },
  ];

  const ordersRows = shipment.orders.map((o) => [
    { text: `#${o.orderId}`, alignment: 'center' },
    o.clientName,
    o.clientAddress,
    { text: o.clientPhone ?? '-', alignment: 'center' },
    { text: o.deliveryMethod, alignment: 'center' },
    { text: `$ ${o.totalAmount.toFixed(2)}`, alignment: 'right' },
  ]);

  const ordersTable: Content = {
    layout: {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#65558f' : null),
      hLineColor: () => '#ddd',
      vLineColor: () => '#ddd',
    },
    table: {
      widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
      headerRows: 1,
      body: [ordersTableHeader, ...ordersRows],
    },
  };

  const detailsPerOrder: Content[] = shipment.orders.map((o) => {
    const items = (o.items ?? []).map((it) => [
      { text: it.quantity.toString(), alignment: 'center' },
      it.productName,
      {
        text: it.unitPrice != null ? `$ ${it.unitPrice.toFixed(2)}` : '-',
        alignment: 'right',
      },
      {
        text:
          it.subtotalPrice != null ? `$ ${it.subtotalPrice.toFixed(2)}` : '-',
        alignment: 'right',
      },
    ]);

    return {
      stack: [
        {
          text: `Pedido #${o.orderId} - ${o.clientName}`,
          style: 'h2',
          margin: [0, 10, 0, 4],
        },
        {
          columns: [
            { text: `Dirección: ${o.clientAddress}` },
            { text: `Tel: ${o.clientPhone ?? '-'}`, alignment: 'right' },
          ],
          fontSize: 10,
          margin: [0, 0, 0, 4],
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            widths: ['auto', '*', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'Cant.', bold: true, alignment: 'center' },
                { text: 'Producto', bold: true },
                { text: 'Unit.', bold: true, alignment: 'right' },
                { text: 'Importe', bold: true, alignment: 'right' },
              ],
              ...items,
              [
                { text: '', colSpan: 2 },
                {},
                { text: 'TOTAL', bold: true, alignment: 'right' },
                {
                  text: `$ ${o.totalAmount.toFixed(2)}`,
                  bold: true,
                  alignment: 'right',
                },
              ],
            ],
          },
        },
      ],
    };
  });

  const qrSection: Content = shipment.routeLink
    ? {
        stack: [
          {
            text: 'Escanea el código para ver la ruta en Google Maps:',
            style: 'h2',
            margin: [0, 20, 0, 8],
          },
          { qr: shipment.routeLink, fit: 200, alignment: 'center' },
          {
            text: 'O accede directamente al enlace:',
            alignment: 'center',
            margin: [0, 12, 0, 4],
            fontSize: 10,
          },
          {
            text: shipment.routeLink,
            link: shipment.routeLink,
            color: '#1a73e8',
            decoration: 'underline',
            alignment: 'center',
            fontSize: 9,
          },
        ],
      }
    : { text: '' };

  return {
    images: { logo: logoBase64 },
    content: [
      header,
      ordersTable,
      { text: 'Detalle por pedido', style: 'h1', margin: [0, 12, 0, 4] },
      ...detailsPerOrder,
      qrSection,
    ],
    styles: {
      h1: { fontSize: 14, bold: true },
      h2: { fontSize: 12, bold: true },
    },
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 40, 40, 40],
  };
};
