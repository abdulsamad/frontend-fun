import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

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

serviceWorkerRegistration.register({
  onSuccess: () =>
    toast.dark(
      <>
        <svg width="19" height="18" viewBox="0 0 24 24">
          <path
            fill="#4CAF50"
            d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"
          />
        </svg>{' '}
        Editor Saved for offline use
      </>
    ),
});
