import { FC, useEffect, useRef, useState } from 'react';
import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';

import { useAppContext } from '../../context';

import TerminalContainer from './Terminal';
import commandOuputs from './commands';

interface Props {
  id: string;
}

const Terminal: FC<Props> = ({ id }) => {
  const { filesList, addFile, removeFile } = useAppContext();
  const [terminalText, setTerminalText] = useState('');
  const xTermRef = useRef<XTerm | null>(null);
  const fitAddon = new FitAddon();
  const terminalHostname = `$root@${document.domain}~`;

  useEffect(() => {
    // prettier-ignore
    xTermRef.current?.terminal.writeln('Enter "help" to see the list of supported commands\r\n\rPress (Ctrl + L) to clear the console');
    xTermRef.current?.terminal.write(terminalHostname);
    (xTermRef.current as any).props.addons.shift().fit();
  }, [terminalHostname]);

  const onData = (data: any) => {
    const xterm = xTermRef.current;
    const code = data.charCodeAt(0);
    const touchRegex = new RegExp('(touch\\s[a-zA-Z]{4,50}).(html|htm|css|js)');
    const rmRegex = new RegExp('(rm\\s[a-zA-Z]{4,50}).(html|htm|css|js)');

    if (xterm === null || terminalText.length < 0) return;

    //  clear command
    if (terminalText === 'clear' || terminalText === 'cls') {
      xterm.terminal.reset();
      setTerminalText('');
      xterm.terminal.write(terminalHostname);
      return false;
    }

    // touch Command
    else if (touchRegex.test(terminalText)) {
      const filename = terminalText.slice(6);
      const isFilePresent = filesList.filter((name) => name === filename).length;
      let extension = terminalText.toLowerCase().split('.').pop() as string;
      // Because js === javascript in Monaco
      extension = extension === 'js' ? 'javascript' : extension;

      if (isFilePresent) {
        setTerminalText('');
        xterm.terminal.write(`\r\n\rError: File name cannot be same`);
        xterm.terminal.write(`\r\n\r${terminalHostname}`);
        return false;
      }

      addFile({ name: filename, language: extension, value: '' });
      setTerminalText('');
      xterm.terminal.write(`\r\n\r${terminalHostname}`);
      return false;
    }

    // rm command
    else if (rmRegex.test(terminalText)) {
      removeFile(terminalText.slice(3));
      setTerminalText('');
      xterm.terminal.write(`\r\n\r${terminalHostname}`);
      return false;
    }

    switch (code) {
      case 12:
        // CTRL + L (Clear Terminal)
        xterm.terminal.reset();
        setTerminalText('');
        xterm.terminal.write(terminalHostname);
        break;

      case 13:
        // Enter key
        commandOuputs(terminalText, filesList).then((output) => {
          xterm.terminal.write(`\r\n${output}\r\n`);
          xterm.terminal.write(terminalHostname);
          setTerminalText('');
        });
        break;

      case 27:
        // Filter up and down arrow press
        if (data.endsWith('A') || data.endsWith('B')) return;

        // Write to terminal on left and right arrow press
        xterm.terminal.write(data);
        setTerminalText((prevState) => prevState + data);
        break;

      case 127:
        // Backspace
        if (terminalText) {
          xterm.terminal.write('\b \b');
          setTerminalText((prevState) => prevState.substring(0, prevState.length - 1));
        }
        break;

      default:
        // General keys
        xterm.terminal.write(data);
        setTerminalText((prevState) => prevState + data);
    }
  };

  return (
    <TerminalContainer id={id}>
      <XTerm
        className="terminal-container"
        ref={xTermRef}
        addons={[fitAddon]}
        onData={onData}
        options={{
          theme: { background: '#131313', cursor: '#00FF00', foreground: '#00FF00' },
        }}
      />
    </TerminalContainer>
  );
};

export default Terminal;
