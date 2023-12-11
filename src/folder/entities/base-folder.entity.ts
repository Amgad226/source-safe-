import { BaseEntity } from 'src/base-module/base-entity';
export class BaseFolderEntity extends BaseEntity {
  id: number;
  folder_id: number;
  name: string;
  logo: string;
  driveFolderID: string;
  created_at: Date;

  constructor({ id, folder_id, name, logo, driveFolderID,created_at }) {
    super();
    this.id = id;
    this.folder_id = folder_id;
    this.name = name;
    this.logo = logo;
    this.driveFolderID = driveFolderID;
    this.created_at = created_at;
  }

}
