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
  functionCall: string;
  data?: AfterUploadDataType;
};

export type AfterUploadDataType = FileDataType | FolderDataType;

export type FileDataType = {
  fileId: number;
};

export type FolderDataType = {
  folderId: number;
};
