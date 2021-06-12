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
  const { filesData, filesList, activeFileName, changeActiveFile, addFile } = useAppContext();

  const isAcceptedFileFormat = (filename: string) =>
    filename.endsWith('html') ||
    filename.endsWith('htm') ||
    filename.endsWith('css') ||
    filename.endsWith('js');

  const addNewFile = () => {
    const filename = window.prompt('Please enter file name', 'index.html');

    if (filename !== '' && filename !== null && isAcceptedFileFormat(filename)) {
      const isFilePresent = filesList.filter((name) => name === filename).length;
      let extension = filename.toLowerCase().split('.').pop() as string;
      // Because js === javascript in Monaco
      extension = extension === 'js' ? 'javascript' : extension;

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

  const saveWork = () => {
    const id = localStorage.getItem('id');

    if (id) {
      fetch(`/api/saveFilesData?_id=${id}`, {
        method: 'POST',
        body: JSON.stringify({ filesData }),
      })
        .then((res) => res.json())
        .then(() => {
          alert('Successfuly updated your saved data');
        });
      return false;
    }

    fetch('/api/saveFilesData', {
      method: 'POST',
      body: JSON.stringify({ filesData }),
    })
      .then((res) => res.json())
      .then(({ _id }) => {
        localStorage.setItem('id', _id);
        alert('Successfuly saved your data');
      });
  };

  return (
    <SidebarSection id={id}>
      <Panel>
        <PanelItem active={true}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 6c3.469 0 2 5 2 5s5-1.594 5 2v9h-12v-16h5zm.827-2h-7.827v20h16v-11.842c0-2.392-5.011-8.158-8.173-8.158zm.173-2l-3-2h-9v22h2v-20h10z" />
          </svg>
        </PanelItem>
        <PanelItem title="Save files data" onClick={saveWork}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 3h2.996v5h-2.996v-5zm11 1v20h-24v-24h20l4 4zm-17 5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z" />
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
