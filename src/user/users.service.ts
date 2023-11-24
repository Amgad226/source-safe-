import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  public users: any;
    
  constructor(private prisma: PrismaService,private redis: RedisService,) {
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

  async user() {
    this.redis.addToBlacklist('e12ee12qwedwkcabweye1x')
    let usersFromDatabase = await this.prisma.user.findMany();
    return UserEntity.collect(usersFromDatabase);
  }

  async findOne(username) {
    return this.users.find((user) => user.username === username);
  }
}
