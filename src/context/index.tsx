import { createContext, useContext, useReducer, useEffect, FC } from 'react';
import localforage from 'localforage';

import reducer from './reducer';
import * as types from './types';
import { defaultFilesData, defaultFilesList, defaultActiveFile } from './data';

const initialState: types.IState = {
  activeFile: defaultActiveFile,
  filesList: defaultFilesList,
  filesData: defaultFilesData,
  addFile: () => null,
  removeFile: () => null,
  changeActiveFile: () => null,
  addFileData: () => null,
  addImportedFilesData: () => null,
};

const AppContext = createContext<types.IState>(initialState);

const Context: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localforage.getItem('filesData').then((filesData: any) => {
      if (filesData) addImportedFilesData(filesData);
    });
  }, []);

  const addFile = (fileData: types.fileData) => {
    dispatch({
      type: types.ADD_FILE,
      payload: fileData,
    });
  };

  const removeFile = (filename: string) => {
    dispatch({
      type: types.REMOVE_FILE,
      payload: filename,
    });
  };

  const changeActiveFile = (fileData: types.fileData) => {
    dispatch({
      type: types.CHANGE_FILE,
      payload: fileData,
    });
  };

  const addFileData = (fileValue: string) => {
    dispatch({
      type: types.ADD_FILE_DATA,
      payload: fileValue,
    });
  };

  const addImportedFilesData = (filesData: types.fileData[]) => {
    dispatch({
      type: types.ADD_IMPORTED_FILES_DATA,
      payload: filesData,
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeFile: state.activeFile,
        filesList: state.filesList,
        filesData: state.filesData,
        addFile,
        removeFile,
        changeActiveFile,
        addFileData,
        addImportedFilesData,
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
