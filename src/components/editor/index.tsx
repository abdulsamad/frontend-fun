import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { emmetCSS, emmetHTML } from 'emmet-monaco-es';
import { useAtomValue, useSetAtom } from 'jotai';

import {
  activeFileAtom,
  closeProjectFileAtom,
  openFileNamesAtom,
  projectFileSummariesAtom,
  selectProjectFileAtom,
  updateActiveFileAtom,
} from '../../state/projectAtoms';
import { workbenchSettingsAtom } from '../../state/settings';
import AddLanguageLogo from '../../utils/AddLanguageLogo';
import Icon from '../Icon';
import EditorGroup, { Breadcrumbs, EditorSurface, StatusBar, StatusGroup } from './Editor';
import { ActionButton, CloseButton, EditorActions, EditorTabs, Tab, TabButton, TabList } from './Nav';
import { customTheme, oneDarkProTheme, oneDarkTheme } from './themes';

const Editor = () => {
  const activeFile = useAtomValue(activeFileAtom);
  const files = useAtomValue(projectFileSummariesAtom);
  const openFiles = useAtomValue(openFileNamesAtom);
  const selectFile = useSetAtom(selectProjectFileAtom);
  const closeFile = useSetAtom(closeProjectFileAtom);
  const updateActiveFile = useSetAtom(updateActiveFileAtom);
  const settings = useAtomValue(workbenchSettingsAtom);
  const setSettings = useSetAtom(workbenchSettingsAtom);
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 });
  const cursorSubscription = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => () => cursorSubscription.current?.dispose(), []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    emmetHTML(monaco as never);
    emmetCSS(monaco as never);
    cursorSubscription.current?.dispose();
    cursorSubscription.current = editor.onDidChangeCursorPosition(({ position }) => setCursor(position));
  };

  const focusTab = (filename: string) => {
    requestAnimationFrame(() => document.getElementById(`editor-tab-${filename}`)?.focus());
  };

  const selectTab = (index: number) => {
    const normalizedIndex = (index + openFiles.length) % openFiles.length;
    const filename = openFiles[normalizedIndex];
    const file = files.find((candidate) => candidate.name === filename);
    if (!file) return;
    selectFile(file.name);
    focusTab(file.name);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, filename: string) => {
    if (event.key === 'ArrowRight') selectTab(index + 1);
    else if (event.key === 'ArrowLeft') selectTab(index - 1);
    else if (event.key === 'Home') selectTab(0);
    else if (event.key === 'End') selectTab(openFiles.length - 1);
    else if (event.key === 'Delete' && openFiles.length > 1) closeFile(filename);
    else return;
    event.preventDefault();
  };

  const handleCloseFile = (event: MouseEvent<HTMLButtonElement>, filename: string) => {
    event.stopPropagation();
    closeFile(filename);
  };

  return (
    <EditorGroup id='editor' aria-label='Code editor'>
      <EditorTabs aria-label='Open files'>
        <TabList>
          {openFiles.map((filename, index) => {
            const file = files.find((candidate) => candidate.name === filename);
            if (!file) return null;
            const active = file.name === activeFile.name;
            return (
              <Tab key={file.name} $active={active}>
                <TabButton
                  id={`editor-tab-${file.name}`}
                  type='button'
                  aria-current={active ? 'page' : undefined}
                  onKeyDown={(event) => handleTabKeyDown(event, index, file.name)}
                  onClick={() => !active && selectFile(file.name)}>
                  <AddLanguageLogo fileName={file.name} />
                  <span>{file.name}</span>
                </TabButton>
                {!/\.html$/i.test(file.name) && (
                  <CloseButton
                    type='button'
                    disabled={openFiles.length <= 1}
                    aria-label={`Close ${file.name}`}
                    title={openFiles.length <= 1 ? 'Keep one file open' : `Close ${file.name}`}
                    onClick={(event) => handleCloseFile(event, file.name)}>
                    <Icon name='close' size={13} />
                  </CloseButton>
                )}
              </Tab>
            );
          })}
        </TabList>
        <EditorActions>
          <ActionButton type='button' $active={settings.wordWrap} aria-pressed={settings.wordWrap} aria-label='Toggle word wrap' title={`Word wrap: ${settings.wordWrap ? 'on' : 'off'}`} onClick={() => setSettings((current) => ({ ...current, wordWrap: !current.wordWrap }))}>
            <Icon name='word-wrap' />
          </ActionButton>
        </EditorActions>
      </EditorTabs>
      <Breadcrumbs aria-label='File location'><span>frontend-fun</span><span>{activeFile.name}</span></Breadcrumbs>
      <EditorSurface>
        <MonacoEditor
          theme={settings.theme === 'one-dark-pro' ? 'frontend-fun-one-dark-pro' : settings.theme === 'one-dark' ? 'frontend-fun-one-dark' : 'frontend-fun-dark'}
          language={activeFile.language}
          value={activeFile.value}
          path={activeFile.name}
          onChange={(value) => updateActiveFile(value ?? '')}
          onMount={handleEditorMount}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('frontend-fun-dark', customTheme);
            monaco.editor.defineTheme('frontend-fun-one-dark', oneDarkTheme);
            monaco.editor.defineTheme('frontend-fun-one-dark-pro', oneDarkProTheme);
          }}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: settings.fontSize,
            lineHeight: 22,
            fontFamily: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
            fontLigatures: true,
            formatOnPaste: true,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            renderLineHighlight: 'all',
          }}
        />
      </EditorSurface>
      <StatusBar>
        <StatusGroup><span>Live preview</span><span>{activeFile.language}</span></StatusGroup>
        <StatusGroup><span>Ln {cursor.lineNumber}, Col {cursor.column}</span><span>Spaces: 2</span><span>Wrap {settings.wordWrap ? 'On' : 'Off'}</span></StatusGroup>
      </StatusBar>
    </EditorGroup>
  );
};

export default Editor;
