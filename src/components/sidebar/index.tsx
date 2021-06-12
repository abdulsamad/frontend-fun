import { FC } from 'react';

import { useAppContext } from '../../context';

import SidebarSection from './Sidebar';
import { Panel, PanelItem } from './Panel';
import { Files, FileItem, TopBar, TopBarButton } from './Files';
import AddLanguageLogo from '../../utils/AddLanguageLogo';

interface Props {
  id: string;
}

const Sidebar: FC<Props> = ({ id }) => {
  const { filesList, activeFileName, changeActiveFile, addFile } = useAppContext();

  const addNewFile = () => {
    const acceptedFileFormats = 'html' || 'htm' || 'css' || 'js';
    const filename = window.prompt('Please enter file name', 'index.html');

    //  endsWith is ES6 specs. Should be replaced with regex for IE support and improved validation
    if (filename !== '' && filename !== null && filename.endsWith(acceptedFileFormats)) {
      const isFilePresent = filesList.filter((name) => name === filename).length;
      const extension = filename.toLowerCase().split('.').pop() as string;

      if (isFilePresent) {
        alert('File name should be different');
        return;
      }

      addFile({
        name: filename,
        language: extension,
        value: '',
      });
    } else {
      alert('File format not supported! Only .html, .css, .js 😔');
    }
  };

  return (
    <SidebarSection id={id}>
      <Panel>
        <PanelItem active={true}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 6c3.469 0 2 5 2 5s5-1.594 5 2v9h-12v-16h5zm.827-2h-7.827v20h16v-11.842c0-2.392-5.011-8.158-8.173-8.158zm.173-2l-3-2h-9v22h2v-20h10z" />
          </svg>
        </PanelItem>
      </Panel>
      <Files>
        <TopBar>
          Files
          <TopBarButton onClick={addNewFile}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M23 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-7 5v2h-15v-24h10.189c3.163 0 9.811 7.223 9.811 9.614v2.386h-2v-1.543c0-4.107-6-2.457-6-2.457s1.518-6-2.638-6h-7.362v20h13z" />
            </svg>
          </TopBarButton>
        </TopBar>
        {filesList.map((name) => (
          <FileItem
            active={name === activeFileName}
            key={name}
            onClick={() => {
              changeActiveFile(name);
            }}
          >
            <AddLanguageLogo fileName={name} />
          </FileItem>
        ))}
      </Files>
    </SidebarSection>
  );
};

export default Sidebar;
