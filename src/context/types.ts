// Context Initial State
export interface IState {
  activeFile: fileData;
  filesList: string[];
  filesData: fileData[];
  addFile: (fileData: fileData) => void;
  removeFile: (filename: string) => void;
  changeActiveFile: (fileData: fileData) => void;
  addFileData: (fileValue: string) => void;
  addImportedFilesData: (filesData: fileData[]) => void;
}

// Code files mapped with names
export interface fileData {
  name: string;
  language: string;
  value: string;
}

// Types
export const ADD_FILE = 'ADD_FILE';
export const REMOVE_FILE = 'REMOVE_FILE';
export const CHANGE_FILE = 'CHANGE_FILE';
export const ADD_FILE_DATA = 'ADD_FILE_DATA';
export const ADD_IMPORTED_FILES_DATA = 'ADD_IMPORTED_FILES_DATA';

// Context Dispatch function shapes
export interface addFile {
  type: 'ADD_FILE';
  payload: fileData;
}

export interface removeFile {
  type: 'REMOVE_FILE';
  payload: string;
}

export interface changeActiveFile {
  type: 'CHANGE_FILE';
  payload: fileData;
}

export interface addFileData {
  type: 'ADD_FILE_DATA';
  payload: string;
}

export interface addImportedFilesData {
  type: 'ADD_IMPORTED_FILES_DATA';
  payload: fileData[];
}

// Types for Reducers Action
export type Action = addFile | removeFile | changeActiveFile | addFileData | addImportedFilesData;
