import * as types from './types';

const files = ['index.html', 'style.css', 'script.js'];

export const defaultFilesData: types.fileData[] = [
  {
    name: files[0],
    language: 'html',
    value: '<h1>Hello World!</h1>',
  },
  {
    name: files[1],
    language: 'css',
    value: 'body {background-color: #2f2f2f}',
  },
  {
    name: files[2],
    language: 'javascript',
    value: 'console.log("Hello Wolrd");',
  },
];

export const defaultFilesList: string[] = [files[0], files[1], files[2]];
