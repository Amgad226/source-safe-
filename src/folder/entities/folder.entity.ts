import { collectDataBy } from 'src/base-module/base-entity';
import { BaseFileEntity } from 'src/file/entities/base-file.entity';
import { FolderWithMemberEntity } from './folder-with-members.entity';
export class FolderWithFilesEntity extends FolderWithMemberEntity {
  files: BaseFileEntity[];
  files_count :number ;
  folder_size :number ;
  constructor({
    id,
    folder_id,
    name,
    logo,
    driveFolderID,
    created_at,
    files,
    UserFolder,
    folder_size=0
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at, UserFolder });
    this.files_count = files.length;
    this.folder_size = folder_size;
    this.files = collectDataBy(BaseFileEntity, files);

  }
}
