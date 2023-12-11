import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseFolderEntity } from './base-folder.entity';
import { FolderWithMemberEntity } from './folder-with-members.entity';
import { log } from 'console';
export class FolderWithMemberFileCountEntity extends FolderWithMemberEntity {
  file_counts: any[];
  constructor({
    id,
    folder_id,
    name,
    logo,
    driveFolderID,
    created_at,
    UserFolder,

    files,
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at, UserFolder });
    this.file_counts = files.length ?? 0;
  }
}
