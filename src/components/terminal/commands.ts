const commandsList: string[] = [
  'help',
  'ls',
  'intro',
  'advice',
  'wget --hack target=jeffbezos type=bank field=password',
  'tell me a joke',
  'pwd',
  'i am bored',
  'hostname',
  'whoami',
  'ps',
  'touch <filename>',
  'rm <filename>',
];

const commandOuputs = async (command: string, filesList: string[]) => {
  switch (command) {
    case commandsList[0]:
      return `List of supported commands:\r\n\r${commandsList.join('\r\n\r')}`;

    case commandsList[1]:
      return filesList.join('\r\n\r');

    case commandsList[2]:
      return 'Hey there, My name is AbdulSamad';

    case commandsList[3]:
      return 'You should be friends with AbdulSamad. He is a nice guy 😉\r\n\rYou can connect with him on:\r\n\rhello@abdulsamad.dev\r\n\rhttps://www.linkedin.com/in/abdulsamad-ansari';

    case commandsList[4]:
      return "Nice try. External redirects are disabled in the terminal.";

    case commandsList[5]:
      return fetch('https://api.chucknorris.io/jokes/random')
        .then((res) => { if (!res.ok) throw new Error('request failed'); return res.json(); })
        .then(({ value }) => value)
        .catch(() => 'Joke service is unavailable right now.');

    case commandsList[6]:
      return document.location.pathname;

    case commandsList[7]:
      return 'Here is your timepass. Remember: time is precious, waste it wisely.';

    case commandsList[8]:
      return document.domain;

    case commandsList[9]:
      return 'Please consult a qualified professional for health advice.';

    case commandsList[10]:
      return "Your browser is definitely running. That's the only thing I can say 🤪";

    default:
      return `bash: command not found: ${command}.\r\n\rEnter "help" to see the list of supported commands`;
  }
};

export default commandOuputs;
