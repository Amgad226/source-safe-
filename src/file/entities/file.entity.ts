import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';
import { FileVersionEntity } from './file-version.entity';
import { FolderEntity } from 'src/folder/entities/folder.entity';

export class FileEntity extends BaseEntity {
  id: number;
  name: string;
  extension: string;
  checked_in: boolean;
  latest_path: string;
  created_at: Date;
  folder_id: number;
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
    super();
    this.id = id;
    this.name = name;
    this.extension = extension;
    this.checked_in = checked_in;
    this.folder_id = folder_id;
    this.latest_path = FileVersion[FileVersion.length - 1].path;
    this.created_at = created_at;
    this.check_in = check_in ? [{}] : [{}]; //FIXME
    this.check_out = check_out ? [{}] : [{}]; //FIXME
    this.folder = Folder ?? null;
    this.file_versions = collectDataBy(FileVersionEntity, FileVersion);
  }
}
