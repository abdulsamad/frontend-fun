import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { defaultActiveFile, defaultFilesData, defaultFilesList } from './data';
import { ProjectFile } from './types';
import { validateFiles } from './validation';

export interface ProjectFileSummary {
  name: string;
  language: string;
}

export const projectFilesAtom = atom<ProjectFile[]>(defaultFilesData);
export const activeFileNameAtom = atom(defaultActiveFile.name);
export const openFileNamesAtom = atom<string[]>(defaultFilesList);
export const projectHydratedAtom = atom(false);

const summariesEqual = (left: ProjectFileSummary[], right: ProjectFileSummary[]) =>
  left.length === right.length && left.every((file, index) => (
    file.name === right[index]?.name && file.language === right[index]?.language
  ));

const namesEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((name, index) => name === right[index]);

export const projectFileSummariesAtom = selectAtom(
  projectFilesAtom,
  (files) => files.map(({ name, language }) => ({ name, language })),
  summariesEqual,
);

export const projectFileNamesAtom = selectAtom(
  projectFilesAtom,
  (files) => files.map(({ name }) => name),
  namesEqual,
);

export const activeFileAtom = atom((get) => {
  const files = get(projectFilesAtom);
  return files.find((file) => file.name === get(activeFileNameAtom)) || files[0] || defaultActiveFile;
});

export const addProjectFileAtom = atom(null, (get, set, file: ProjectFile) => {
  const files = get(projectFilesAtom);
  if (files.some(({ name }) => name.toLowerCase() === file.name.toLowerCase())) return;
  set(projectFilesAtom, [...files, file]);
  set(activeFileNameAtom, file.name);
  set(openFileNamesAtom, (openFiles) => openFiles.includes(file.name) ? openFiles : [...openFiles, file.name]);
});

export const removeProjectFileAtom = atom(null, (get, set, filename: string) => {
  const files = get(projectFilesAtom);
  const remainingFiles = files.filter(({ name }) => name !== filename);
  if (remainingFiles.length === 0 || remainingFiles.length === files.length) return;

  const currentActiveName = get(activeFileNameAtom);
  const remainingOpenFiles = get(openFileNamesAtom).filter((name) => name !== filename);
  const fallbackFile = remainingFiles.find(({ name }) => name === currentActiveName) || remainingFiles[0];
  const nextOpenFiles = remainingOpenFiles.length > 0 ? remainingOpenFiles : [fallbackFile.name];
  const nextActiveName = currentActiveName === filename || !nextOpenFiles.includes(currentActiveName)
    ? nextOpenFiles[0]
    : currentActiveName;

  set(projectFilesAtom, remainingFiles);
  set(openFileNamesAtom, nextOpenFiles);
  set(activeFileNameAtom, nextActiveName);
});

export const closeProjectFileAtom = atom(null, (get, set, filename: string) => {
  const openFiles = get(openFileNamesAtom);
  if (openFiles.length <= 1) return;
  const closedIndex = openFiles.indexOf(filename);
  if (closedIndex === -1) return;

  const nextOpenFiles = openFiles.filter((name) => name !== filename);
  set(openFileNamesAtom, nextOpenFiles);
  if (get(activeFileNameAtom) === filename) {
    set(activeFileNameAtom, nextOpenFiles[Math.min(closedIndex, nextOpenFiles.length - 1)]);
  }
});

export const selectProjectFileAtom = atom(null, (get, set, filename: string) => {
  if (!get(projectFilesAtom).some(({ name }) => name === filename)) return;
  set(activeFileNameAtom, filename);
  set(openFileNamesAtom, (openFiles) => openFiles.includes(filename) ? openFiles : [...openFiles, filename]);
});

export const updateActiveFileAtom = atom(null, (get, set, value: string) => {
  const activeName = get(activeFileNameAtom);
  set(projectFilesAtom, (files) => files.map((file) => (
    file.name === activeName ? { ...file, value } : file
  )));
});

export const replaceProjectFilesAtom = atom(null, (_get, set, value: unknown) => {
  const files = validateFiles(value);
  if (!files) return false;
  set(projectFilesAtom, files);
  set(activeFileNameAtom, files[0].name);
  set(openFileNamesAtom, files.map(({ name }) => name));
  return true;
});
