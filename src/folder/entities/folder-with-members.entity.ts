import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseFolderEntity } from './base-folder.entity';
export class FolderWithMemberEntity extends BaseFolderEntity {
  members: any[];
  constructor({
    id,
    folder_id,
    name,
    logo,
    driveFolderID,
    created_at,
    UserFolder,
  }) {
    super({ id, folder_id, name, logo, driveFolderID, created_at });
    this.members = UserFolder.map(function (userFolderr) {
      return {
        user: new UserEntity(userFolderr.user),
        role: userFolderr.folder_role.name,
      };
    });
  }
}
