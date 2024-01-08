import { BaseEntity } from 'src/base-module/base-entity';
import { FileStatusEnum } from '../enums/file-status.enum';

export class BaseFileEntity extends BaseEntity {
  id: number;
  name: string;
  extension: string;
  latest_path: string;
  status: FileStatusEnum;
  created_at: Date;
  folder_id: number;
  last_modified: Date;
  constructor({
    id,
    name,
    extension,
    folder_id,
    status,
    created_at,
    FileVersion,
  }) {
    super();
    this.id = id;
    this.name = name;
    this.extension = extension;
    this.status = status;
    this.folder_id = folder_id;
    this.created_at = created_at;
    this.latest_path = FileVersion[0]?.path ?? 'not_found_data';
    this.last_modified = FileVersion[0]?.created_at ?? 'not_found_data';
  }
}
