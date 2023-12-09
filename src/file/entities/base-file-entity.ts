import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';

export class BaseFileEntity extends BaseEntity {
  id: number;
  name: string;
  extension: string;
  checked_in: boolean;
  latest_path: string;
  created_at: Date;
  folder_id: number;

  constructor({
    id,
    name,
    extension,
    checked_in,
    folder_id,
    created_at,
    FileVersion,
  }) {
    super();
    this.id = id;
    this.name = name;
    this.extension = extension;
    this.checked_in = checked_in;
    this.folder_id = folder_id;
    this.latest_path = FileVersion[FileVersion.length - 1].path;
    this.created_at = created_at;
  }
}
