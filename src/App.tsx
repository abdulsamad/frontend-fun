import { Component, ErrorInfo, KeyboardEvent, lazy, ReactNode, Suspense, useEffect, useState } from 'react';
import { Allotment } from 'allotment';
import { ToastContainer } from 'react-toastify';

import 'allotment/dist/style.css';

import GlobalStyles from './styles/GlobalStyles';
import GlobalContainer, {
  CompactStage,
  CompactSurface,
  CompactViewButton,
  CompactViewTabs,
  CompactWorkbench,
  PaneLoading,
} from './styles/GlobalContainer';
import ProjectStateEffects from './state/ProjectStateEffects';

const Sidebar = lazy(() => import('./components/sidebar'));
const Editor = lazy(() => import('./components/editor'));
const Terminal = lazy(() => import('./components/terminal'));
const PreviewPane = lazy(() => import('./components/output'));

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workbench error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role='alert' className='workbench-error'>
          The workbench could not start. Reload the page to recover your locally saved project.
        </main>
      );
    }
    return this.props.children;
  }
}

type CompactView = 'files' | 'code' | 'preview' | 'terminal';

const compactViews: Array<{ id: CompactView; label: string }> = [
  { id: 'files', label: 'Files' },
  { id: 'code', label: 'Code' },
  { id: 'preview', label: 'Preview' },
  { id: 'terminal', label: 'Terminal' },
];

const useCompactLayout = () => {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 959px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 959px)');
    const update = (event: MediaQueryListEvent) => setCompact(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return compact;
};

const LazyPane = ({ label, children }: { label: string; children: ReactNode }) => (
  <Suspense fallback={<PaneLoading role='status'>Loading {label}…</PaneLoading>}>
    {children}
  </Suspense>
);

const DesktopWorkbench = () => (
  <Allotment defaultSizes={[280, 660, 500]} proportionalLayout separator>
    <Allotment.Pane minSize={240} maxSize={360} preferredSize={280}>
      <LazyPane label='Explorer'><Sidebar /></LazyPane>
    </Allotment.Pane>
    <Allotment.Pane minSize={360} preferredSize='46%'>
      <Allotment defaultSizes={[70, 30]} vertical proportionalLayout separator>
        <Allotment.Pane minSize={280}>
          <LazyPane label='editor'><Editor /></LazyPane>
        </Allotment.Pane>
        <Allotment.Pane minSize={140} preferredSize='30%'>
          <LazyPane label='terminal'><Terminal /></LazyPane>
        </Allotment.Pane>
      </Allotment>
    </Allotment.Pane>
    <Allotment.Pane minSize={360} preferredSize='36%'>
      <LazyPane label='preview'><PreviewPane /></LazyPane>
    </Allotment.Pane>
  </Allotment>
);

const NarrowWorkbench = () => {
  const [activeView, setActiveView] = useState<CompactView>('code');
  const [visitedViews, setVisitedViews] = useState<CompactView[]>(['code']);

  const activateView = (view: CompactView) => {
    setActiveView(view);
    setVisitedViews((currentViews) => currentViews.includes(view) ? currentViews : [...currentViews, view]);
  };

  const selectView = (index: number) => {
    const normalizedIndex = (index + compactViews.length) % compactViews.length;
    const nextView = compactViews[normalizedIndex];
    activateView(nextView.id);
    requestAnimationFrame(() => document.getElementById(`view-tab-${nextView.id}`)?.focus());
  };

  const handleViewKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight') selectView(index + 1);
    else if (event.key === 'ArrowLeft') selectView(index - 1);
    else if (event.key === 'Home') selectView(0);
    else if (event.key === 'End') selectView(compactViews.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <CompactWorkbench>
      <CompactViewTabs aria-label='Workbench views' role='tablist'>
        {compactViews.map((view, index) => (
          <CompactViewButton
            key={view.id}
            id={`view-tab-${view.id}`}
            type='button'
            role='tab'
            aria-controls={`view-panel-${view.id}`}
            aria-selected={activeView === view.id}
            tabIndex={activeView === view.id ? 0 : -1}
            $active={activeView === view.id}
            onKeyDown={(event) => handleViewKeyDown(event, index)}
            onClick={() => activateView(view.id)}>
            {view.label}
          </CompactViewButton>
        ))}
      </CompactViewTabs>
      <CompactStage>
        <CompactSurface id='view-panel-files' role='tabpanel' aria-labelledby='view-tab-files' $active={activeView === 'files'}>
          {visitedViews.includes('files') && <LazyPane label='Explorer'><Sidebar /></LazyPane>}
        </CompactSurface>
        <CompactSurface id='view-panel-code' role='tabpanel' aria-labelledby='view-tab-code' $active={activeView === 'code'}>
          <LazyPane label='editor'><Editor /></LazyPane>
        </CompactSurface>
        <CompactSurface id='view-panel-preview' role='tabpanel' aria-labelledby='view-tab-preview' $active={activeView === 'preview'}>
          {visitedViews.includes('preview') && <LazyPane label='preview'><PreviewPane /></LazyPane>}
        </CompactSurface>
        <CompactSurface id='view-panel-terminal' role='tabpanel' aria-labelledby='view-tab-terminal' $active={activeView === 'terminal'}>
          {visitedViews.includes('terminal') && <LazyPane label='terminal'><Terminal /></LazyPane>}
        </CompactSurface>
      </CompactStage>
    </CompactWorkbench>
  );
};

const App = () => {
  const compact = useCompactLayout();

  return (
    <>
      <GlobalStyles />
      <ToastContainer position='bottom-right' autoClose={4500} closeOnClick pauseOnHover theme='dark' />
      <AppErrorBoundary>
        <ProjectStateEffects />
        <GlobalContainer>{compact ? <NarrowWorkbench /> : <DesktopWorkbench />}</GlobalContainer>
      </AppErrorBoundary>
    </>
  );
};

export default App;
