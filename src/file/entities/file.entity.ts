import { BaseEntity, collectDataBy } from 'src/base-module/base-entity';
import { FileVersionEntity } from './file-version.entity';
import { BaseFileEntity } from './base-file.entity';
import { FolderWithMemberEntity } from 'src/folder/entities/folder-with-members.entity';
import { FileStatisticWithUserEntity } from './file-statistic-with-user.entity';
import { isArray } from 'class-validator';
import { BaseFolderEntity } from 'src/folder/entities/base-folder.entity';

export class FileEntity extends BaseFileEntity {
  folder?: FolderWithMemberEntity | BaseFolderEntity;
  file_versions: FileVersionEntity[];
  full_size: number | string;
  latest_size: number | string;
  last_action_on_file: FileStatisticWithUserEntity;
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
    FileStatistic = null,
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
    //TODO must refactor this entity 
    this.folder = Folder?.UserFolder?.user
      ? new FolderWithMemberEntity(Folder)
      : Folder
      ? new BaseFolderEntity(Folder)
      : null;
    this.full_size = full_size ?? 'not_loaded_data';
    if (latest_size != null) {
      this.latest_size = latest_size;
    } else {
      if (isArray(FileVersion)) {
        this.latest_size = FileVersion[0]?.size;
      } else {
        this.latest_size = 'not_loaded_data';
      }
    }

    this.file_versions = collectDataBy(FileVersionEntity, FileVersion);
    if (FileStatistic != null) {
      this.last_action_on_file = new FileStatisticWithUserEntity(
        FileStatistic[0],
      );
    }
  }
}
