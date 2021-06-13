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
      return {
        ...state,
        activeFile: state.filesData[0],
        fileslist: state.filesList.filter((filename) => filename !== action.payload),
      };

    case types.CHANGE_FILE:
      return {
        ...state,
        activeFile: action.payload,
      };

    case types.ADD_FILE_DATA:
      return {
        ...state,
        filesData: [...state.filesData, action.payload],
      };

    default:
      return state;
  }
};

export default reducer;
