import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import localforage from 'localforage';

import reducer from './reducer';
import * as types from './types';
import { defaultFilesData, defaultFilesList, defaultActiveFile } from './data';
import { validateFiles } from './validation';

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

const Context = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let mounted = true;
    localforage.getItem<unknown>('filesData').then((filesData) => {
      const validFiles = validateFiles(filesData);
      if (mounted && validFiles) dispatch({ type: types.ADD_IMPORTED_FILES_DATA, payload: validFiles });
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localforage.setItem('filesData', state.filesData).catch(() => undefined);
  }, [state.filesData]);

  const addFile = useCallback((fileData: types.fileData) => {
    dispatch({
      type: types.ADD_FILE,
      payload: fileData,
    });
  }, []);

  const removeFile = useCallback((filename: string) => {
    dispatch({
      type: types.REMOVE_FILE,
      payload: filename,
    });
  }, []);

  const changeActiveFile = useCallback((fileData: types.fileData) => {
    dispatch({
      type: types.CHANGE_FILE,
      payload: fileData,
    });
  }, []);

  const addFileData = useCallback((fileValue: string) => {
    dispatch({
      type: types.ADD_FILE_DATA,
      payload: fileValue,
    });
  }, []);

  const addImportedFilesData = useCallback((filesData: types.fileData[]) => {
    dispatch({
      type: types.ADD_IMPORTED_FILES_DATA,
      payload: filesData,
    });
  }, []);

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
      }}>
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
