export class MailingServiceMock {
  sendMailAsync = jest.fn();
  sendRegistrationRequestApprovedEmailAsync = jest.fn();
  sendRegistrationRequestRejectedEmailAsync = jest.fn();
}
