import { UserEntity } from '../common/user-entity';
import { TokensEntity } from '../create-token.entity';

export class SignUpEntity {
  tokens: TokensEntity;
  user: UserEntity;
}
