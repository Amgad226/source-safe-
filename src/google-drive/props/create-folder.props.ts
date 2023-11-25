export interface CreateFolderProps {
  folderName:string;
  parentFolderId:string;
  folderIdDb:number;
}
export interface FileProps {
  originalname: string;
  filename: string;
  mimetype: string;
  localPath: string;
  size?: number;
  folderDriveId: string | number;
  DbFileId?: number;
}
