import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseEntity } from 'src/base-module/base-entity';

export class FileVersionEntity extends BaseEntity {
  id: number;
  path: string;
  name: string;
  size: number;
  user?: UserEntity;
  extension: string;

  created_at: Date;

  constructor({ id, path, name, extension, size, User }) {
    super();
    this.id = id;
    this.path = path;
    this.name = name;
    this.extension = extension;
    this.size = size;
    this.user = User ? new UserEntity(User) : null;
  }
}
