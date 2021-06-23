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
      window.open('https://www.dafk.net/what/');
      return "You've been rickrolled! 😜";

    case commandsList[5]:
      return fetch('https://api.chucknorris.io/jokes/random')
        .then((res) => res.json())
        .then(({ value }) => value);

    case commandsList[6]:
      return document.location.pathname;

    case commandsList[7]:
      setTimeout(() => window.open('https://www.boredpanda.com'), 3500);
      return 'Here is your timepass. But remember "Time is precious, Waste it wisely"';

    case commandsList[8]:
      return document.domain;

    case commandsList[9]:
      setTimeout(() => window.open('https://www.healthline.com/health/memory-loss'), 4000);
      return "Finding the best health advice...\n\rPlease Wait... You'll be redirect in a moment. 😉";

    case commandsList[10]:
      return "Your browser is definitely running. That's the only thing I can say 🤪";

    default:
      return `bash: command not found: ${command}.\r\n\rEnter "help" to see the list of supported commands`;
  }
};

export default commandOuputs;
