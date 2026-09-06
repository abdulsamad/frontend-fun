import { PreviewDependency, ProjectFile } from '../state/types';

export const MAX_PROJECT_SIZE = 5 * 1024 * 1024;

export interface FilesPayload { filesData: ProjectFile[]; dependencies?: PreviewDependency[] }
export interface FilesResponse { id?: string; version?: string; filesData?: ProjectFile[]; dependencies?: PreviewDependency[]; msg?: string; err?: string }
