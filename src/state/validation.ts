import { PreviewDependency, ProjectFile } from './types';

// Project validation is shared by local persistence and the remote API client.

const FILENAME_PATTERN = /^[A-Za-z0-9_-]{1,50}\.(html|css|js)$/i;
const MAX_FILE_VALUE_SIZE = 500_000;
const MAX_FILES = 100;
const MAX_DEPENDENCIES = 20;
const MAX_DEPENDENCY_URL_SIZE = 2048;

export const getLanguageFromFilename = (name: string): string => {
  const extension = name.split('.').pop()?.toLowerCase();
  return extension === 'js' ? 'javascript' : extension || '';
};

export const isValidFilename = (name: unknown): name is string =>
  typeof name === 'string' && FILENAME_PATTERN.test(name);

export const isValidNewFilename = (name: unknown): name is string =>
  isValidFilename(name) && !/\.html$/i.test(name);

export const isValidFile = (file: unknown): file is ProjectFile => {
  if (!file || typeof file !== 'object') return false;
  const candidate = file as ProjectFile;
  return (
    isValidFilename(candidate.name) &&
    typeof candidate.language === 'string' &&
    ['html', 'css', 'javascript'].includes(candidate.language.toLowerCase()) &&
    typeof candidate.value === 'string' &&
    candidate.value.length <= MAX_FILE_VALUE_SIZE &&
    getLanguageFromFilename(candidate.name) === candidate.language
  );
};

export const validateFiles = (value: unknown): ProjectFile[] | null => {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_FILES) return null;
  const files = value.filter(isValidFile);
  if (files.length !== value.length || new Set(files.map((file) => file.name.toLowerCase())).size !== files.length) return null;
  return files;
};

export const isValidDependency = (value: unknown): value is PreviewDependency => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as PreviewDependency;
  try {
    const url = new URL(candidate.url);
    return Boolean(
      typeof candidate.id === 'string' && candidate.id.length > 0 && candidate.id.length <= 80 &&
      (candidate.type === 'script' || candidate.type === 'module' || candidate.type === 'style') &&
      typeof candidate.enabled === 'boolean' && url.protocol === 'https:' &&
      candidate.url.length <= MAX_DEPENDENCY_URL_SIZE,
    );
  } catch {
    return false;
  }
};

export const validateDependencies = (value: unknown): PreviewDependency[] | null => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_DEPENDENCIES) return null;
  const dependencies = value.filter(isValidDependency);
  return dependencies.length === value.length && new Set(dependencies.map(({ id }) => id)).size === dependencies.length
    ? dependencies
    : null;
};

export { MAX_FILE_VALUE_SIZE, MAX_FILES, MAX_DEPENDENCIES, MAX_DEPENDENCY_URL_SIZE };
