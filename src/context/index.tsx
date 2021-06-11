import { createContext, useContext, useReducer, FC } from 'react';

import reducer from './reducer';
import * as types from './types';

const initialState: types.IState = {
  activeFile: null,
  filesList: [],
  filesData: [],
  addFile: () => null,
  removeFile: () => null,
};

const AppContext = createContext<types.IState>(initialState);

const Context: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addFile = (filename: string) => {
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

  return (
    <AppContext.Provider
      value={{
        activeFile: state.activeFile,
        filesList: state.filesList,
        filesData: state.filesData,
        addFile,
        removeFile,
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
