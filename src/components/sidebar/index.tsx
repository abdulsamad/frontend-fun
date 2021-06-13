import { FC, MouseEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAppContext } from '../../context';

import SidebarSection from './Sidebar';
import { Panel, PanelItem, UserId } from './Panel';
import { Files, FileItem, TopBar, TopBarButton, DeleteButton } from './Files';
import AddLanguageLogo from '../../utils/AddLanguageLogo';

interface Props {
  id: string;
}

const Sidebar: FC<Props> = ({ id }) => {
  const {
    filesData,
    filesList,
    activeFile,
    changeActiveFile,
    addFile,
    addImportedFilesData,
    removeFile,
  } = useAppContext();

  const isAcceptedFileFormat = (filename: string) =>
    filename.endsWith('html') ||
    filename.endsWith('htm') ||
    filename.endsWith('css') ||
    filename.endsWith('js');

  const addNewFile = () => {
    const filename = window.prompt('Please enter file name');

    if (filename !== '' && filename !== null && isAcceptedFileFormat(filename)) {
      const isFilePresent = filesList.filter((name) => name === filename).length;
      let extension = filename.toLowerCase().split('.').pop() as string;
      // Because js === javascript in Monaco
      extension = extension === 'js' ? 'javascript' : extension;

      if (isFilePresent) {
        toast.error('File name cannot be same');
        return;
      }

      addFile({
        name: filename,
        language: extension,
        value: '',
      });
    } else if (filename) {
      toast.error('File format not supported! Only .html, .css, .js 😔');
    }
  };

  const delteFile = (ev: MouseEvent, filename: string) => {
    ev.stopPropagation();
    const doDelete = window.confirm('Are you sure you want to delete this file?');

    if (doDelete) {
      removeFile(filename);
      //
    }
  };

  const saveWork = () => {
    const id = localStorage.getItem('id');

    if (id) {
      fetch(`/api/saveFilesData?id=${id}`, {
        method: 'POST',
        body: JSON.stringify({ filesData }),
      })
        .then((res) => res.json())
        .then(({ id }) => {
          toast.dismiss();
          toast.dark(
            <div>
              Successfuly updated your saved data.
              <br />
              You can also import your saved data from anywhere by entering <UserId>{id}</UserId> in
              the import option.
            </div>
          );
        });
      return false;
    }

    fetch('/api/saveFilesData', {
      method: 'POST',
      body: JSON.stringify({ filesData }),
    })
      .then((res) => res.json())
      .then(({ id }) => {
        localStorage.setItem('id', id);
        toast.dismiss();
        toast.dark(
          <div>
            Successfuly saved your data.
            <br />
            You can also import your saved data from anywhere by entering <UserId>{id}</UserId> in
            the import option.
          </div>
        );
      });
  };

  const getSavedWork = () => {
    const id = window.prompt('Please enter your saved data ID');

    if (id) {
      fetch(`/api/getFilesData?id=${id}`)
        .then((res) => res.json())
        .then(({ filesData }) => {
          addImportedFilesData(filesData);
        });
    }
  };

  return (
    <SidebarSection id={id}>
      <ToastContainer
        position="bottom-left"
        closeOnClick={false}
        autoClose={false}
        draggable={false}
      />
      <Panel>
        <PanelItem title="Explorer" active={true}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 6c3.469 0 2 5 2 5s5-1.594 5 2v9h-12v-16h5zm.827-2h-7.827v20h16v-11.842c0-2.392-5.011-8.158-8.173-8.158zm.173-2l-3-2h-9v22h2v-20h10z" />
          </svg>
        </PanelItem>
        <PanelItem title="Save data" onClick={saveWork}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13 3h2.996v5h-2.996v-5zm11 1v20h-24v-24h20l4 4zm-17 5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z" />
          </svg>
        </PanelItem>
        <PanelItem title="Import saved data" onClick={getSavedWork}>
          <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
            <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z" />
          </svg>
        </PanelItem>
      </Panel>
      <Files>
        <TopBar>
          Files
          <TopBarButton title="Add new file" onClick={addNewFile}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M23 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-7 5v2h-15v-24h10.189c3.163 0 9.811 7.223 9.811 9.614v2.386h-2v-1.543c0-4.107-6-2.457-6-2.457s1.518-6-2.638-6h-7.362v20h13z" />
            </svg>
          </TopBarButton>
        </TopBar>
        {filesData.map((file) => (
          <FileItem
            active={file.name === activeFile.name}
            key={file.name}
            onClick={() => changeActiveFile(file)}
          >
            <div>
              <AddLanguageLogo fileName={file.name} />
            </div>
            <DeleteButton title="Delete file" onClick={(ev) => delteFile(ev, file.name)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5f5f5">
                <path d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z" />
              </svg>
            </DeleteButton>
          </FileItem>
        ))}
      </Files>
    </SidebarSection>
  );
};

export default Sidebar;
