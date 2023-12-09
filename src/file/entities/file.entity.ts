import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';
import { FileVersionEntity } from './file-version.entity';
import { FolderEntity } from 'src/folder/entities/folder.entity';
import { BaseFileEntity } from './base-file.entity';

export class FileEntity extends BaseFileEntity {
  folder?: FolderEntity;
  check_in?: [any] | [];
  check_out?: [any] | [];
  file_versions: FileVersionEntity[];
  constructor({
    id,
    name,
    extension,
    checked_in,
    folder_id,
    created_at,
    check_in = null,
    check_out = null,
    FileVersion,
    Folder = null,
  }) {
    super({
      id,
      name,
      extension,
      folder_id,
      created_at,
      FileVersion,
      checked_in,
    });
    this.check_in = check_in ? [{}] : [{}]; //FIXME
    this.check_out = check_out ? [{}] : [{}]; //FIXME
    this.folder = Folder ?? null;
    this.file_versions = collectDataBy(FileVersionEntity, FileVersion);
  }
}
