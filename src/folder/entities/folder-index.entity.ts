import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseFolderEntity } from './base-folder.entity';
import { FolderWithMemberEntity } from './folder-with-members.entity';
export class FolderIndexEntity extends FolderWithMemberEntity  {
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
    folder_size,
    UserFolder
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at,UserFolder });
    this.files_count = files.length;
    this.folder_size = folder_size;

  }
}
