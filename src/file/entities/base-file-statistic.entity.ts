import { BaseEntity } from 'src/base-module/base-entity';
import { FileStatusEnum } from '../enums/file-status.enum';

export class BaseFileStatisticEntity extends BaseEntity {
  id: number;
  text: string;
  status: FileStatusEnum;
  user_id: number;
  file_id: number;
  file_version_id: number;
  created_at: Date;

  constructor({
    id,
    text,
    file_id,
    file_version_id,
    user_id,
    status,
    created_at,
  }) {
    super();
    this.id = id;
    this.text = text;
    this.status = status;
    this.file_id = file_id;
    this.file_version_id = file_version_id;
    this.user_id = user_id;
    this.created_at = created_at;
  }
}
