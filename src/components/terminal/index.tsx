import { FC } from 'react';

import TerminalContainer from './Terminal';

interface Props {
  id: string;
}

const Terminal: FC<Props> = ({ id }) => {
  return (
    <TerminalContainer id={id}>
      <h1>Hello From Terminal</h1>
    </TerminalContainer>
  );
};

export default Terminal;
