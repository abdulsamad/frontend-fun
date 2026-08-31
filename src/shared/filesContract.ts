import { PreviewDependency, ProjectFile } from '../state/types';

export interface FilesPayload { filesData: ProjectFile[]; dependencies?: PreviewDependency[] }
export interface FilesResponse { id?: string; version?: string; filesData?: ProjectFile[]; dependencies?: PreviewDependency[]; msg?: string; err?: string }
