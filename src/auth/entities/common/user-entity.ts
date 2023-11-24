import { BaseEntity } from 'src/base-module/base-entity';
export class UserEntity extends BaseEntity {
  id: number;
  email: string;
  name: string;

  constructor({ id, email, name }) {
    super();
    this.id = id;
    this.email = email;
    this.name = name;
  }

  static collect(items: any | any[]) {
    return super.collectData<UserEntity>(UserEntity, items);
  }
}
