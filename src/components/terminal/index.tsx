import { FC, useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import 'xterm/css/xterm.css';

import TerminalContainer from './Terminal';

interface Props {
  id: string;
}

const Terminal: FC<Props> = ({ id }) => {
  const xTermRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = xTermRef.current as HTMLElement;
    const term = new XTerm();

    term.open(element);
  }, []);

  return (
    <TerminalContainer id={id}>
      <div ref={xTermRef} />
    </TerminalContainer>
  );
};

export default Terminal;
