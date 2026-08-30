import { ProjectFile } from '../state/types';

export interface FilesPayload { filesData: ProjectFile[] }
export interface FilesResponse { id?: string; version?: string; filesData?: ProjectFile[]; msg?: string; err?: string }
