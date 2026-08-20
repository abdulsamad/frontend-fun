import { fileData } from './types';

const FILENAME_PATTERN = /^[A-Za-z0-9_-]{1,50}\.(html|css|js)$/i;
const MAX_FILE_VALUE_SIZE = 500_000;
const MAX_FILES = 100;

export const getLanguageFromFilename = (name: string): string => {
  const extension = name.split('.').pop()?.toLowerCase();
  return extension === 'js' ? 'javascript' : extension || '';
};

export const isValidFilename = (name: unknown): name is string =>
  typeof name === 'string' && FILENAME_PATTERN.test(name);

export const isValidFile = (file: unknown): file is fileData => {
  if (!file || typeof file !== 'object') return false;
  const candidate = file as fileData;
  return (
    isValidFilename(candidate.name) &&
    typeof candidate.language === 'string' &&
    ['html', 'css', 'javascript'].includes(candidate.language.toLowerCase()) &&
    typeof candidate.value === 'string' &&
    candidate.value.length <= MAX_FILE_VALUE_SIZE &&
    getLanguageFromFilename(candidate.name) === candidate.language
  );
};

export const validateFiles = (value: unknown): fileData[] | null => {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_FILES) return null;
  const files = value.filter(isValidFile);
  if (files.length !== value.length || new Set(files.map((file) => file.name.toLowerCase())).size !== files.length) return null;
  return files;
};

export { MAX_FILE_VALUE_SIZE, MAX_FILES };
