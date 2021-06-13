import * as types from './types';

const reducer = (state: types.IState, action: types.Action) => {
  switch (action.type) {
    case types.ADD_FILE:
      return {
        ...state,
        activeFile: action.payload,
        filesList: [...state.filesList, action.payload.name],
        filesData: [...state.filesData, action.payload],
      };

    case types.REMOVE_FILE:
      console.log(action.payload);
      return {
        ...state,
        filesList: state.filesList.filter((filename) => filename !== action.payload),
        filesData: state.filesData.filter(({ name }) => name !== action.payload),
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

      return {
        ...state,
        filesData: editedFilesData,
      };

    case types.ADD_IMPORTED_FILES_DATA:
      return {
        ...state,
        activeFile: action.payload[0],
        filesData: action.payload,
      };

    default:
      return state;
  }
};

export default reducer;
