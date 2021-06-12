import { createContext, useContext, useReducer, FC } from 'react';

import reducer from './reducer';
import * as types from './types';
import { defaultFilesData, defaultFilesList } from './data';

const initialState: types.IState = {
  activeFileName: 'index.html',
  filesList: defaultFilesList,
  filesData: defaultFilesData,
  addFile: () => null,
  removeFile: () => null,
  changeActiveFile: () => null,
  addFileData: () => null,
};

const AppContext = createContext<types.IState>(initialState);

const Context: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addFile = (filename: types.fileData) => {
    dispatch({
      type: types.ADD_FILE,
      payload: filename,
    });
  };

  const removeFile = (filename: string) => {
    dispatch({
      type: types.REMOVE_FILE,
      payload: filename,
    });
  };

  const changeActiveFile = (filename: string) => {
    dispatch({
      type: types.CHANGE_FILE,
      payload: filename,
    });
  };

  const addFileData = (data: string) => {
    dispatch({
      type: types.ADD_FILE_DATA,
      payload: data,
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeFileName: state.activeFileName,
        filesList: state.filesList,
        filesData: state.filesData,
        addFile,
        removeFile,
        changeActiveFile,
        addFileData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined)
    throw new Error('useContext must be used within a AppContext Provider.');

  return context;
};

export { Context, useAppContext };
