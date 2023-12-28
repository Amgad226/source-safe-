import { BaseEntity } from 'src/base-module/base-entity';
import { FileStatusEnum } from '../enums/file-status.enum';
import { BaseFileStatisticEntity } from './base-file-statistic.entity';
import { UserEntity } from 'src/auth/entities/common/user-entity';

export class FileStatisticWithUserEntity extends BaseFileStatisticEntity {
  user: UserEntity;

  constructor({
    id,
    text,
    file_id,
    file_version_id,
    user_id,
    status,
    created_at,
    user,
  }) {
    super({
      id,
      text,
      file_id,
      file_version_id,
      user_id,
      status,
      created_at,
    });
    this.user = user;
  }
}
