import { BaseEntity } from 'src/base-module/base-entity';
import { FolderEntity } from 'src/folder/entities/folder.entity';
export class FolderRequestEntity extends BaseEntity {
  id: number;
  folder: FolderEntity;

  constructor({ id,folder}) {
    super();
    this.id = id;
    this.folder = new FolderEntity(folder);
  }
}
