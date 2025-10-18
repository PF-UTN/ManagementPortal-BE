import { DOG_URL } from '@mp/common/constants';

import { SUPPORT_EMAIL } from '../../mailing/mailing.constants';

export function rejectRegistrationRequestHtmlReport(params: {
  applicantName: string;
  requestId: number | string;
  rejectionReason?: string;
  contactEmail?: string;
  rejectionDate?: string | Date;
}): string {
  const {
    applicantName,
    requestId,
    rejectionReason,
    contactEmail = SUPPORT_EMAIL,
    rejectionDate,
  } = params;

  const dateStr = rejectionDate
    ? new Date(rejectionDate).toLocaleDateString()
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
            color: #d64343;
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
            background: #fdecea;
            color: #a12b2b;
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
          .contact {
            margin-top: 14px;
            font-size: 0.98em;
            color: #333;
          }
          a.contact-link {
            color: #2a6fbd;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="${DOG_URL}" alt="Logo" />
          <h1>Solicitud de registro no aprobada</h1>

          <p class="info">Hola <b>${applicantName}</b>,</p>

          <p class="info">
            Lamentamos informarte que tu solicitud de registro <b>#${requestId}</b> no ha sido aprobada.
          </p>

          <div class="highlight">Revisión: <b>${dateStr}</b></div>

          ${
            rejectionReason
              ? `<p class="info">Motivo: <b>${rejectionReason}</b></p>`
              : `<p class="info">No se proporcionó un motivo específico.</p>`
          }

          <p class="info">
            Si tienes dudas o deseas más detalles sobre la decisión, por favor comunícate con nuestro equipo:
          </p>

          <p class="contact">
            Correo de contacto: <a class="contact-link" href="mailto:${contactEmail}">${contactEmail}</a>
          </p>

          <p class="info">Gracias por tu interés y disculpa las molestias.</p>

          <div class="footer">Este es un mensaje automático, por favor no respondas directamente a este correo.</div>
        </div>
      </body>
    </html>
  `;
}
