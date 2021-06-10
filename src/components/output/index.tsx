import { FC } from 'react';

import OutputContainer from './Output';

interface Props {
  id: string;
}

const Output: FC<Props> = ({ id }) => {
  return (
    <OutputContainer id={id}>
      <h1>Output</h1>
    </OutputContainer>
  );
};

export default Output;
