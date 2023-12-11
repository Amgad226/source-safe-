import { collectDataBy } from 'src/base-module/base-entity';
import { BaseFileEntity } from 'src/file/entities/base-file.entity';
import { FolderWithMemberEntity } from './folder-with-members.entity';
export class FolderEntity extends FolderWithMemberEntity {
  files: BaseFileEntity[];
  constructor({
    id,
    folder_id,
    name,
    logo,
    driveFolderID,
    created_at,
    files,
    UserFolder,
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at, UserFolder });
    this.files = collectDataBy(BaseFileEntity, files);
  }
}
