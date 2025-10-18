import { DOG_URL } from '@mp/common/constants';

export function approveRegistrationRequestHtmlReport(params: {
  applicantName: string;
  requestId: number | string;
  approvedBy?: string;
  message?: string;
  approvalDate?: string | Date;
}): string {
  const { applicantName, requestId, approvalDate } = params;

  const dateStr = approvalDate
    ? new Date(approvalDate).toLocaleDateString()
    : 'No disponible';

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
            font-size: 1.4em;
            margin-bottom: 12px;
            text-align: center;
          }
          .info {
            font-size: 1em;
            color: #444;
            margin-bottom: 12px;
            text-align: left;
          }
          .highlight {
            background: #e9f6ee;
            color: #1b7a4a;
            padding: 10px;
            border-radius: 8px;
            margin: 12px 0;
            font-weight: 600;
            text-align: center;
          }
          .footer {
            font-size: 0.95em;
            color: #888;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="${DOG_URL}" alt="Logo" />
          <h1>Solicitud de registro aprobada</h1>

          <p class="info">Hola <b>${applicantName}</b>,</p>

          <p class="info">
            Tu solicitud de registro <b>#${requestId}</b> ha sido aprobada.
          </p>

          <div class="highlight">Aprobada el: <b>${dateStr}</b></div>

          <p class="info">Ya puedes iniciar sesión.</p>

          <div class="footer">Este es un mensaje automático, por favor no respondas este correo.</div>
        </div>
      </body>
    </html>
  `;
}
