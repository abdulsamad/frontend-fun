import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'reseter.css';
import 'xterm/css/xterm.css';
import 'react-toastify/dist/ReactToastify.css';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();
