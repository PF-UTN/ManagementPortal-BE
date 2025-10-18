import { Test, TestingModule } from '@nestjs/testing';

import { SUPPORT_EMAIL } from './mailing.constants';
import { MailingService } from './mailing.service';

describe('MailingService', () => {
  let service: MailingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailingService],
    }).compile();

    service = module.get<MailingService>(MailingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a plain text mail', async () => {
    // Arrange
    const mockResult = { accepted: ['test@correo.com'] };
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(mockResult);

    // Act
    const result = await service.sendMailAsync(
      'test@correo.com',
      'Asunto',
      'Texto plano',
    );

    // Assert
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@correo.com',
        subject: 'Asunto',
        text: 'Texto plano',
      }),
    );
    expect(result).toBe(mockResult);
  });

  it('should send a mail with attachment', async () => {
    // Arrange
    const mockResult = { accepted: ['test@correo.com'] };
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(mockResult);

    const attachment = { filename: 'file.pdf', content: Buffer.from('test') };

    // Act
    const result = await service.sendMailWithAttachmentAsync(
      'test@correo.com',
      'Factura',
      '<b>HTML</b>',
      attachment,
    );

    // Assert
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@correo.com',
        subject: 'Factura',
        html: '<b>HTML</b>',
        attachments: [attachment],
      }),
    );
    expect(result).toBe(mockResult);
  });
  it('should send a mail with HTML body using sendNewStatusMailAsync', async () => {
    // Arrange
    const mockResult = { accepted: ['test@correo.com'] };
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(mockResult);

    const htmlBody = '<div>Estado actualizado</div>';

    // Act
    const result = await service.sendNewStatusMailAsync(
      'test@correo.com',
      'Estado actualizado',
      htmlBody,
    );

    // Assert
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@correo.com',
        subject: 'Estado actualizado',
        html: htmlBody,
      }),
    );
    expect(result).toBe(mockResult);
  });
  it('should send registration request approved email with correct subject and text', async () => {
    const mockResult = { accepted: ['user@example.com'] };
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(mockResult);

    const htmlBody = '<div>Solicitud aprobada</div>';

    const result = await service.sendRegistrationRequestApprovedEmailAsync(
      'user@example.com',
      htmlBody,
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Solicitud de Registro Aprobada',
        text: 'Tu solicitud de registro ha sido aprobada.',
        html: htmlBody,
      }),
    );
    expect(result).toBe(mockResult);
  });

  // Nuevo: enviar correo cuando la solicitud es rechazada
  it('should send registration request rejected email with note included and SUPPORT_EMAIL in text', async () => {
    const mockResult = { accepted: ['user@example.com'] };
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(mockResult);

    const htmlBody = '<div>Solicitud rechazada</div>';
    const note = 'Documentación incompleta';

    const result = await service.sendRegistrationRequestRejectedEmailAsync(
      'user@example.com',
      htmlBody,
      note,
    );

    const expectedText = `Tu solicitud de registro ha sido rechazada por el siguiente motivo: ${note}. Si crees que se trata de un error, por favor contactate con nosotros al email: ${SUPPORT_EMAIL}`;

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Solicitud de Registro Rechazada',
        text: expectedText,
        html: htmlBody,
      }),
    );
    expect(result).toBe(mockResult);
  });
});
