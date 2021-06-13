import { FC } from 'react';
import Editor from '@monaco-editor/react';
import { useDebouncedFn } from 'beautiful-react-hooks';

import { useAppContext } from '../../context';

import EditorContainer from './Editor';
import { Nav, NavItem } from './Nav';
import AddLanguageLogo from '../../utils/AddLanguageLogo';

interface Props {
  id: string;
}

const Index: FC<Props> = ({ id }) => {
  const { activeFile, filesData, changeActiveFile, addFileData } = useAppContext();

  const handleEditorChange = useDebouncedFn((value: any) => {
    addFileData(value);
  }, 1000);

  return (
    <>
      <Nav>
        {filesData.map((file) => (
          <NavItem
            key={file.name}
            active={file.name === activeFile.name}
            disabled={file.name === activeFile.name}
            onClick={() => changeActiveFile(file)}
          >
            <AddLanguageLogo fileName={file.name} />
          </NavItem>
        ))}
      </Nav>
      <EditorContainer id={id}>
        <Editor
          height="100%"
          theme="vs-dark"
          defaultLanguage={activeFile.language}
          defaultValue={activeFile.value}
          path={activeFile.name}
          onChange={handleEditorChange}
        />
      </EditorContainer>
    </>
  );
};

export default Index;
