import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTermTerminal } from '@xterm/xterm';

import { useAppContext } from '../../context';

import TerminalContainer from './Terminal';
import commandOuputs from './commands';
import { getLanguageFromFilename, isValidFilename } from '../../context/validation';

const Terminal: FC = () => {
	const { filesList, addFile, removeFile } = useAppContext();
	const [terminalText, setTerminalText] = useState('');
	const terminalElementRef = useRef<HTMLDivElement | null>(null);
	const xTermRef = useRef<XTermTerminal | null>(null);
	const onDataRef = useRef<(data: string) => void>(() => undefined);
	const fitAddon = useMemo(() => new FitAddon(), []);
	const terminalHostname = useMemo(() => `$root@${window.location.hostname}~`, []);

	useEffect(() => {
		if (!terminalElementRef.current) return;
		const terminal = new XTermTerminal({
			theme: { background: '#131313', cursor: '#00FF00', foreground: '#00FF00' },
		});
		xTermRef.current = terminal;
		terminal.loadAddon(fitAddon);
		terminal.open(terminalElementRef.current);
		const dataSubscription = terminal.onData((data) => onDataRef.current(data));

		// prettier-ignore
		terminal.writeln('Enter "help" to see the list of supported commands\r\n\rPress (Ctrl + L) to clear the console');
		terminal.write(terminalHostname);
		fitAddon.fit();
		const onResize = () => fitAddon.fit();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			dataSubscription.dispose();
			terminal.dispose();
			xTermRef.current = null;
		};
	}, [fitAddon, terminalHostname]);

	const onData = (data: string) => {
		const xterm = xTermRef.current;
		const code = data.charCodeAt(0);
		const touchMatch = terminalText.match(/^touch\s+([^\s]+)$/i);
		const rmMatch = terminalText.match(/^rm\s+([^\s]+)$/i);

		if (xterm === null) return;

		//  clear command
		if (terminalText === 'clear' || terminalText === 'cls') {
			xterm.reset();
			setTerminalText('');
			xterm.write(terminalHostname);
			return false;
		}

		// touch Command
		else if (touchMatch) {
			const filename = touchMatch[1];
			if (!isValidFilename(filename)) {
				xterm.write(`\r\n\rError: use a valid .html, .css, or .js filename\r\n\r${terminalHostname}`);
				setTerminalText('');
				return;
			}
			const isFilePresent = filesList.filter((name) => name === filename).length;
			const extension = getLanguageFromFilename(filename);

			if (isFilePresent) {
				setTerminalText('');
				xterm.write(`\r\n\rError: File name cannot be same`);
				xterm.write(`\r\n\r${terminalHostname}`);
				return false;
			}

			addFile({ name: filename, language: extension, value: '' });
			setTerminalText('');
			xterm.write(`\r\n\r${terminalHostname}`);
			return false;
		}

		// rm command
		else if (rmMatch) {
			const filename = rmMatch[1];
			if (!filesList.includes(filename)) {
				xterm.write(`\r\n\rError: file not found: ${filename}`);
				setTerminalText('');
				xterm.write(`\r\n\r${terminalHostname}`);
				return;
			}
			removeFile(filename);
			setTerminalText('');
			xterm.write(`\r\n\r${terminalHostname}`);
			return false;
		}

		switch (code) {
			case 12:
				// CTRL + L (Clear Terminal)
				xterm.reset();
				setTerminalText('');
				xterm.write(terminalHostname);
				break;

			case 13:
				// Enter key
				commandOuputs(terminalText, filesList).then((output) => {
					xterm.write(`\r\n${output}\r\n`);
					xterm.write(terminalHostname);
					setTerminalText('');
				});
				break;

			case 27:
				// Filter up and down arrow press
				if (data.endsWith('A') || data.endsWith('B')) return;

				// Write to terminal on left and right arrow press
				xterm.write(data);
				setTerminalText((prevState) => prevState + data);
				break;

			case 127:
				// Backspace
				if (terminalText) {
					xterm.write('\b \b');
					setTerminalText((prevState) => prevState.substring(0, prevState.length - 1));
				}
				break;

			default:
				// General keys
				xterm.write(data);
				setTerminalText((prevState) => prevState + data);
		}
	};
	onDataRef.current = onData;

	return (
		<TerminalContainer id='terminal'>
			<div ref={terminalElementRef} className='terminal-container' />
		</TerminalContainer>
	);
};

export default Terminal;
