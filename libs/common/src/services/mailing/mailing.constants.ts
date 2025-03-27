const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = parseInt(process.env.MAIL_PORT ?? '587');
const MAIL_SECURE = process.env.MAIL_SECURE === 'true';
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS, MAIL_FROM, SUPPORT_EMAIL };
