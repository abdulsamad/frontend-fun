import { createGlobalStyle } from 'styled-components';

import FiraCode from '../assets/FiraCode.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Fira Code';
    src: local('Fira Code'),
    url(${FiraCode}) format('truetype');
  }

  body {
    height: 100vh;
		width: 100vw;
		overflow: hidden;
    font-family: 'Open Sans', Arial, Helvetica, sans-serif;
  }

  .gutter {
    background-color: #3B3B3B;
    background-repeat: no-repeat;
    background-position: 50%;
  }

  .gutter.gutter-horizontal {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: col-resize;
  }
`;

export default GlobalStyle;
