import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';
import { FileVersionEntity } from './file-version.entity';
import { FolderEntity } from 'src/folder/entities/folder.entity';

export class FileEntity extends BaseEntity {
  id: number;
  name: string;
  extension: string;
  checked_in: boolean;
  created_at: Date;
  folder_id: number;
  folder?: FolderEntity;
  file_versions?: FileVersionEntity[];
  constructor({
    id,
    name,
    extension,
    checked_in,
    folder_id,
    created_at,
    FileVersion=null,
    Folder=null,
  }) {
    super();
    this.id = id;
    this.name = name;
    this.extension = extension;
    this.checked_in = checked_in;
    this.folder_id = folder_id;
    this.created_at = created_at;
    this.folder = Folder ?? null;
    this.file_versions = FileVersion
      ? collectDataBy(FileVersionEntity, FileVersion)
      : [];
  }
}
