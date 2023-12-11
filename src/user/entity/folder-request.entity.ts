import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';

import { BaseFolderEntity } from 'src/folder/entities/base-folder.entity';
import { FolderWithMemberFileCountEntity } from 'src/folder/entities/folder-members-files-count.entity';
export class FolderRequestEntity extends BaseEntity {

  id:number;
  folder:FolderWithMemberFileCountEntity

  constructor({
    id,
    folder,

  }) {
    super();
    this.id = id;
    this.folder =new FolderWithMemberFileCountEntity(folder)
  }
}
