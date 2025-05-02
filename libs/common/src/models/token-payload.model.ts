import { PartiallyInitializable } from '../dtos';

export class TokenPayload extends PartiallyInitializable<TokenPayload> {
  email: string;
  sub: number;
  role: string;
  permissions: string[];
}
