import { DOG_URL } from '@mp/common/constants';
import { PurchaseOrderReportGenerationDataDto } from '@mp/common/dtos';

export function purchaseOrderHtmlReport(
  purchaseOrder: PurchaseOrderReportGenerationDataDto,
): string {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f7f6fb;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 480px;
            margin: 40px auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(101,85,143,0.08);
            padding: 32px 24px;
          }
          .logo {
            display: block;
            margin: 0 auto 18px auto;
            max-width: 120px;
            height: auto;
          }
          h1 {
            color: #65558f;
            font-size: 1.7em;
            margin-bottom: 16px;
            text-align: center;
          }
          .info {
            font-size: 1.1em;
            color: #444;
            margin-bottom: 12px;
            text-align: center;
          }
          .footer {
            font-size: 0.95em;
            color: #888;
            text-align: center;
            margin-top: 28px;
          }
          .orden {
            background: #e9e6f3;
            color: #65558f;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 18px;
            font-size: 1em;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="${DOG_URL}" alt="Logo" />
          <h1>Orden de compra generada</h1>
          <p class="info">Hola <b>${purchaseOrder.supplierBusinessName}</b>,</p>
          <p class="info">Te enviamos la orden de compra <b>#${purchaseOrder.purchaseOrderId}</b> correspondiente a tu empresa.</p>
          <p class="info">Fecha de emisión: <b>${purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString() : 'No disponible'}</b></p>
          <div class="orden">
            Adjuntamos la orden de compra en PDF a este correo.
          </div>
          <p class="info">Total: <b>$${purchaseOrder.totalAmount}</b></p>
          <p class="info">Observaciones: <b>${purchaseOrder.observation && purchaseOrder.observation.trim() !== '' ? purchaseOrder.observation : 'Sin observaciones'}</b></p>
          <div class="footer">Este es un mensaje automático, no respondas este correo.</div>
        </div>
      </body>
    </html>
  `;
}
