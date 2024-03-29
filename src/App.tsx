import { FC, useEffect } from 'react';
import Split from 'split.js';
import { ToastContainer } from 'react-toastify';

// Styled Components
import GlobalStyles from './styles/GlobalStyles';
import GlobalContainer from './styles/GlobalContainer';
import MiddleContainer from './styles/MiddleContainer';

// Context
import { Context } from './context';

// Components
import Sidebar from './components/sidebar';
import Editor from './components/editor';
import Terminal from './components/terminal';
import Output from './components/output';
import MobileMessage from './components/mobile-message';

const App: FC = () => {
	useEffect(() => {
		Split(['#sidebar', '#code', '#output'], {
			gutterSize: 5,
			sizes: [13, 47, 40],
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
			<ToastContainer
				position='bottom-left'
				closeOnClick={false}
				autoClose={false}
				draggable={false}
			/>
			<Context>
				<GlobalContainer className='split'>
					<Sidebar />
					<MiddleContainer id='code' className='split'>
						<Editor />
						<Terminal />
					</MiddleContainer>
					<Output />
				</GlobalContainer>
				<MobileMessage />
			</Context>
		</>
	);
};

export default App;
