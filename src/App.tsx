import { Component, ErrorInfo, KeyboardEvent, lazy, ReactNode, Suspense, useEffect, useState } from 'react';
import { Allotment } from 'allotment';
import { useAtomValue, useSetAtom } from 'jotai';
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
  TopBarBrand,
  TopBarMenu,
  TopBarMenuPanel,
  WorkbenchFrame,
  WorkbenchTopBar,
} from './styles/GlobalContainer';
import ProjectStateEffects from './state/ProjectStateEffects';
import { defaultWorkbenchSettings, workbenchSettingsAtom } from './state/settings';

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

const DesktopWorkbench = () => {
  const showTerminal = useAtomValue(workbenchSettingsAtom).showTerminal;
  return (
    <Allotment defaultSizes={[280, 660, 500]} proportionalLayout separator>
      <Allotment.Pane minSize={240} maxSize={360} preferredSize={280}>
        <LazyPane label='Explorer'><Sidebar /></LazyPane>
      </Allotment.Pane>
      <Allotment.Pane minSize={360} preferredSize='46%'>
        {showTerminal ? (
          <Allotment defaultSizes={[70, 30]} vertical proportionalLayout separator>
            <Allotment.Pane minSize={280}>
              <LazyPane label='editor'><Editor /></LazyPane>
            </Allotment.Pane>
            <Allotment.Pane minSize={140} preferredSize='30%'>
              <LazyPane label='terminal'><Terminal /></LazyPane>
            </Allotment.Pane>
          </Allotment>
        ) : (
          <LazyPane label='editor'><Editor /></LazyPane>
        )}
      </Allotment.Pane>
      <Allotment.Pane minSize={360} preferredSize='36%'>
        <LazyPane label='preview'><PreviewPane /></LazyPane>
      </Allotment.Pane>
    </Allotment>
  );
};

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

const SettingsBar = () => {
  const settings = useAtomValue(workbenchSettingsAtom);
  const setSettings = useSetAtom(workbenchSettingsAtom);

  return (
    <WorkbenchTopBar>
      <TopBarBrand>Frontend Fun</TopBarBrand>
      <TopBarMenu>
        <summary>View</summary>
        <TopBarMenuPanel>
          <label>Theme<select value={settings.theme} onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value as typeof current.theme }))}>
            <option value='one-dark'>One Dark</option>
            <option value='one-dark-pro'>One Dark Pro</option>
            <option value='vscode-dark'>VS Code Dark</option>
            <option value='high-contrast'>High Contrast</option>
          </select></label>
          <label>Font size<select value={settings.fontSize} onChange={(event) => setSettings((current) => ({ ...current, fontSize: Number(event.target.value) }))}>
            {[12, 13, 14, 15, 16, 18].map((size) => <option key={size} value={size}>{size}px</option>)}
          </select></label>
          <label>Word wrap<input type='checkbox' checked={settings.wordWrap} onChange={(event) => setSettings((current) => ({ ...current, wordWrap: event.target.checked }))} /></label>
          <label>Show terminal<input type='checkbox' checked={settings.showTerminal} onChange={(event) => setSettings((current) => ({ ...current, showTerminal: event.target.checked }))} /></label>
          <label>Auto-save<input type='checkbox' checked={settings.autoSave} onChange={(event) => setSettings((current) => ({ ...current, autoSave: event.target.checked }))} /></label>
        </TopBarMenuPanel>
      </TopBarMenu>
    </WorkbenchTopBar>
  );
};

const App = () => {
  const compact = useCompactLayout();
  const settings = useAtomValue(workbenchSettingsAtom);
  const setSettings = useSetAtom(workbenchSettingsAtom);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('workbenchSettings') || 'null');
      if (saved && typeof saved === 'object') setSettings({ ...defaultWorkbenchSettings, ...saved });
    } catch { /* Use defaults when settings are corrupted. */ }
  }, [setSettings]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    localStorage.setItem('workbenchSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <>
      <GlobalStyles />
      <ToastContainer position='bottom-right' autoClose={4500} closeOnClick pauseOnHover theme='dark' />
      <AppErrorBoundary>
        <ProjectStateEffects />
        <WorkbenchFrame>
          <SettingsBar />
          <GlobalContainer>{compact ? <NarrowWorkbench /> : <DesktopWorkbench />}</GlobalContainer>
        </WorkbenchFrame>
      </AppErrorBoundary>
    </>
  );
};

export default App;
