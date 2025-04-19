import { PartiallyInitializable } from '../partially-initializable';

export class UserSignInResponse extends PartiallyInitializable<UserSignInResponse> {
  access_token: string;
}
