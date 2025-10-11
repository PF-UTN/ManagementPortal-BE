import { Test, TestingModule } from '@nestjs/testing';

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
});
