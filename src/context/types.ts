// Context Initial State
export interface IState {
  activeFile: string | null;
  filesList: string[];
  filesData: filesData[];
  addFile: (filename: string) => void;
  removeFile: (filename: string) => void;
}

/* Code files mapped with names */
interface filesData {
  filename: string;
  data: string;
}

// Types
export const ADD_FILE = 'ADD_FILE';
export const REMOVE_FILE = 'REMOVE_FILE';

// Context Dispatch function shapes
interface addFile {
  type: 'ADD_FILE';
  payload: string;
}

interface removeFile {
  type: 'REMOVE_FILE';
  payload: string;
}

// Types for Reducers Action
export type Action = addFile | removeFile;
