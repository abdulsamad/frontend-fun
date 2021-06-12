import { FC, useEffect, useRef, useState } from 'react';
import { XTerm } from 'xterm-for-react';
import 'xterm/css/xterm.css';

import TerminalContainer from './Terminal';
import CommandOutput from './commands';

interface Props {
  id: string;
}

const Terminal: FC<Props> = ({ id }) => {
  const [terminalText, setTerminalText] = useState('');
  const xTermRef = useRef<XTerm | null>(null);
  const terminalHostname = `$root@${document.domain}~`;

  useEffect(() => {
    xTermRef.current?.terminal.writeln('Enter help to see the list of supported commands');
    xTermRef.current?.terminal.write(terminalHostname);
  }, [terminalHostname]);

  const onData = (data: any) => {
    const xterm = xTermRef.current;
    const code = data.charCodeAt(0);

    if (xterm === null || terminalText.length < 0) return;

    //  Clear Command
    if (terminalText === 'clear' || terminalText === 'cls') {
      xterm.terminal.reset();
      setTerminalText('');
      xterm.terminal.write(terminalHostname);
      return false;
    }

    switch (code) {
      case 12:
        xterm.terminal.reset();
        setTerminalText('');
        xterm.terminal.write(terminalHostname);
        break;

      case 13:
        xterm.terminal.write(`\r\n ${terminalText} \r\n`);
        xterm.terminal.write(terminalHostname);
        setTerminalText('');
        break;

      case 127:
        // backspace
        if (terminalText) {
          xterm.terminal.write('\x1b[D');
          setTerminalText((prevState) => prevState.substring(0, prevState.length - 1));
        }
        break;

      default:
        // Add general key press characters to the terminal
        xterm.terminal.write(data);
        setTerminalText((prevState) => prevState + data);
    }
  };

  return (
    <TerminalContainer id={id}>
      <XTerm ref={xTermRef} onData={onData} />
    </TerminalContainer>
  );
};

export default Terminal;
