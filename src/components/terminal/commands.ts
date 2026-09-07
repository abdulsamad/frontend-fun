import { ProjectFile } from '../../state/types';

const commandList = [
  'help', 'ls', 'tree', 'cat <file>', 'pwd', 'date', 'hostname', 'whoami', 'history',
  'echo <text>', 'copy <file>', 'download <file>', 'preview reload', 'theme <name>',
  'wrap <on|off>', 'font <size>', 'clear',
  'touch <file.css|file.js>', 'rm <file>',
];

const unsupported = (name: string) => `${name}: this browser does not support that API.`;

const commandOutputs = async (input: string, files: ProjectFile[], history: string[] = []) => {
  const [command, ...argumentParts] = input.trim().split(/\s+/);
  const args = argumentParts.join(' ');
  const normalized = command?.toLowerCase();
  const file = files.find((candidate) => candidate.name.toLowerCase() === args.toLowerCase());

  switch (normalized) {
    case 'help':
      return `Supported commands:\r\n\r${commandList.join('\r\n\r')}`;
    case 'ls':
      return files.map(({ name }) => name).join('\r\n\r') || 'No files.';
    case 'tree':
      return `frontend-fun\r\n${files.map(({ name }, index) => `${index === files.length - 1 ? '└──' : '├──'} ${name}`).join('\r\n')}`;
    case 'cat':
      return file ? file.value || '(empty file)' : `cat: file not found: ${args || '(missing file)'}`;
    case 'pwd':
      return document.location.pathname;
    case 'date':
      return new Date().toString();
    case 'hostname':
      return document.location.hostname;
    case 'whoami':
      return 'frontend-fun-user';
    case 'history':
      return history.length ? history.map((entry, index) => `${String(index + 1).padStart(3, ' ')}  ${entry}`).join('\r\n') : 'No command history.';
    case 'echo':
      return args;
    case 'copy':
      if (!file) return `copy: file not found: ${args || '(missing file)'}`;
      if (!navigator.clipboard) return unsupported('copy');
      await navigator.clipboard.writeText(file.value);
      return `Copied ${file.name} to the clipboard.`;
    case 'download': {
      if (!file) return `download: file not found: ${args || '(missing file)'}`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([file.value], { type: 'text/plain' }));
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
      return `Downloaded ${file.name}.`;
    }
    case 'preview':
      return args.toLowerCase() === 'reload' ? 'Reload the preview with the refresh button.' : 'Usage: preview reload';
    case 'theme':
    case 'wrap':
    case 'font':
      return 'Use the View menu to change workbench settings.';
    case 'clear':
      return '__CLEAR__';
    default:
      return `bash: command not found: ${input}.\r\n\rEnter "help" to see the list of supported commands`;
  }
};

export default commandOutputs;
