export class MailingServiceMock {
  sendMailAsync = jest.fn();
  sendRegistrationRequestApprovedEmailAsync = jest.fn();
  sendRegistrationRequestRejectedEmailAsync = jest.fn();
  sendPasswordResetEmailAsync = jest.fn();
  sendAccountLockedEmailAsync = jest.fn();
}
