import { BaseFileEntity } from './base-file.entity';

export class folderRequestsFileEntity {
  file: BaseFileEntity;
  user: any;
  constructor(file) {
    this.file = file;
    this.user = null;
  }
}
