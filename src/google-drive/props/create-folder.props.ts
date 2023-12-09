import { UtilsAfterJobFunctionEnum } from "../utils-after-jobs.service";

export interface CreateFolderProps {
  folderName: string;
  parentFolderId: string;
  afterUpload: AfterUploadType;
}
export interface FileProps {
  originalname: string;
  filename: string;
  mimetype: string;
  localPath: string;
  size?: number;
  folderDriveId: string | number;
  afterUpload?: AfterUploadType;
}
export type AfterUploadType = {
  functionCall: UtilsAfterJobFunctionEnum;
  data?: AfterUploadDataType;
};

export type AfterUploadDataType = FileVersionDataType | FolderDataType;

export type FileVersionDataType = {
  fileVersionId: number;
};

export type FolderDataType = {
  folderId: number;
};
