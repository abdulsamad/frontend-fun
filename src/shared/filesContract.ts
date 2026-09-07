import { PreviewDependency, ProjectFile } from '../state/types';

export const MAX_PROJECT_SIZE = 5 * 1024 * 1024;

export interface FilesPayload { filesData: ProjectFile[]; dependencies?: PreviewDependency[]; projectName?: string }
export interface FilesResponse { id?: string; editToken?: string; version?: string; filesData?: ProjectFile[]; dependencies?: PreviewDependency[]; projectName?: string; msg?: string; err?: string }
