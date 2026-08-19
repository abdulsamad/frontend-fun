import { Component, ErrorInfo, FC, ReactNode, useEffect } from 'react';
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

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
	state = { hasError: false };
	static getDerivedStateFromError() { return { hasError: true }; }
	componentDidCatch(error: Error, info: ErrorInfo) { console.error('Editor error', error, info); }
	render() {
		if (this.state.hasError) return <main role='alert' style={{ padding: 24, color: '#fff', background: '#131313' }}>Something broke in the editor. Reload the page to recover.</main>;
		return this.props.children;
	}
}

const App: FC = () => {
	useEffect(() => {
		if (window.matchMedia('(max-width: 768px)').matches) return undefined;
		const outer = Split(['#sidebar', '#code', '#output'], {
			gutterSize: 5,
			sizes: [13, 47, 40],
		});
		const inner = Split(['#editor', '#terminal'], {
			gutterSize: 5,
			direction: 'vertical',
			sizes: [70, 30],
		});
		const onResize = () => { outer.setSizes(outer.getSizes()); inner.setSizes(inner.getSizes()); };
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			outer.destroy();
			inner.destroy();
		};
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
			<AppErrorBoundary>
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
			</AppErrorBoundary>
		</>
	);
};

export default App;
