import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';
import { FileVersionEntity } from './file-version.entity';
import { BaseFileEntity } from './base-file.entity';
import { FolderWithMemberEntity } from 'src/folder/entities/folder-with-members.entity';
import { FileStatisticWithUserEntity } from './file-statistic-with-user.entity';

export class FileEntity extends BaseFileEntity {
  folder?: FolderWithMemberEntity;
  file_versions: FileVersionEntity[];
  full_size: number|string;
  latest_size: number|string;
  last_action_on_file:FileStatisticWithUserEntity
  constructor({
    id,
    name,
    extension,
    folder_id,
    status,
    created_at,
    FileVersion,
    Folder = null,
    full_size = null,
    latest_size = null,
    FileStatistic=null
  }) {
    super({
      id,
      name,
      extension,
      status,
      folder_id,
      created_at,
      FileVersion,
    });
    this.folder = new FolderWithMemberEntity(Folder) ?? null;
    this.full_size = full_size ?? 'not_loaded_data';
    this.latest_size = latest_size ?? 'not_loaded_data';
    this.file_versions = collectDataBy(FileVersionEntity, FileVersion);
    if(FileStatistic!= null){
      this.last_action_on_file= new FileStatisticWithUserEntity(FileStatistic[0]);
    }
  }
}
