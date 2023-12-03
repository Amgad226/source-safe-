import { BaseEntity } from 'src/base-module/base-entity';
export class FolderEntity extends BaseEntity {
  id: number;
  folder_id: number;
  name: string;
  logo: string;
  driveFolderID: string;

  constructor({ id, folder_id, name, logo, driveFolderID }) {
    super();
    this.id = id;
    this.folder_id = folder_id;
    this.name = name;
    this.logo = logo;
    this.driveFolderID = driveFolderID;
  }

  static collect(items: any | any[]) {
    return super.collectData<FolderEntity>(FolderEntity, items);
  }
}
