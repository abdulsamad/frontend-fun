export interface ProjectFile {
  name: string;
  language: string;
  value: string;
}

export type PreviewDependencyType = 'script' | 'module' | 'style';

export interface PreviewDependency {
  id: string;
  type: PreviewDependencyType;
  url: string;
  enabled: boolean;
}
