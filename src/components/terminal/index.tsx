import { useEffect, useMemo, useRef } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTermTerminal } from '@xterm/xterm';
import { useAtomValue, useSetAtom } from 'jotai';

import '@xterm/xterm/css/xterm.css';

import { addProjectFileAtom, projectFileNamesAtom, projectFilesAtom, removeProjectFileAtom } from '../../state/projectAtoms';
import { getLanguageFromFilename, isValidNewFilename } from '../../state/validation';
import Icon from '../Icon';
import TerminalShell, { TerminalAction, TerminalHeader, TerminalViewport } from './Terminal';
import commandOutputs from './commands';

const Terminal = () => {
  const filesList = useAtomValue(projectFileNamesAtom);
  const projectFiles = useAtomValue(projectFilesAtom);
  const addFile = useSetAtom(addProjectFileAtom);
  const removeFile = useSetAtom(removeProjectFileAtom);
  const terminalTextRef = useRef('');
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
    terminalTextRef.current = '';
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
    if (!terminal) return;

    const appendText = (text: string) => {
      terminal.write(text);
      terminalTextRef.current += text;
    };

    const executeCommand = () => {
      const command = terminalTextRef.current.trim();
      if (command) commandHistoryRef.current = [...commandHistoryRef.current.slice(-49), command];
      const touchMatch = command.match(/^touch\s+([^\s]+)$/i);
      const rmMatch = command.match(/^rm\s+([^\s]+)$/i);
      terminalTextRef.current = '';

      if (touchMatch) {
        const filename = touchMatch[1];
        if (!isValidNewFilename(filename)) {
          terminal.write(`\r\nError: new files must use a valid .css or .js filename\r\n${terminalPrompt}`);
        } else if (filesList.includes(filename)) {
          terminal.write(`\r\nError: a file with that name already exists\r\n${terminalPrompt}`);
        } else {
          addFile({ name: filename, language: getLanguageFromFilename(filename), value: '' });
          terminal.write(`\r\n${terminalPrompt}`);
        }
        return;
      }
      if (rmMatch) {
        const filename = rmMatch[1];
        if (!filesList.includes(filename)) terminal.write(`\r\nError: file not found: ${filename}`);
        else removeFile(filename);
        terminal.write(`\r\n${terminalPrompt}`);
        return;
      }
      commandOutputs(command, projectFiles, commandHistoryRef.current)
        .then((output) => {
          if (output === '__CLEAR__') {
            resetTerminal();
            return;
          }
          terminal.write(`\r\n${output}\r\n${terminalPrompt}`);
        })
        .catch((error: unknown) => {
          terminal.write(`\r\nError: ${error instanceof Error ? error.message : 'command failed'}\r\n${terminalPrompt}`);
        });
    };

    // Mobile keyboards may send a complete text chunk and use LF for Enter.
    // Process the chunk character-by-character so the command buffer stays
    // correct even when text and Enter arrive in the same xterm data event.
    for (let index = 0; index < data.length; index += 1) {
      const input = data[index];
      const code = input.charCodeAt(0);

      if (terminalTextRef.current === 'clear' || terminalTextRef.current === 'cls') {
        resetTerminal();
        return;
      }

      // Avoid executing twice when a pasted/mobile line ending arrives as CRLF.
      if (code === 10 && data[index - 1] === '\r') continue;

      switch (code) {
        case 10:
        case 13:
          executeCommand();
          break;
        case 12:
          resetTerminal();
          break;
        case 27:
          // Ignore arrow-key escape sequences. They are not part of a command.
          const escapeSequence = data.slice(index).match(/^\x1b\[[0-9;?]*[A-Z]/);
          if (escapeSequence) index += escapeSequence[0].length - 1;
          break;
        case 8:
        case 127:
          if (terminalTextRef.current) {
            terminal.write('\b \b');
            terminalTextRef.current = terminalTextRef.current.slice(0, -1);
          }
          break;
        default:
          appendText(input);
      }
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
