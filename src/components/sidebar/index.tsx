import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import {
  activeFileNameAtom,
  addProjectFileAtom,
  projectFileNamesAtom,
  projectFileSummariesAtom,
  projectNameAtom,
  removeProjectFileAtom,
  renameProjectFileAtom,
  selectProjectFileAtom,
} from '../../state/projectAtoms';
import { getLanguageFromFilename, isValidFilename, isValidNewFilename } from '../../state/validation';
import AddLanguageLogo from '../../utils/AddLanguageLogo';
import Icon from '../Icon';
import SidebarShell, { ExplorerPane } from './Sidebar';
import { ActivityBar, ActivityButton } from './Panel';
import {
  DialogActions,
  DialogButton,
  DialogError,
  EmptyState,
  ExplorerHeader,
  FileActionButton,
  FileActions,
  FileButton,
  FileList,
  FileRow,
  NewFileButton,
  ProjectHeader,
  WorkbenchDialog,
} from './Files';

type DialogState =
  | { type: 'new-file' }
  | { type: 'rename-file'; filename: string }
  | { type: 'delete-file'; filename: string }
  | null;

const Sidebar = () => {
  const files = useAtomValue(projectFileSummariesAtom);
  const fileNames = useAtomValue(projectFileNamesAtom);
  const activeFileName = useAtomValue(activeFileNameAtom);
  const projectName = useAtomValue(projectNameAtom);
  const addFile = useSetAtom(addProjectFileAtom);
  const removeFile = useSetAtom(removeProjectFileAtom);
  const renameFile = useSetAtom(renameProjectFileAtom);
  const selectFile = useSetAtom(selectProjectFileAtom);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [dialogError, setDialogError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogState && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialogState]);

  const openDialog = (nextDialog: DialogState) => {
    setDialogValue(nextDialog?.type === 'rename-file' ? nextDialog.filename : '');
    setDialogError('');
    setDialogState(nextDialog);
  };

  const addNamedFile = (filename: string) => {
    addFile({ name: filename, language: getLanguageFromFilename(filename), value: '' });
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogState(null);
    setDialogValue('');
    setDialogError('');
  };

  const createFile = (event: FormEvent) => {
    event.preventDefault();
    const filename = dialogValue.trim();
    if (!isValidNewFilename(filename)) {
      setDialogError('New files must use a valid .css or .js filename.');
      return;
    }
    if (fileNames.some((name) => name.toLowerCase() === filename.toLowerCase())) {
      setDialogError('A file with this name already exists.');
      return;
    }
    addNamedFile(filename);
    closeDialog();
  };

  const renameSelectedFile = (event: FormEvent) => {
    event.preventDefault();
    if (dialogState?.type !== 'rename-file') return;
    const nextName = dialogValue.trim();
    if (!isValidFilename(nextName)) {
      setDialogError('Use a valid .html, .css, or .js filename.');
      return;
    }
    if (fileNames.some((name) => name !== dialogState.filename && name.toLowerCase() === nextName.toLowerCase())) {
      setDialogError('A file with this name already exists.');
      return;
    }
    if (!renameFile({ filename: dialogState.filename, nextName })) {
      setDialogError('The file could not be renamed.');
      return;
    }
    closeDialog();
  };

  const deleteFile = (event: FormEvent) => {
    event.preventDefault();
    if (dialogState?.type !== 'delete-file') return;
    if (files.length === 1) {
      setDialogError('Keep at least one file in the project.');
      return;
    }
    removeFile(dialogState.filename);
    closeDialog();
  };

  const closeDialogOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  return (
    <SidebarShell id='sidebar' aria-label='Explorer'>
      <ActivityBar aria-label='Activity bar'>
        <ActivityButton type='button' $active aria-current='page' title='Explorer'>
          <Icon name='explorer' size={24} />
          <span className='visually-hidden'>Explorer</span>
        </ActivityButton>
      </ActivityBar>
      <ExplorerPane>
        <ExplorerHeader>
          <h2>Files</h2>
          <NewFileButton type='button' onClick={() => openDialog({ type: 'new-file' })}>New file</NewFileButton>
        </ExplorerHeader>
        <ProjectHeader title={projectName}><Icon name='chevron-down' size={14} /><span>{projectName}</span></ProjectHeader>
        <FileList aria-label='Project files'>
          {files.map((file) => (
            <FileRow $active={file.name === activeFileName} key={file.name}>
              <FileButton type='button' aria-current={file.name === activeFileName ? 'page' : undefined} onClick={() => selectFile(file.name)}>
                <AddLanguageLogo fileName={file.name} />
                <span>{file.name}</span>
              </FileButton>
              <FileActions>
                <FileActionButton type='button' aria-label={`Rename ${file.name}`} title={`Rename ${file.name}`} onClick={() => openDialog({ type: 'rename-file', filename: file.name })}>
                  <Icon name='edit' size={14} />
                </FileActionButton>
                {!/\.html$/i.test(file.name) && (
                  <FileActionButton type='button' aria-label={`Delete ${file.name}`} title={`Delete ${file.name}`} onClick={() => openDialog({ type: 'delete-file', filename: file.name })}>
                    <Icon name='delete' size={14} />
                  </FileActionButton>
                )}
              </FileActions>
            </FileRow>
          ))}
        </FileList>
        {!files.some(({ name }) => /\.css$/i.test(name)) && (
          <EmptyState>
            <p>This project has no stylesheet.</p>
            <button type='button' onClick={() => addNamedFile(fileNames.includes('style.css') ? 'styles.css' : 'style.css')}>Add stylesheet</button>
          </EmptyState>
        )}
      </ExplorerPane>

      <WorkbenchDialog ref={dialogRef} onCancel={closeDialog} onClick={closeDialogOnBackdrop} onClose={() => setDialogState(null)}>
        {dialogState?.type === 'new-file' && (
          <form onSubmit={createFile}>
            <h2>New file</h2>
            <label htmlFor='new-file-name'>File name<input id='new-file-name' name='fileName' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} placeholder='component.js' /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit'>Create file</DialogButton></DialogActions>
          </form>
        )}
        {dialogState?.type === 'rename-file' && (
          <form onSubmit={renameSelectedFile}>
            <h2>Rename {dialogState.filename}</h2>
            <label htmlFor='rename-file-name'>File name<input id='rename-file-name' name='fileName' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit'>Rename file</DialogButton></DialogActions>
          </form>
        )}
        {dialogState?.type === 'delete-file' && (
          <form onSubmit={deleteFile}>
            <h2>Delete {dialogState.filename}?</h2>
            <p>This removes the file from the current project.</p>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $danger type='submit'>Delete file</DialogButton></DialogActions>
          </form>
        )}
      </WorkbenchDialog>
    </SidebarShell>
  );
};

export default Sidebar;
