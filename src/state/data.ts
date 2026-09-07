import * as types from './types';

// Keep a valid three-file project ready without putting demo code in the editor.

export const defaultFilesList: string[] = ['index.html', 'style.css', 'script.js'];

export const defaultFilesData: types.ProjectFile[] = [
  { name: defaultFilesList[0], language: 'html', value: '' },
  { name: defaultFilesList[1], language: 'css', value: '' },
  { name: defaultFilesList[2], language: 'javascript', value: '' },
];

export const defaultActiveFile: types.ProjectFile = {
  name: defaultFilesData[0].name,
  language: defaultFilesData[0].language,
  value: defaultFilesData[0].value,
};
