export class UserEntity {
  id: number;
  email: string;
  name: string;
  constructor({ id, email, name }) {
    this.id = id;
    this.email = email;
    this.name = name;
  }
}
