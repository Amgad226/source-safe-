import { UserEntity } from 'src/auth/entities/common/user-entity';
import { collectDataBy } from 'src/base-module/base-entity';
import { BaseFileEntity } from 'src/file/entities/base-file.entity';
import { BaseFolderEntity } from './base-folder.entity';
export class FolderEntity extends BaseFolderEntity {
  files: BaseFileEntity[];
  members: any[];
  constructor({ id, folder_id, name, logo, driveFolderID, files, UserFolder }) {
    super({ id, folder_id, name, logo, driveFolderID });
    this.files = collectDataBy(BaseFileEntity, files);
    this.members = UserFolder.map(function (userFolderr) {
      return {
        user: new UserEntity(userFolderr.user),
        role: userFolderr.folder_role.name,
      };
    });
  }
}
