import { FC, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useDebouncedFn } from 'beautiful-react-hooks';
import { emmetHTML, emmetCSS } from 'emmet-monaco-es';

import { useAppContext } from '../../context';

import EditorContainer from './Editor';
import { Nav, NavItem, WrapButton } from './Nav';
import AddLanguageLogo from '../../utils/AddLanguageLogo';
import { customTheme } from './themes';

interface Props {
  id: string;
}

const Index: FC<Props> = ({ id }) => {
  const { activeFile, filesData, changeActiveFile, addFileData } = useAppContext();
  const [wrap, setWrap] = useState(false);

  const handleEditorChange = useDebouncedFn((value: any) => {
    addFileData(value);
  }, 1000);

  const handleOnMount = () => {
    emmetHTML((window as any).monaco);
    emmetCSS((window as any).monaco);
  };

  const handleBeforeMount = (ev: any) => {
    // Add theme
    ev.editor.defineTheme('one-dark-pro', customTheme);
  };

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
        <WrapButton
          onClick={() => setWrap((prevState) => !prevState)}
          title="Toggle WordWrap"
          active={!wrap}
        >
          <svg width="17px" height="16px" viewBox="0 0 17 16">
            <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <g id="Rounded" transform="translate(-138.000000, -2063.000000)">
                <g id="Editor" transform="translate(100.000000, 1960.000000)">
                  <g id="-Round-/-Editor-/-wrap_text" transform="translate(34.000000, 98.000000)">
                    <g>
                      <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                      <path
                        d="M5,7 L19,7 C19.55,7 20,6.55 20,6 C20,5.45 19.55,5 19,5 L5,5 C4.45,5 4,5.45 4,6 C4,6.55 4.45,7 5,7 Z M16.83,11 L5,11 C4.45,11 4,11.45 4,12 C4,12.55 4.45,13 5,13 L17.13,13 C18.13,13 19.06,13.67 19.22,14.66 C19.43,15.91 18.46,17 17.25,17 L15,17 L15,16.21 C15,15.76 14.46,15.54 14.15,15.86 L12.36,17.65 C12.16,17.85 12.16,18.16 12.36,18.36 L14.15,20.15 C14.47,20.47 15,20.24 15,19.8 L15,19 L17,19 C19.34,19 21.21,16.99 20.98,14.61 C20.78,12.53 18.92,11 16.83,11 Z M9,17 L5,17 C4.45,17 4,17.45 4,18 C4,18.55 4.45,19 5,19 L9,19 C9.55,19 10,18.55 10,18 C10,17.45 9.55,17 9,17 Z"
                        id="🔹-Icon-Color"
                        fill="#f5f5f5"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </WrapButton>
      </Nav>
      <EditorContainer id={id}>
        <Editor
          theme="one-dark-pro"
          defaultLanguage={activeFile.language}
          value={activeFile.value}
          path={activeFile.name}
          onChange={handleEditorChange}
          onMount={handleOnMount}
          beforeMount={handleBeforeMount}
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: 16,
            fontFamily: 'Fira Code',
            fontLigatures: true,
            formatOnPaste: true,
            wordWrap: wrap ? 'on' : 'off',
            smoothScrolling: true,
          }}
        />
      </EditorContainer>
    </>
  );
};

export default Index;
