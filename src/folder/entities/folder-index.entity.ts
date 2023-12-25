import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseFolderEntity } from './base-folder.entity';
export class FolderIndexEntity extends BaseFolderEntity {
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
    folder_size
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at });
    this.files_count = files.length;
    this.folder_size = folder_size;

  }
}
