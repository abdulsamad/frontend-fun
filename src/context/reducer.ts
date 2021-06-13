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
        fileslist: state.filesList.filter((filename) => filename !== action.payload),
        filesData: state.filesData.filter(({ name }) => name !== action.payload),
        activeFile: state.filesData[0],
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
