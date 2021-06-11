// Context Initial State
export interface IState {
  activeFileName: string | null;
  filesList: string[];
  filesData: fileData[];
  addFile: (filename: string) => void;
  removeFile: (filename: string) => void;
  changeFile: (filename: string) => void;
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

// Context Dispatch function shapes
export interface addFile {
  type: 'ADD_FILE';
  payload: string;
}

export interface removeFile {
  type: 'REMOVE_FILE';
  payload: string;
}

export interface changeFile {
  type: 'CHANGE_FILE';
  payload: string;
}

// Types for Reducers Action
export type Action = addFile | removeFile | changeFile;
