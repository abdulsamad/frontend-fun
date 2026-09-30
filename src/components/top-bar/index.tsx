import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { FilesPayload, FilesResponse, MAX_PROJECT_SIZE } from '../../shared/filesContract';
import {
  DEFAULT_PROJECT_NAME,
  projectDependenciesAtom,
  projectFilesAtom,
  projectNameAtom,
  renameProjectAtom,
  replaceProjectFilesAtom,
  resetProjectAtom,
} from '../../state/projectAtoms';
import { defaultWorkbenchSettings, workbenchSettingsAtom } from '../../state/settings';
import { isValidProjectName, validateDependencies, validateFiles } from '../../state/validation';
import { createZipBlob } from '../../utils/createZip';
import { WorkbenchTopBar } from '../../styles/GlobalContainer';
import { PopoverDetails, PopoverPanel } from '../../styles/Popover';
import Dependencies from '../dependencies';
import { DialogActions, DialogButton, DialogError, WorkbenchDialog } from '../sidebar/Files';

const PROJECT_ID_PATTERN = /^[a-f0-9]{32}$/i;
const PROJECT_EDIT_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const PROJECT_EDIT_TOKEN_KEY = 'projectEditToken';
const API_HEADERS = { Accept: 'application/json', 'X-Frontend-Fun-Request': '1' };

const Identity = styled.div`
  display: flex;
  align-items: center;
  min-inline-size: 0;
  gap: 8px;
`;

const Brand = styled.span`
  color: var(--workbench-text);
  font-size: 0.75rem;
  font-weight: 650;
  white-space: nowrap;

  @media (max-width: 560px) { display: none; }
`;

const ProjectNameButton = styled.button`
  max-inline-size: min(260px, 30vw);
  min-block-size: 28px;
  padding-inline: 8px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: var(--workbench-text);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover { border-color: var(--workbench-border); background: var(--workbench-hover); }

  @media (max-width: 560px) {
    max-inline-size: 18vw;
    padding-inline: 3px;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  min-inline-size: 0;

  @media (max-width: 430px) {
    > details { display: none; }
  }
`;

const Menu = styled(PopoverDetails)`
  > summary {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: 28px;
    padding-inline: 9px;
    border-radius: 3px;
    color: var(--workbench-muted);
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;
    list-style: none;
    white-space: nowrap;
  }

  > summary::-webkit-details-marker { display: none; }
  > summary:hover { background: var(--workbench-hover); color: var(--workbench-text); }

  .compact-label { display: none; }

  @media (max-width: 560px) {
    > summary { padding-inline: 4px; font-size: 0.6875rem; }
    .full-label { display: none; }
    .compact-label { display: inline; }
  }
`;

const ProjectMenuPanel = styled(PopoverPanel).attrs({ $origin: 'top left' })`
  position: absolute;
  z-index: 30;
  inset-block-start: 34px;
  inset-inline-start: 0;
  display: grid;
  inline-size: 210px;
  padding: 5px;
  border: 1px solid var(--workbench-border);
  border-radius: 4px;
  background: var(--workbench-elevated);
  box-shadow: 0 12px 28px rgb(0 0 0 / 40%);

  button, label {
    display: flex;
    align-items: center;
    min-block-size: 30px;
    padding-inline: 9px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: var(--workbench-text);
    cursor: pointer;
    font-size: 0.75rem;
    text-align: start;
  }

  button:hover, label:hover { background: var(--workbench-hover); }
  button:disabled { color: var(--workbench-muted); cursor: progress; }
  hr { inline-size: 100%; margin: 4px 0; border: 0; border-block-start: 1px solid var(--workbench-border); }
`;

const SettingsPanel = styled(PopoverPanel).attrs({ $origin: 'top right' })`
  position: absolute;
  z-index: 30;
  inset-block-start: 34px;
  inset-inline-end: 0;
  display: grid;
  gap: 10px;
  inline-size: 220px;
  padding: 12px;
  border: 1px solid var(--workbench-border);
  border-radius: 4px;
  background: var(--workbench-elevated);
  box-shadow: 0 12px 28px rgb(0 0 0 / 40%);

  label {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    color: var(--workbench-text);
    font-size: 0.75rem;
  }

  select { max-inline-size: 120px; }
`;

const ShareButton = styled.button`
  min-block-size: 28px;
  margin-inline-start: 6px;
  padding-inline: 14px;
  border: 1px solid color-mix(in srgb, var(--workbench-focus), #000 18%);
  border-radius: 3px;
  background: var(--workbench-focus);
  color: #fff;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;

  &:hover:not(:disabled) { filter: brightness(1.12); }
  &:disabled { opacity: 0.65; cursor: progress; }

  @media (max-width: 560px) {
    margin-inline-start: 2px;
    padding-inline: 6px;
  }
`;

const ResetButton = styled.button`
  min-block-size: 28px;
  margin-inline-start: 6px;
  padding-inline: 10px;
  border: 1px solid color-mix(in srgb, var(--workbench-danger), transparent 30%);
  border-radius: 3px;
  background: transparent;
  color: var(--workbench-danger);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;

  &:hover { background: color-mix(in srgb, var(--workbench-danger), transparent 88%); }

  @media (max-width: 560px) {
    margin-inline-start: 2px;
    padding-inline: 5px;
  }
`;

type DialogState = 'rename-project' | 'open-project' | 'reset-project' | null;

const clearRemoteIdentity = () => {
  localStorage.removeItem('id');
  localStorage.removeItem('projectVersion');
  localStorage.removeItem(PROJECT_EDIT_TOKEN_KEY);
};

const readApiResponse = async (response: Response) => {
  const responseText = await response.text();
  try {
    return JSON.parse(responseText) as FilesResponse;
  } catch {
    throw new Error(response.status === 404 || response.headers.get('Content-Type')?.includes('text/html')
      ? 'The project API is unavailable. Use the Pages development server for Save and Share.'
      : `The project service returned an invalid response (${response.status}).`);
  }
};

const copyText = async (value: string) => {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall back for browsers that lose clipboard permission after the save request.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
};

const projectUrl = (id: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('project', id);
  return url.toString();
};

const showProjectInUrl = (id: string) => window.history.replaceState({}, '', projectUrl(id));

const clearProjectFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('project');
  window.history.replaceState({}, '', url);
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const TopBar = () => {
  const projectName = useAtomValue(projectNameAtom);
  const settings = useAtomValue(workbenchSettingsAtom);
  const setSettings = useSetAtom(workbenchSettingsAtom);
  const renameProject = useSetAtom(renameProjectAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const resetProject = useSetAtom(resetProjectAtom);
  const store = useStore();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const settingsMenuRef = useRef<HTMLDetailsElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deepLinkLoaded = useRef(false);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const saveInFlight = useRef(false);

  useEffect(() => {
    if (dialogState && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialogState]);

  useEffect(() => {
    const closeMenusOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) menuRef.current.open = false;
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) settingsMenuRef.current.open = false;
    };
    document.addEventListener('pointerdown', closeMenusOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeMenusOnOutsideClick);
  }, []);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
    if (settingsMenuRef.current) settingsMenuRef.current.open = false;
  };

  const openDialog = (state: Exclude<DialogState, null>) => {
    closeMenu();
    setDialogState(state);
    setDialogError('');
    setDialogValue(state === 'rename-project' ? projectName : '');
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogState(null);
    setDialogError('');
  };

  const applyRemoteProject = (id: string, data: FilesResponse) => {
    const files = validateFiles(data.filesData);
    const dependencies = validateDependencies(data.dependencies);
    if (!files || !dependencies || !data.version) throw new Error(data.err || 'Project not found.');
    const currentId = localStorage.getItem('id');
    const currentEditToken = localStorage.getItem(PROJECT_EDIT_TOKEN_KEY);
    if (currentId !== id || !PROJECT_EDIT_TOKEN_PATTERN.test(currentEditToken || '')) {
      localStorage.removeItem(PROJECT_EDIT_TOKEN_KEY);
    }
    localStorage.setItem('id', id);
    localStorage.setItem('projectVersion', data.version);
    replaceFiles(files);
    store.set(projectDependenciesAtom, dependencies);
    renameProject(isValidProjectName(data.projectName) ? data.projectName : DEFAULT_PROJECT_NAME);
    showProjectInUrl(id);
  };

  const loadProject = async (id: string) => {
    const response = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`, {
      headers: API_HEADERS,
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.err || 'Project not found.');
    applyRemoteProject(id, data);
  };

  useEffect(() => {
    if (deepLinkLoaded.current) return;
    deepLinkLoaded.current = true;
    const id = new URL(window.location.href).searchParams.get('project');
    if (!id || !PROJECT_ID_PATTERN.test(id) || id === localStorage.getItem('id')) return;
    setIsOpening(true);
    loadProject(id)
      .then(() => toast.success('Shared project opened.'))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : 'The shared project could not be opened.'))
      .finally(() => setIsOpening(false));
  }, []);

  const saveProject = async (showConfirmation = true) => {
    if (saveInFlight.current) return null;
    saveInFlight.current = true;
    setIsSaving(true);
    let id = localStorage.getItem('id');
    let version = localStorage.getItem('projectVersion');
    let editToken = localStorage.getItem(PROJECT_EDIT_TOKEN_KEY);
    if (id && !PROJECT_ID_PATTERN.test(id)) {
      clearRemoteIdentity();
      id = null;
      version = null;
      editToken = null;
    }
    if (!PROJECT_EDIT_TOKEN_PATTERN.test(editToken || '')) {
      id = null;
      version = null;
      editToken = null;
    }
    const filesData = store.get(projectFilesAtom);
    const dependencies = store.get(projectDependenciesAtom);
    const currentProjectName = store.get(projectNameAtom);
    const serialized = JSON.stringify({ filesData, dependencies, projectName: currentProjectName } satisfies FilesPayload);
    if (new TextEncoder().encode(serialized).byteLength > MAX_PROJECT_SIZE) {
      toast.error('This project is larger than the 5 MiB remote save limit.');
      saveInFlight.current = false;
      setIsSaving(false);
      return null;
    }

    try {
      if (id && !version) {
        const existing = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`, {
          headers: API_HEADERS,
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const existingData = await readApiResponse(existing);
        if (!existing.ok || !existingData.version) {
          clearRemoteIdentity();
          id = null;
        } else {
          version = existingData.version;
          localStorage.setItem('projectVersion', version);
        }
      }
      const response = await fetch(id ? `/api/saveFilesData?id=${encodeURIComponent(id)}` : '/api/saveFilesData', {
        method: 'POST',
        headers: id && version && editToken
          ? { ...API_HEADERS, 'Content-Type': 'application/json', 'If-Match': version, Authorization: `Bearer ${editToken}` }
          : { ...API_HEADERS, 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: serialized,
      });
      const data = await readApiResponse(response);
      if (!response.ok || !data.id || !data.version) {
        if (response.status === 409) throw new Error('This project changed elsewhere. Open it again before saving.');
        throw new Error(data.err || 'The project could not be saved.');
      }
      if (!id && !PROJECT_EDIT_TOKEN_PATTERN.test(data.editToken || '')) {
        throw new Error('The project was saved without a valid ownership token.');
      }
      localStorage.setItem('id', data.id);
      localStorage.setItem('projectVersion', data.version);
      if (!id) {
        localStorage.setItem(PROJECT_EDIT_TOKEN_KEY, data.editToken!);
      }
      showProjectInUrl(data.id);
      if (showConfirmation) toast.success('Project saved.');
      return data.id;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The project could not be saved.');
      return null;
    } finally {
      saveInFlight.current = false;
      setIsSaving(false);
    }
  };

  const shareProject = async () => {
    closeMenu();
    const id = await saveProject(false);
    if (!id) return;
    const url = projectUrl(id);
    showProjectInUrl(id);
    try {
      if (!await copyText(url)) throw new Error('Clipboard access was denied.');
      toast.success('Share link copied.');
    } catch {
      toast.error('The project was saved. Copy the share link from the address bar.');
    }
  };

  const confirmResetProject = (event: FormEvent) => {
    event.preventDefault();
    resetProject();
    clearRemoteIdentity();
    clearProjectFromUrl();
    closeDialog();
    toast.success('Everything reset.');
  };

  const confirmRenameProject = (event: FormEvent) => {
    event.preventDefault();
    if (!renameProject(dialogValue)) {
      setDialogError('Enter a project name between 1 and 60 characters.');
      return;
    }
    closeDialog();
  };

  const confirmOpenProject = async (event: FormEvent) => {
    event.preventDefault();
    const id = dialogValue.trim();
    if (!PROJECT_ID_PATTERN.test(id)) {
      setDialogError('Enter a valid 32-character Project ID.');
      return;
    }
    setIsOpening(true);
    setDialogError('');
    try {
      await loadProject(id);
      closeDialog();
      toast.success('Project opened.');
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'The project could not be opened.');
    } finally {
      setIsOpening(false);
    }
  };

  const exportZip = () => {
    closeMenu();
    const files = store.get(projectFilesAtom);
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'frontend-fun'}.zip`;
    download(createZipBlob(files), filename);
    toast.success('Project ZIP exported.');
  };

  const closeDialogOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  return (
    <>
      <WorkbenchTopBar>
        <Identity>
          <Brand>Frontend Fun</Brand>
          <ProjectNameButton type='button' title='Rename project' onClick={() => openDialog('rename-project')}>{projectName}</ProjectNameButton>
          <Menu ref={menuRef}>
            <summary><span className='full-label'>Project</span><span className='compact-label'>Proj</span></summary>
            <ProjectMenuPanel>
              <button type='button' onClick={() => openDialog('rename-project')}>Rename project</button>
              <button type='button' disabled={isSaving} onClick={() => { closeMenu(); void saveProject(); }}>{isSaving ? 'Saving...' : 'Save'}</button>
              <button type='button' onClick={() => openDialog('open-project')}>Open project</button>
              <button type='button' disabled={isSaving} onClick={() => void shareProject()}>Copy share link</button>
              <hr />
              <button type='button' onClick={exportZip}>Export ZIP</button>
            </ProjectMenuPanel>
          </Menu>
        </Identity>
        <Controls>
          <Dependencies />
          <Menu ref={settingsMenuRef}>
            <summary><span className='full-label'>Settings</span><span className='compact-label'>Set</span></summary>
            <SettingsPanel>
              <label>Theme<select value={settings.theme} onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value as typeof current.theme }))}>
                <option value='one-dark'>One Dark</option><option value='one-dark-pro'>One Dark Pro</option><option value='vscode-dark'>VS Code Dark</option><option value='high-contrast'>High Contrast</option>
              </select></label>
              <label>Font size<select value={settings.fontSize} onChange={(event) => setSettings((current) => ({ ...current, fontSize: Number(event.target.value) }))}>
                {[12, 13, 14, 15, 16, 18].map((size) => <option key={size} value={size}>{size}px</option>)}
              </select></label>
              <label>Word wrap<input type='checkbox' checked={settings.wordWrap} onChange={(event) => setSettings((current) => ({ ...current, wordWrap: event.target.checked }))} /></label>
              <label>Show terminal<input type='checkbox' checked={settings.showTerminal} onChange={(event) => setSettings((current) => ({ ...current, showTerminal: event.target.checked }))} /></label>
              <label>Auto-save<input type='checkbox' checked={settings.autoSave} onChange={(event) => setSettings((current) => ({ ...current, autoSave: event.target.checked }))} /></label>
              <DialogButton type='button' onClick={() => setSettings(defaultWorkbenchSettings)}>Reset settings</DialogButton>
            </SettingsPanel>
          </Menu>
          <ResetButton type='button' onClick={() => openDialog('reset-project')}>Reset</ResetButton>
          <ShareButton type='button' disabled={isSaving} onClick={() => void shareProject()}>{isSaving ? 'Saving...' : 'Share'}</ShareButton>
        </Controls>
      </WorkbenchTopBar>

      <WorkbenchDialog ref={dialogRef} onCancel={closeDialog} onClick={closeDialogOnBackdrop} onClose={() => setDialogState(null)}>
        {dialogState === 'reset-project' && (
          <form onSubmit={confirmResetProject}>
            <h2>Reset everything?</h2><p>This clears every file, removes dependencies, and disconnects the saved project. This cannot be undone.</p>
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $danger type='submit'>Reset everything</DialogButton></DialogActions>
          </form>
        )}
        {dialogState === 'rename-project' && (
          <form onSubmit={confirmRenameProject}>
            <h2>Rename project</h2><label htmlFor='project-name'>Project name<input id='project-name' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit'>Rename project</DialogButton></DialogActions>
          </form>
        )}
        {dialogState === 'open-project' && (
          <form onSubmit={(event) => void confirmOpenProject(event)}>
            <h2>Open saved project</h2><p>Opening a project replaces the files currently in this workbench.</p>
            <label htmlFor='project-id'>Project ID<input id='project-id' autoFocus value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} placeholder='32-character Project ID' /></label>
            {dialogError && <DialogError role='alert'>{dialogError}</DialogError>}
            <DialogActions><DialogButton type='button' onClick={closeDialog}>Cancel</DialogButton><DialogButton $primary type='submit' disabled={isOpening}>{isOpening ? 'Opening...' : 'Open project'}</DialogButton></DialogActions>
          </form>
        )}
      </WorkbenchDialog>
    </>
  );
};

export default TopBar;
