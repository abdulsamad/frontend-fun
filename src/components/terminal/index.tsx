import { useEffect, useMemo, useRef, useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTermTerminal } from '@xterm/xterm';
import { useAtomValue, useSetAtom } from 'jotai';

import '@xterm/xterm/css/xterm.css';

import { addProjectFileAtom, projectFileNamesAtom, projectFilesAtom, removeProjectFileAtom } from '../../state/projectAtoms';
import { getLanguageFromFilename, isValidFilename } from '../../state/validation';
import Icon from '../Icon';
import TerminalShell, { TerminalAction, TerminalHeader, TerminalViewport } from './Terminal';
import commandOutputs from './commands';

const Terminal = () => {
  const filesList = useAtomValue(projectFileNamesAtom);
  const projectFiles = useAtomValue(projectFilesAtom);
  const addFile = useSetAtom(addProjectFileAtom);
  const removeFile = useSetAtom(removeProjectFileAtom);
  const [terminalText, setTerminalText] = useState('');
  const terminalElementRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const xTermRef = useRef<XTermTerminal | null>(null);
  const onDataRef = useRef<(data: string) => void>(() => undefined);
  const commandHistoryRef = useRef<string[]>([]);
  const fitAddon = useMemo(() => new FitAddon(), []);
  const terminalPrompt = useMemo(() => `root@${window.location.hostname}:~$ `, []);

  const resetTerminal = () => {
    const terminal = xTermRef.current;
    if (!terminal) return;
    terminal.reset();
    setTerminalText('');
    terminal.write(terminalPrompt);
  };

  useEffect(() => {
    if (!terminalElementRef.current || !viewportRef.current) return;
    const terminal = new XTermTerminal({
      theme: {
        background: '#1F1F1F',
        cursor: '#AEAFAD',
        foreground: '#CCCCCC',
        selectionBackground: '#264F78',
      },
      fontFamily: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
    });
    xTermRef.current = terminal;
    terminal.loadAddon(fitAddon);
    terminal.open(terminalElementRef.current);
    const dataSubscription = terminal.onData((data) => onDataRef.current(data));

    let frame = 0;
    let initialized = false;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          fitAddon.fit();
          if (!initialized && terminal.cols > 2) {
            initialized = true;
            terminal.writeln('Type "help" to list supported commands. Ctrl+L clears the terminal.');
            terminal.write(`\r\n${terminalPrompt}`);
          }
        } catch { /* The pane may be hidden between responsive views. */ }
      });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(viewportRef.current);
    fit();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dataSubscription.dispose();
      terminal.dispose();
      xTermRef.current = null;
    };
  }, [fitAddon, terminalPrompt]);

  const onData = (data: string) => {
    const terminal = xTermRef.current;
    const code = data.charCodeAt(0);
    const touchMatch = terminalText.match(/^touch\s+([^\s]+)$/i);
    const rmMatch = terminalText.match(/^rm\s+([^\s]+)$/i);
    if (!terminal) return;

    if (terminalText === 'clear' || terminalText === 'cls') {
      resetTerminal();
      return;
    }
    if (touchMatch) {
      const filename = touchMatch[1];
      if (!isValidFilename(filename)) {
        terminal.write(`\r\nError: use a valid .html, .css, or .js filename\r\n${terminalPrompt}`);
      } else if (filesList.includes(filename)) {
        terminal.write(`\r\nError: a file with that name already exists\r\n${terminalPrompt}`);
      } else {
        addFile({ name: filename, language: getLanguageFromFilename(filename), value: '' });
        terminal.write(`\r\n${terminalPrompt}`);
      }
      setTerminalText('');
      return;
    }
    if (rmMatch) {
      const filename = rmMatch[1];
      if (!filesList.includes(filename)) terminal.write(`\r\nError: file not found: ${filename}`);
      else removeFile(filename);
      setTerminalText('');
      terminal.write(`\r\n${terminalPrompt}`);
      return;
    }

    switch (code) {
      case 12:
        resetTerminal();
        break;
      case 13:
        const command = terminalText.trim();
        if (command) commandHistoryRef.current = [...commandHistoryRef.current.slice(-49), command];
        commandOutputs(command, projectFiles, commandHistoryRef.current)
          .then((output) => {
            if (output === '__CLEAR__') {
              resetTerminal();
              return;
            }
            terminal.write(`\r\n${output}\r\n${terminalPrompt}`);
            setTerminalText('');
          })
          .catch((error: unknown) => {
            terminal.write(`\r\nError: ${error instanceof Error ? error.message : 'command failed'}\r\n${terminalPrompt}`);
            setTerminalText('');
          });
        break;
      case 27:
        if (!data.endsWith('A') && !data.endsWith('B')) {
          terminal.write(data);
          setTerminalText((current) => current + data);
        }
        break;
      case 127:
        if (terminalText) {
          terminal.write('\b \b');
          setTerminalText((current) => current.slice(0, -1));
        }
        break;
      default:
        terminal.write(data);
        setTerminalText((current) => current + data);
    }
  };
  onDataRef.current = onData;

  return (
    <TerminalShell id='terminal' aria-label='Terminal'>
      <TerminalHeader>
        <h2>Terminal</h2>
        <TerminalAction type='button' aria-label='Clear terminal' title='Clear terminal' onClick={resetTerminal}>
          <Icon name='delete' size={14} />
        </TerminalAction>
      </TerminalHeader>
      <TerminalViewport ref={viewportRef}>
        <div ref={terminalElementRef} className='terminal-container' />
      </TerminalViewport>
    </TerminalShell>
  );
};

export default Terminal;
