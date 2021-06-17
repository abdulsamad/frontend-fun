import * as types from './types';

export const defaultFilesList: string[] = ['index.html', 'style.css', 'script.js'];

export const defaultFilesData: types.fileData[] = [
  {
    name: defaultFilesList[0],
    language: 'html',
    value: `<svg width="279.15" height="343.95" overflow="visible" stroke="#fff" stroke-width="1">
  <path fill="#fff" pathLength="1" d="M110.57 248.64c-22.7-21.25-45.06-42.09-67.31-63.06-11.73-11.06-23.32-22.26-34.87-33.51C-2.6 141.35-2.86 128 8.02 117.42 47.67 78.82 87.46 40.35 127.21 1.84c.46-.44 1.03-.77 2.47-1.84 12.52 13.66 25.06 27.34 37.1 40.47-4.44 4.76-10.06 11.31-16.21 17.33-22.69 22.2-45.56 44.22-68.34 66.32-7.89 7.66-7.97 13.48.11 21.07 19.38 18.19 38.85 36.29 58.37 54.33 7.53 6.96 7.75 12.42.32 19.64-10.01 9.72-20.05 19.4-30.46 29.48z" />
  <path fill="#fff" pathLength="1" d="M150.02 343.95c-13.41-13.03-26.71-25.97-40.2-39.08 1.23-1.32 2.19-2.44 3.24-3.46 27.8-26.95 55.61-53.89 83.42-80.83 8.32-8.05 8.41-13.92-.01-21.79-19.54-18.27-39.14-36.47-58.77-54.63-6.52-6.04-6.76-12.11-.37-18.33 10.24-9.96 20.52-19.87 31.15-30.16 6.33 5.89 12.53 11.58 18.65 17.37 27.53 26.03 55.07 52.05 82.52 78.16 12.57 11.96 12.66 24.78.33 36.75-38.99 37.85-78.04 75.64-117.07 113.45-.82.79-1.71 1.51-2.89 2.55z" />
</svg>\n<h1>Hello World!</h1>\n<p>This is a live front-end editor with automatic save.</p>\n<p><cite>Front-end Code Editor</cite> by AbdulSamad <br /> Source Code Available on <a href="https://github.com/abdulsamad/frontend-fun" class="github-link" target="_blank"
rel="noreferrer noopener">\n<svg fill='#000' width="15" height="15" viewBox="0 0 24 24">
 <path
  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
</svg>&nbsp;GitHub</a>\n</p>`,
  },
  {
    name: defaultFilesList[1],
    language: 'css',
    value: `body {
  background-color: #673AB7;
  color: #f2f2f2;
  font-family: Sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  line-height: 1.5rem;
}

.logo-svg {
  width: 40%;
  fill-opacity: 0;
  animation: fadeOpacity 2s forwards 2s;
}

.logo-svg path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 2s forwards;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeOpacity {
  from {
    fill-opacity: 0;
  }
  to {
    fill-opacity: 1;
  }
}

.github-link {
  background-color: #ededed;
  color: #2f2f2f;
  text-decoration: none;
  padding: 2px 5px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`,
  },
  {
    name: defaultFilesList[2],
    language: 'javascript',
    value: `console.log("Hello World");`,
  },
];

export const defaultActiveFile: types.fileData = {
  name: defaultFilesData[0].name,
  language: defaultFilesData[0].language,
  value: defaultFilesData[0].value,
};
