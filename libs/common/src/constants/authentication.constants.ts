import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const SECRET = process.env.JWT_SECRET;

export const JWT = JwtModule.registerAsync({
  global: true,
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
  }),
  inject: [ConfigService],
});
