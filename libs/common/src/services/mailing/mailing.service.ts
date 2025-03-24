import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MAIL_FROM, MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_SECURE, MAIL_USER } from './mailing.constants';

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
}
