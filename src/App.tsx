import { FC, useEffect } from 'react';
import Split from 'split.js';

// Styled Components
import GlobalStyles from './styles/GlobalStyles';
import GlobalContainer from './styles/GlobalContainer';
import MiddleContainer from './styles/MiddleContainer';

// Components
import Sidebar from './components/sidebar';
import Editor from './components/editor';
import Terminal from './components/terminal';
import Output from './components/output';

const App: FC = () => {
  useEffect(() => {
    Split(['#sidebar', '#code', '#output'], {
      gutterSize: 5,
      sizes: [10, 50, 40],
    });
    Split(['#editor', '#terminal'], {
      gutterSize: 5,
      direction: 'vertical',
      sizes: [70, 30],
    });
  }, []);

  return (
    <>
      <GlobalStyles />
      <GlobalContainer className="split">
        <Sidebar id="sidebar" />
        <MiddleContainer id="code" className="split">
          <Editor id="editor" />
          <Terminal id="terminal" />
        </MiddleContainer>
        <Output id="output" />
      </GlobalContainer>
    </>
  );
};

export default App;
