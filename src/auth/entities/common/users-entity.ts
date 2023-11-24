import { UserEntity } from "./user-entity";

export class UsersEntity {
  users: [UserEntity];

  constructor({ users }) {
    this.users = users;
  }
}
