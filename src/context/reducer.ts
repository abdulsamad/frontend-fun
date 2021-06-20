import localforage from 'localforage';

import * as types from './types';

const reducer = (state: types.IState, action: types.Action) => {
  switch (action.type) {
    case types.ADD_FILE:
      // Updating to IndexDB, WebSQL or LocalStorage
      localforage.setItem('filesData', [...state.filesData, action.payload]);

      return {
        ...state,
        activeFile: action.payload,
        filesList: [...state.filesList, action.payload.name],
        filesData: [...state.filesData, action.payload],
      };

    case types.REMOVE_FILE:
      const removedfilesData = state.filesData.filter(({ name }) => name !== action.payload);

      // Updating to IndexDB, WebSQL or LocalStorage
      localforage.setItem('filesData', removedfilesData);

      return {
        ...state,
        filesList: state.filesList.filter((filename) => filename !== action.payload),
        filesData: removedfilesData,
        activeFile: state.filesData[0],
      };

    case types.CHANGE_FILE:
      return {
        ...state,
        activeFile: action.payload,
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

      // Adding to IndexDB, WebSQL or LocalStorage
      localforage.setItem('filesData', editedFilesData);

      return {
        ...state,
        filesData: editedFilesData,
      };

    case types.ADD_IMPORTED_FILES_DATA:
      return {
        ...state,
        activeFile: action.payload[0],
        filesData: action.payload,
        filesList: action.payload.map(({ name }) => name),
      };

    default:
      return state;
  }
};

export default reducer;
