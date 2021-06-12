import * as types from './types';

const reducer = (state: types.IState, action: types.Action) => {
  switch (action.type) {
    case types.ADD_FILE:
      return {
        ...state,
        activeFileName: action.payload.name,
        filesList: [...state.filesList, action.payload.name],
        filesData: [...state.filesData, action.payload],
      };

    case types.REMOVE_FILE:
      return {
        ...state,
        activeFileName: state.filesList[0],
        fileslist: state.filesList.filter((filename) => filename !== action.payload),
      };

    case types.CHANGE_FILE:
      return {
        ...state,
        activeFileName: action.payload,
      };

    case types.ADD_FILE_DATA:
      const activeFileData = state.filesData.map((filedata: types.fileData) => {
        const { name } = filedata;

        if (name === state.activeFileName)
          return {
            ...filedata,
            value: action.payload,
          };

        return filedata;
      });

      return {
        ...state,
        filesData: activeFileData,
      };

    default:
      return state;
  }
};

export default reducer;
