import { FC } from 'react';

import EditorContainer from './Editor';

interface Props {
  id: string;
}

const Editor: FC<Props> = ({ id }) => {
  return (
    <EditorContainer id={id}>
      <h1>Hello from Editor</h1>
    </EditorContainer>
  );
};

export default Editor;
