import { JwtModule } from '@nestjs/jwt';

const SECRET = process.env.JWT_SECRET;
const EXPIRATION = process.env.JWT_EXPIRATION;

export const JWT = JwtModule.register({
  global: true,
  secret: SECRET,
  signOptions: { expiresIn: EXPIRATION },
});
