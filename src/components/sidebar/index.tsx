import { FC, MouseEvent } from 'react';
import { toast } from 'react-toastify';

import { useAppContext } from '../../context';

import SidebarSection from './Sidebar';
import { Panel, PanelItem, UserId } from './Panel';
import { Files, FileItem, TopBar, TopBarButton, DeleteButton } from './Files';
import AddLanguageLogo from '../../utils/AddLanguageLogo';
import { getLanguageFromFilename, isValidFilename, validateFiles } from '../../context/validation';
import { FilesPayload, FilesResponse } from '../../shared/filesContract';

const PROJECT_ID_PATTERN = /^[a-f0-9]{32}$/i;

const Sidebar: FC = () => {
	const {
		filesData,
		filesList,
		activeFile,
		changeActiveFile,
		addFile,
		addImportedFilesData,
		removeFile,
	} = useAppContext();

	const addNewFile = () => {
		const filename = window.prompt('Please enter file name')?.trim();

		if (filename && isValidFilename(filename)) {
			const isFilePresent = filesList.some(
				(name) => name.toLowerCase() === filename.toLowerCase(),
			);
			const extension = getLanguageFromFilename(filename);

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

	const deleteFile = (ev: MouseEvent, filename: string) => {
		ev.stopPropagation();
		const doDelete = window.confirm(
			'Are you sure you want to delete this file?',
		);

		if (doDelete) {
			if (filesData.length === 1) {
				toast.error('Keep at least one file in the project.');
				return;
			}
			removeFile(filename);
		}
	};

	const saveWork = async (ev: MouseEvent) => {
		const elem = ev.currentTarget as HTMLButtonElement;
		if (elem.disabled) return;
		let id = localStorage.getItem('id');
		let version = localStorage.getItem('projectVersion');
		if (id && !PROJECT_ID_PATTERN.test(id)) {
			localStorage.removeItem('id');
			localStorage.removeItem('projectVersion');
			id = null;
			version = null;
		}
		const headers = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};
		const errorFn = (message = 'Sorry! unable to save your data') => {
			elem.disabled = false;
			elem.style.cursor = 'pointer';
			toast.dismiss();
			toast.error(message);
		};

		// Disable button
		elem.disabled = true;
		elem.style.cursor = 'progress';

		try {
			// R2 projects saved before version tracking have an ID but no local
			// ETag. Read only their version so their first update stays safe.
			if (id && !version) {
				const existing = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`);
				const existingData = await existing.json() as FilesResponse;
				if (!existing.ok || !existingData.version) {
					localStorage.removeItem('id');
					localStorage.removeItem('projectVersion');
					id = null;
				} else {
					version = existingData.version;
					localStorage.setItem('projectVersion', version);
				}
			}
			const saveHeaders = id && version ? { ...headers, 'If-Match': version } : headers;
			const response = await fetch(id ? `/api/saveFilesData?id=${encodeURIComponent(id)}` : '/api/saveFilesData', {
				method: 'POST',
				headers: saveHeaders,
				body: JSON.stringify({ filesData } satisfies FilesPayload),
			});
			const data = await response.json() as FilesResponse;
			if (!response.ok || !data.id || !data.version) {
				if (response.status === 409) errorFn('This project changed elsewhere. Import it before saving again.');
				else if (response.status === 413) errorFn('This project is larger than the 5 MiB remote save limit.');
				else errorFn(data.err || 'Sorry! unable to save your data');
				return;
			}
			localStorage.setItem('id', data.id);
			localStorage.setItem('projectVersion', data.version);
			toast.dismiss();
			toast.dark(<div>Successfully saved your data.<br />Use <UserId>{data.id}</UserId> to import it later.</div>);
		} catch { errorFn(); }
		elem.disabled = false;
		elem.style.cursor = 'pointer';
	};

	const getSavedWork = async (ev: MouseEvent) => {
		const elem = ev.currentTarget as HTMLButtonElement;
		if (elem.disabled) return;
		const id = window.prompt('Please enter your saved data ID');

		if (id) {
			elem.disabled = true;
			try {
				const response = await fetch(`/api/getFilesData?id=${encodeURIComponent(id)}`);
				const data = await response.json() as FilesResponse;
				const imported = validateFiles(data.filesData);
				if (!response.ok || !imported || !data.version) throw new Error(data.err || 'Import failed');
				if (filesData.some((file) => file.value.length > 0) && !window.confirm('Importing will replace your current local work. Continue?')) return;
				localStorage.setItem('id', id);
				localStorage.setItem('projectVersion', data.version);
				addImportedFilesData(imported);
				toast.dark('Successfully imported your saved data');
			} catch { toast.error('Sorry! unable to import your data'); }
			elem.disabled = false;
		}
	};

	return (
		<SidebarSection id='sidebar'>
			<Panel>
				<PanelItem title='Explorer' active={true}>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						style={{ pointerEvents: 'none' }}>
						<path d='M13 6c3.469 0 2 5 2 5s5-1.594 5 2v9h-12v-16h5zm.827-2h-7.827v20h16v-11.842c0-2.392-5.011-8.158-8.173-8.158zm.173-2l-3-2h-9v22h2v-20h10z' />
					</svg>
				</PanelItem>
				<PanelItem title='Save data remotely' onClick={saveWork}>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						style={{ pointerEvents: 'none' }}>
						<path d='M13 3h2.996v5h-2.996v-5zm11 1v20h-24v-24h20l4 4zm-17 5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z' />
					</svg>
				</PanelItem>
				<PanelItem title='Import remotely saved data' onClick={getSavedWork}>
					<svg
						width='24'
						height='24'
						fillRule='evenodd'
						clipRule='evenodd'
						style={{ pointerEvents: 'none' }}>
						<path d='M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z' />
					</svg>
				</PanelItem>
			</Panel>
			<Files>
				<TopBar>
					Files
					<TopBarButton title='Add new file' onClick={addNewFile}>
						<svg width='16' height='16' viewBox='0 0 24 24'>
							<path d='M23 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-7 5v2h-15v-24h10.189c3.163 0 9.811 7.223 9.811 9.614v2.386h-2v-1.543c0-4.107-6-2.457-6-2.457s1.518-6-2.638-6h-7.362v20h13z' />
						</svg>
					</TopBarButton>
				</TopBar>
				{filesData.map((file) => (
					<FileItem
						active={file.name === activeFile.name}
						key={file.name}
						onClick={() => changeActiveFile(file)}>
						<div>
							<AddLanguageLogo fileName={file.name} />
						</div>
						<DeleteButton
							aria-label={`Delete ${file.name}`}
							title='Delete file'
							onClick={(ev) => deleteFile(ev, file.name)}>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='#f5f5f5'>
								<path d='M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z' />
							</svg>
						</DeleteButton>
					</FileItem>
				))}
			</Files>
		</SidebarSection>
	);
};

export default Sidebar;
