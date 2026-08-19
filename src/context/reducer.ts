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
      };

    case types.REMOVE_FILE:
      const removedfilesData = state.filesData.filter(({ name }) => name !== action.payload);

      if (removedfilesData.length === 0) return state;
      const nextActive = state.activeFile.name === action.payload
        ? removedfilesData[0]
        : removedfilesData.find((file) => file.name === state.activeFile.name) || removedfilesData[0];

      return {
        ...state,
        filesList: state.filesList.filter((filename) => filename !== action.payload),
        filesData: removedfilesData,
        activeFile: nextActive,
      };

    case types.CHANGE_FILE:
      return {
        ...state,
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
      };

    default:
      return state;
  }
};

export default reducer;
