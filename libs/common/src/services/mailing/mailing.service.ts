import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import {
  MAIL_FROM,
  MAIL_HOST,
  MAIL_PASS,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  SUPPORT_EMAIL,
} from './mailing.constants';

@Injectable()
export class MailingService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_SECURE,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  async sendMailAsync(to: string, subject: string, text: string) {
    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      text,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendNewStatusMailAsync(to: string, subject: string, htmlBody: string) {
    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      html: htmlBody,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendRegistrationRequestApprovedEmailAsync(to: string) {
    const subject = 'Solicitud de Registro Aprobada';
    const text = 'Tu solicitud de registro ha sido aprobada.';

    return await this.sendMailAsync(to, subject, text);
  }

  async sendRegistrationRequestRejectedEmailAsync(to: string, note: string) {
    const subject = 'Solicitud de Registro Rechazada';
    const text = `Tu solicitud de registro ha sido rechazada por el siguiente motivo: ${note}. Si crees que se trata de un error, por favor contactate con nosotros al email: ${SUPPORT_EMAIL}`;

    return await this.sendMailAsync(to, subject, text);
  }

  async sendPasswordResetEmailAsync(to: string, url: string) {
    const subject = 'Solicitud de Recuperación de Contraseña';
    const text = `Has solicitado recuperar tu contraseña. Por favor, haz clic en el siguiente enlace para restablecerla: ${url}`;

    return await this.sendMailAsync(to, subject, text);
  }

  async sendAccountLockedEmailAsync(to: string, lockedUntil: Date) {
    const subject = 'Cuenta Bloqueada';
    const text = `Tu cuenta ha sido bloqueada debido a demasiados intentos de inicio de sesión fallidos. La cuenta permanecerá bloqueada hasta el ${lockedUntil.toLocaleString()}. Puedes recuperar el acceso a tu cuenta restableciendo tu contraseña.`;

    return await this.sendMailAsync(to, subject, text);
  }

  async sendMailWithAttachmentAsync(
    to: string,
    subject: string,
    htmlBody: string,
    attachment: { filename: string; content: Buffer },
  ) {
    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      html: htmlBody,
      attachments: [attachment],
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
