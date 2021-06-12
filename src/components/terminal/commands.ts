const commandOuputs = (command: string) => {
  console.log(command);
  switch (command) {
    case 'intro':
      return 'Hi, there my name is AbdulSamad';
    default:
      return command;
  }
};

export default commandOuputs;
