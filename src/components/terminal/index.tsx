import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';

import { useAppContext } from '../../context';

import TerminalContainer from './Terminal';
import commandOuputs from './commands';
import { getLanguageFromFilename, isValidFilename } from '../../context/validation';

const Terminal: FC = () => {
	const { filesList, addFile, removeFile } = useAppContext();
	const [terminalText, setTerminalText] = useState('');
	const xTermRef = useRef<XTerm | null>(null);
	const fitAddon = useMemo(() => new FitAddon(), []);
	const terminalHostname = useMemo(() => `$root@${window.location.hostname}~`, []);

	useEffect(() => {
		// prettier-ignore
		xTermRef.current?.terminal.writeln('Enter "help" to see the list of supported commands\r\n\rPress (Ctrl + L) to clear the console');
		xTermRef.current?.terminal.write(terminalHostname);
		fitAddon.fit();
		const onResize = () => fitAddon.fit();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [fitAddon, terminalHostname]);

	const onData = (data: string) => {
		const xterm = xTermRef.current;
		const code = data.charCodeAt(0);
		const touchMatch = terminalText.match(/^touch\s+([^\s]+)$/i);
		const rmMatch = terminalText.match(/^rm\s+([^\s]+)$/i);

		if (xterm === null) return;

		//  clear command
		if (terminalText === 'clear' || terminalText === 'cls') {
			xterm.terminal.reset();
			setTerminalText('');
			xterm.terminal.write(terminalHostname);
			return false;
		}

		// touch Command
		else if (touchMatch) {
			const filename = touchMatch[1];
			if (!isValidFilename(filename)) {
				xterm.terminal.write(`\r\n\rError: use a valid .html, .css, or .js filename\r\n\r${terminalHostname}`);
				setTerminalText('');
				return;
			}
			const isFilePresent = filesList.filter((name) => name === filename).length;
			const extension = getLanguageFromFilename(filename);

			if (isFilePresent) {
				setTerminalText('');
				xterm.terminal.write(`\r\n\rError: File name cannot be same`);
				xterm.terminal.write(`\r\n\r${terminalHostname}`);
				return false;
			}

			addFile({ name: filename, language: extension, value: '' });
			setTerminalText('');
			xterm.terminal.write(`\r\n\r${terminalHostname}`);
			return false;
		}

		// rm command
		else if (rmMatch) {
			const filename = rmMatch[1];
			if (!filesList.includes(filename)) {
				xterm.terminal.write(`\r\n\rError: file not found: ${filename}`);
				setTerminalText('');
				xterm.terminal.write(`\r\n\r${terminalHostname}`);
				return;
			}
			removeFile(filename);
			setTerminalText('');
			xterm.terminal.write(`\r\n\r${terminalHostname}`);
			return false;
		}

		switch (code) {
			case 12:
				// CTRL + L (Clear Terminal)
				xterm.terminal.reset();
				setTerminalText('');
				xterm.terminal.write(terminalHostname);
				break;

			case 13:
				// Enter key
				commandOuputs(terminalText, filesList).then((output) => {
					xterm.terminal.write(`\r\n${output}\r\n`);
					xterm.terminal.write(terminalHostname);
					setTerminalText('');
				});
				break;

			case 27:
				// Filter up and down arrow press
				if (data.endsWith('A') || data.endsWith('B')) return;

				// Write to terminal on left and right arrow press
				xterm.terminal.write(data);
				setTerminalText((prevState) => prevState + data);
				break;

			case 127:
				// Backspace
				if (terminalText) {
					xterm.terminal.write('\b \b');
					setTerminalText((prevState) => prevState.substring(0, prevState.length - 1));
				}
				break;

			default:
				// General keys
				xterm.terminal.write(data);
				setTerminalText((prevState) => prevState + data);
		}
	};

	return (
		<TerminalContainer id='terminal'>
			<XTerm
				className='terminal-container'
				ref={xTermRef}
				addons={[fitAddon]}
				onData={onData}
				options={{
					theme: { background: '#131313', cursor: '#00FF00', foreground: '#00FF00' },
				}}
			/>
		</TerminalContainer>
	);
};

export default Terminal;
