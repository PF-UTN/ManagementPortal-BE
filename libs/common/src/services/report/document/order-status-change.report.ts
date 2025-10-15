import { DOG_URL } from '@mp/common/constants';
import { OrderDetailsDto } from '@mp/common/dtos';

export function orderStatusChangeReport(
  order: OrderDetailsDto,
  newStatus: string,
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
          .estado {
            font-size: 1.3em;
            color: #fff;
            background: #65558f;
            padding: 10px 0;
            border-radius: 8px;
            margin: 18px 0;
            font-weight: bold;
            text-align: center;
            letter-spacing: 1px;
            box-shadow: 0 1px 4px rgba(101,85,143,0.12);
          }
          .footer {
            font-size: 0.95em;
            color: #888;
            text-align: center;
            margin-top: 28px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src=${DOG_URL} alt="Logo" />
          <h1>Cambio de estado de tu pedido</h1>
          <p class="info">Hola <b>${order.client.companyName}</b>,</p>
          <p class="info">Tu pedido <b>#${order.id}</b> ha cambiado de estado a:</p>
          <div class="estado">${newStatus}</div>
          <p class="info">¡Gracias por confiar en nosotros!</p>
          <div class="footer">Este es un mensaje automático, no respondas este correo.</div>
        </div>
      </body>
    </html>
  `;
}
