import { ProjectFile } from '../../state/types';

const commandList = [
  'help', 'ls', 'tree', 'cat <file>', 'pwd', 'date', 'hostname', 'whoami', 'history',
  'echo <text>', 'copy <file>', 'download <file>', 'preview reload', 'theme <name>',
  'wrap <on|off>', 'font <size>', 'mic [stop]', 'record [seconds]', 'listen', 'speak <text>',
  'camera', 'location', 'notify <text>', 'share', 'online', 'clipboard',
  'clear', 'coffee', 'ascii', 'matrix', 'joke', 'intro', 'advice',
  'touch <file>', 'rm <file>',
];

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = {
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

let microphoneStream: MediaStream | null = null;

const getSpeechRecognition = () => {
  const browserWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
};

const unsupported = (name: string) => `${name}: this browser does not support that API.`;

const hiddenHackResponse = (input: string) => {
  const command = input.trim().toLowerCase();
  if (command === 'rm -rf /') return 'Protected: the playground refuses to delete the universe. 🛡️';
  if (command === 'passwd') return 'Password strength: emotionally unavailable.';
  if (command === 'id') return 'uid=1000(frontend-fun) gid=1000(playground) groups=1000(playground)';
  if (command.startsWith('ssh ')) return 'localhost is an iframe, not a server. Connection closed. 🧱';
  if (command === 'whoami') return 'frontend-fun-user (root privileges: absolutely not)';
  return 'Root access requested...\r\n[████████████████] 100%\r\nDenied: browser sandbox detected.\r\nStatus: playground remains safe 😎';
};

const commandOutputs = async (input: string, files: ProjectFile[], history: string[] = []) => {
  const [command, ...argumentParts] = input.trim().split(/\s+/);
  const args = argumentParts.join(' ');
  const normalized = command?.toLowerCase();
  const file = files.find((candidate) => candidate.name.toLowerCase() === args.toLowerCase());

  if (['hack', 'sudo', 'su', 'root', 'id', 'passwd'].includes(normalized) || input.trim().toLowerCase() === 'rm -rf /' || normalized === 'ssh') {
    return hiddenHackResponse(input);
  }

  switch (normalized) {
    case 'help':
      return `Supported commands:\r\n\r${commandList.join('\r\n\r')}\r\n\rTip: browser APIs may ask for permission.`;
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
    case 'mic':
      if (!navigator.mediaDevices?.getUserMedia) return unsupported('mic');
      if (args.toLowerCase() === 'stop') {
        microphoneStream?.getTracks().forEach((track) => track.stop());
        microphoneStream = null;
        return 'Microphone stopped.';
      }
      microphoneStream?.getTracks().forEach((track) => track.stop());
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return 'Microphone ready. Use "mic stop" to release permission.';
    case 'record': {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return unsupported('record');
      const seconds = Math.min(Math.max(Number(args) || 5, 1), 30);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      const recording = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
      recorder.start();
      window.setTimeout(() => recorder.stop(), seconds * 1000);
      await recording;
      stream.getTracks().forEach((track) => track.stop());
      const audio = new Audio(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })));
      await audio.play().catch(() => undefined);
      return `Recorded and played ${seconds} seconds of audio.`;
    }
    case 'listen': {
      const Recognition = getSpeechRecognition();
      if (!Recognition) return unsupported('listen');
      const recognition = new Recognition();
      return new Promise<string>((resolve) => {
        let finished = false;
        const finish = (message: string) => { if (!finished) { finished = true; resolve(message); } };
        recognition.onresult = (event) => finish(`Heard: ${event.results[0][0].transcript}`);
        recognition.onerror = () => finish('Speech recognition failed or was denied.');
        recognition.onend = () => finish('No speech detected.');
        recognition.start();
      });
    }
    case 'speak':
      if (!('speechSynthesis' in window)) return unsupported('speak');
      if (!args) return 'Usage: speak <text>';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(args));
      return 'Speaking.';
    case 'camera':
      if (!navigator.mediaDevices?.getUserMedia) return unsupported('camera');
      { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); stream.getTracks().forEach((track) => track.stop()); return 'Camera permission granted. The stream was stopped safely.'; }
    case 'location':
      if (!navigator.geolocation) return unsupported('location');
      return new Promise<string>((resolve) => navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve(`Latitude: ${coords.latitude.toFixed(4)}, Longitude: ${coords.longitude.toFixed(4)}`),
        () => resolve('Location permission was denied or unavailable.'),
      ));
    case 'notify':
      if (!('Notification' in window)) return unsupported('notify');
      if (Notification.permission === 'denied') return 'Notifications are blocked.';
      if (Notification.permission === 'default') await Notification.requestPermission();
      if (Notification.permission === 'granted') new Notification(args || 'Frontend Fun says hello');
      return 'Notification sent.';
    case 'share':
      if (!navigator.share) return unsupported('share');
      await navigator.share({ title: 'Frontend Fun', text: 'Try this frontend playground.' });
      return 'Share dialog opened.';
    case 'online':
      return navigator.onLine ? 'Online.' : 'Offline.';
    case 'clipboard':
      return navigator.clipboard ? 'Clipboard API is available.' : unsupported('clipboard');
    case 'clear':
      return '__CLEAR__';
    case 'coffee':
      return '☕ Brewing pixels... Your CSS is looking bold today.';
    case 'ascii':
      return ' _____  ____  ____\r\n|  _  ||  _ \\|  _ \\r\n| |_| || | | || | | |\r\n|____ ||_| |_||_| |_|\r\n     |_|';
    case 'matrix':
      return 'Wake up, frontend user...\r\nThe Matrix has your CSS.\r\n01001000 01110100 01101101 01101100\r\nFollow the white rabbit. 🐇';
    case 'hack':
      return 'Connecting to the mainframe...\r\nBypassing 3 firewalls...\r\nAccess denied: nice try. 😄';
    case 'intro':
      return 'Frontend Fun: a tiny browser workbench for big ideas.';
    case 'advice':
      return 'Ship the small version, then make it delightful.';
    case 'joke':
      return fetch('https://api.chucknorris.io/jokes/random').then((res) => res.ok ? res.json() as Promise<{ value: string }> : Promise.reject()).then(({ value }) => value).catch(() => 'Joke service is unavailable right now.');
    default:
      return `bash: command not found: ${input}.\r\n\rEnter "help" to see the list of supported commands`;
  }
};

export default commandOutputs;
