import * as types from './types';
import { validateFiles } from './validation';

export const reducer = (state: types.IState, action: types.Action): types.IState => {
  switch (action.type) {
    case types.ADD_FILE:
      return {
        ...state,
        activeFile: action.payload,
        filesList: [...state.filesList, action.payload.name],
        filesData: [...state.filesData, action.payload],
        openFiles: [...state.openFiles, action.payload.name],
      };

    case types.REMOVE_FILE:
      const removedfilesData = state.filesData.filter(({ name }) => name !== action.payload);

      if (removedfilesData.length === 0) return state;
      const nextOpenFiles = state.openFiles.filter((filename) => filename !== action.payload);
      const fallbackFile = removedfilesData.find((file) => file.name === state.activeFile.name) || removedfilesData[0];
      const openFiles = nextOpenFiles.length > 0 ? nextOpenFiles : [fallbackFile.name];
      const nextActive = state.activeFile.name === action.payload || !nextOpenFiles.includes(state.activeFile.name)
        ? removedfilesData.find((file) => file.name === openFiles[0]) || fallbackFile
        : state.activeFile;

      return {
        ...state,
        filesList: state.filesList.filter((filename) => filename !== action.payload),
        filesData: removedfilesData,
        openFiles,
        activeFile: nextActive,
      };

    case types.CLOSE_FILE: {
      if (state.openFiles.length <= 1) return state;

      const closedIndex = state.openFiles.indexOf(action.payload);
      if (closedIndex === -1) return state;

      const openFiles = state.openFiles.filter((filename) => filename !== action.payload);
      const nextActiveName = state.activeFile.name === action.payload
        ? openFiles[Math.min(closedIndex, openFiles.length - 1)]
        : state.activeFile.name;

      return {
        ...state,
        openFiles,
        activeFile: state.filesData.find((file) => file.name === nextActiveName) || state.activeFile,
      };
    }

    case types.CHANGE_FILE:
      return {
        ...state,
        openFiles: state.openFiles.includes(action.payload.name)
          ? state.openFiles
          : [...state.openFiles, action.payload.name],
        activeFile: state.filesData.find((file) => file.name === action.payload.name) || state.activeFile,
      };

    case types.ADD_FILE_DATA:
      const editedFilesData = state.filesData.map((file) => {
        const { name, language } = file;

        if (name === state.activeFile.name) {
          return {
            name,
            language,
            value: action.payload,
          };
        }

        return file;
      });

      return {
        ...state,
        filesData: editedFilesData,
        activeFile: editedFilesData.find((file) => file.name === state.activeFile.name) || state.activeFile,
      };

    case types.ADD_IMPORTED_FILES_DATA:
      const importedFiles = validateFiles(action.payload);
      if (!importedFiles) return state;
      return {
        ...state,
        activeFile: importedFiles[0],
        filesData: importedFiles,
        filesList: importedFiles.map(({ name }) => name),
        openFiles: importedFiles.map(({ name }) => name),
      };

    default:
      return state;
  }
};

export default reducer;
