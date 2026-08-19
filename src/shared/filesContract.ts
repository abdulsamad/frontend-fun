import { fileData } from '../context/types';

export interface FilesPayload { filesData: fileData[] }
export interface FilesResponse { id?: string; filesData?: fileData[]; msg?: string; err?: string }
