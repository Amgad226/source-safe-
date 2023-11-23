import { UserEntity } from '../common/user-entity';
import { TokensEntity } from '../create-token.entity';

export class SignInEntity {
  tokens: TokensEntity;
  user: UserEntity;
  constructor({ user, tokens }) {
    this.tokens = new TokensEntity(tokens);
    this.user = new UserEntity(user);
  }
}
