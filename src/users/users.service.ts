import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  public users: any;
  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'amgad',
        password: 'amgad123',
      },
      {
        userId: 2,
        username: 'ayham',
        password: 'amgad123',
      },
    ];
  }

  async findOne(username) {
    return this.users.find((user) => user.username === username);
  }
}
