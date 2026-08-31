import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { toast } from 'react-toastify';

import {
  activeFileNameAtom,
  addProjectFileAtom,
  projectFileNamesAtom,
  projectFileSummariesAtom,
  projectFilesAtom,
  projectDependenciesAtom,
  removeProjectFileAtom,
  replaceProjectFilesAtom,
  selectProjectFileAtom,
} from '../../state/projectAtoms';
import { getLanguageFromFilename, isValidFilename, validateDependencies, validateFiles } from '../../state/validation';
import { FilesPayload, FilesResponse } from '../../shared/filesContract';
import AddLanguageLogo from '../../utils/AddLanguageLogo';
import Icon from '../Icon';
import SidebarShell, { ExplorerPane } from './Sidebar';
import { ActivityBar, ActivityButton, UserId } from './Panel';
import {
  ActionGroup,
  DeleteButton,
  DialogActions,
  DialogButton,
  DialogError,
  ExplorerHeader,
  FileButton,
  FileList,
  FileRow,
  ProjectHeader,
  ToolbarButton,
  WorkbenchDialog,
} from './Files';

const PROJECT_ID_PATTERN = /^[a-f0-9]{32}$/i;

type DialogState =
  | { type: 'new-file' }
  | { type: 'open-project' }
  | { type: 'delete-file'; filename: string }
  | null;

const Sidebar = () => {
  const files = useAtomValue(projectFileSummariesAtom);
  const fileNames = useAtomValue(projectFileNamesAtom);
  const activeFileName = useAtomValue(activeFileNameAtom);
  const addFile = useSetAtom(addProjectFileAtom);
  const removeFile = useSetAtom(removeProjectFileAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const selectFile = useSetAtom(selectProjectFileAtom);
  const store = useStore();
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogState && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialogState]);

  const openDialog = (nextDialog: DialogState) => {
    setDialogValue('');
    setDialogError('');
    setDialogState(nextDialog);
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
    if (!isValidFilename(filename)) {
      setDialogError('Use a valid .html, .css, or .js filename.');
      return;
    }
    if (fileNames.some((name) => name.toLowerCase() === filename.toLowerCase())) {
      setDialogError('A file with this name already exists.');
      return;
    }
    addFile({ name: filename, language: getLanguageFromFilename(filename), value: '' });
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

  const saveProject = async () => {
    if (isSaving) return;
    setIsSaving(true);
    let id = localStorage.getItem('id');
    let version = localStorage.getItem('projectVersion');
    if (id && !PROJECT_ID_PATTERN.test(id)) {
      localStorage.removeItem('id');
      localStorage.removeItem('projectVersion');
      id = null;
      version = null;
    }
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    const filesData = store.get(projectFilesAtom);
    const dependencies = store.get(projectDependenciesAtom);

    try {
      if (id && !version) {
        const existing = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`);
        const existingData = await existing.json() as FilesResponse;
        if (!existing.ok || !existingData.version) {
          localStorage.removeItem('id');
          localStorage.removeItem('projectVersion');
          id = null;
        } else {
          version = existingData.version;
          localStorage.setItem('projectVersion', version);
        }
      }
      const saveHeaders = id && version ? { ...headers, 'If-Match': version } : headers;
      const response = await fetch(id ? `/api/saveFilesData?id=${encodeURIComponent(id)}` : '/api/saveFilesData', {
        method: 'POST',
        headers: saveHeaders,
        body: JSON.stringify({ filesData, dependencies } satisfies FilesPayload),
      });
      const data = await response.json() as FilesResponse;
      if (!response.ok || !data.id || !data.version) {
        if (response.status === 409) throw new Error('This project changed elsewhere. Open it again before saving.');
        if (response.status === 413) throw new Error('This project is larger than the 5 MiB remote save limit.');
        throw new Error(data.err || 'The project could not be saved.');
      }
      localStorage.setItem('id', data.id);
      localStorage.setItem('projectVersion', data.version);
      toast.success(<div>Project saved.<br /><UserId>{data.id}</UserId></div>);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The project could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const openProject = async (event: FormEvent) => {
    event.preventDefault();
    const id = dialogValue.trim();
    if (!PROJECT_ID_PATTERN.test(id)) {
      setDialogError('Enter a valid 32-character Project ID.');
      return;
    }
    setIsOpening(true);
    setDialogError('');
    try {
      const response = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`);
      const data = await response.json() as FilesResponse;
      const imported = validateFiles(data.filesData);
      const dependencies = validateDependencies(data.dependencies);
      if (!response.ok || !imported || !dependencies || !data.version) throw new Error(data.err || 'Project not found.');
      localStorage.setItem('id', id);
      localStorage.setItem('projectVersion', data.version);
      replaceFiles(imported);
      store.set(projectDependenciesAtom, dependencies);
      closeDialog();
      toast.success('Project opened.');
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'The project could not be opened.');
    } finally {
      setIsOpening(false);
    }
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
          <h2>Explorer</h2>
          <ActionGroup>
            <ToolbarButton type='button' aria-label='New file' title='New file' onClick={() => openDialog({ type: 'new-file' })}>
              <Icon name='file-add' />
            </ToolbarButton>
            <ToolbarButton type='button' aria-label='Save project' title='Save project' disabled={isSaving} aria-busy={isSaving} onClick={saveProject}>
              <Icon name='save' />
            </ToolbarButton>
            <ToolbarButton type='button' aria-label='Open saved project' title='Open saved project' onClick={() => openDialog({ type: 'open-project' })}>
              <Icon name='open' />
            </ToolbarButton>
          </ActionGroup>
        </ExplorerHeader>
        <ProjectHeader><Icon name='chevron-down' size={14} /> Frontend Fun</ProjectHeader>
        <FileList aria-label='Project files'>
          {files.map((file) => (
            <FileRow $active={file.name === activeFileName} key={file.name}>
              <FileButton type='button' aria-current={file.name === activeFileName ? 'page' : undefined} onClick={() => selectFile(file.name)}>
                <AddLanguageLogo fileName={file.name} />
                <span>{file.name}</span>
              </FileButton>
              <DeleteButton type='button' aria-label={`Delete ${file.name}`} title={`Delete ${file.name}`} onClick={() => openDialog({ type: 'delete-file', filename: file.name })}>
                <Icon name='delete' size={14} />
              </DeleteButton>
            </FileRow>
          ))}
        </FileList>
      </ExplorerPane>

      <WorkbenchDialog ref={dialogRef} onClose={() => setDialogState(null)}>
        {dialogState?.type === 'new-file' && (
          <form onSubmit={createFile}>
            <h2>New file</h2>
            <label htmlFor='new-file-name'>File name<input id='new-file-name' name='fileName' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} placeholder='component.html' /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit'>Create file</DialogButton></DialogActions>
          </form>
        )}
        {dialogState?.type === 'open-project' && (
          <form onSubmit={openProject}>
            <h2>Open saved project</h2>
            <p>Opening a project replaces the files currently in this workbench.</p>
            <label htmlFor='project-id'>Project ID<input id='project-id' name='projectId' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} placeholder='32-character Project ID' /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit' disabled={isOpening}>{isOpening ? 'Opening…' : 'Open project'}</DialogButton></DialogActions>
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
