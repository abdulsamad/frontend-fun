const commandsList: string[] = [
  'help',
  'ls',
  'intro',
  'advice',
  'wget --hack target=jeffbezos type=bank field=password',
  'tell me a joke',
  'pwd',
  'i am bored',
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
      return 'You should be friends with AbdulSamad. He is a nice guy 😉\r\n\rYou can contact him on: hello@abdulsamad.dev';

    case commandsList[4]:
      window.open('https://www.dafk.net/what/');
      return "You've been rickrolled! 😜";

    case commandsList[5]:
      return fetch('https://api.chucknorris.io/jokes/random')
        .then((res) => res.json())
        .then(({ value }) => value);

    case commandsList[6]:
      return document.domain;

    case commandsList[7]:
      window.open('https://www.boredpanda.com');
      return 'Here is your timepass. But remember "Time is precious, Waste it wisely"';

    default:
      return `bash: command not found: ${command}.\r\n\rEnter "help" to see the list of supported commands`;
  }
};

export default commandOuputs;
