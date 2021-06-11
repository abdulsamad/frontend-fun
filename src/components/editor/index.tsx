import { FC } from 'react';
import Editor from '@monaco-editor/react';

import { useAppContext } from '../../context';

import EditorContainer from './Editor';
import { Nav, NavItem } from './Nav';
import AddLanguageLogo from '../../utils/AddLanguageLogo';

interface Props {
  id: string;
}

const Index: FC<Props> = ({ id }) => {
  const { filesData, activeFileName, filesList, changeActiveFile, addFileData } = useAppContext();
  const activeFileData = filesData.filter(({ name }) => name === activeFileName)[0];

  const handleEditorChange = (value: any) => {
    addFileData(value);
  };

  return (
    <>
      <Nav>
        {filesList.map((name) => (
          <NavItem
            key={name}
            active={name === activeFileName}
            disabled={name === activeFileName}
            onClick={() => changeActiveFile(name)}
          >
            <AddLanguageLogo fileName={name} />
          </NavItem>
        ))}
      </Nav>
      <EditorContainer id={id}>
        <Editor
          height="100%"
          theme="vs-dark"
          defaultLanguage={activeFileData.language}
          defaultValue={activeFileData.value}
          path={activeFileData.name}
          onChange={handleEditorChange}
        />
      </EditorContainer>
    </>
  );
};

export default Index;
