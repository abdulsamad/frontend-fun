import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';

import { projectDependenciesAtom, projectFilesAtom } from '../../state/projectAtoms';
import {
  createPreviewBundle,
  createPreviewShell,
  PreviewBundle,
  PreviewConsoleEntry,
  PreviewError,
  PreviewFrameMessage,
  PreviewHostMessage,
  PreviewNetworkEntry,
  PreviewStatus as PreviewStatusValue,
} from '../../utils/createPreviewBundle';
import Icon from '../Icon';
import PreviewPane from './Output';
import {
  ConsoleRow,
  DevtoolsClear,
  DevtoolsContent,
  DevtoolsEmpty,
  DevtoolsHeader,
  DevtoolsPanel,
  DevtoolsTab,
  DevtoolsTabs,
  ErrorRow,
  NetworkRow,
  PreviewErrorBanner,
  PreviewFrame,
  PreviewViewport,
} from './Iframe';
import {
  PreviewActions,
  PreviewAddressBar,
  PreviewControlButton,
  PreviewControlGroup,
  PreviewLabel,
  PreviewStatus,
  PreviewToolbar,
  ReloadButton,
} from './Nav';

const UPDATE_DELAY = 200;
const MAX_CONSOLE_ENTRIES = 200;
const MAX_NETWORK_ENTRIES = 150;
const MAX_ERROR_ENTRIES = 100;

type DevtoolsView = 'console' | 'network' | 'errors';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const previewDevices: Array<{ id: PreviewDevice; label: string; icon: 'desktop' | 'tablet' | 'mobile'; width?: number }> = [
  { id: 'desktop', label: 'Responsive preview', icon: 'desktop' },
  { id: 'tablet', label: 'Tablet preview - 768 px', icon: 'tablet', width: 768 },
  { id: 'mobile', label: 'Mobile preview - 375 px', icon: 'mobile', width: 375 },
];

const useDebouncedBundle = (bundle: PreviewBundle) => {
  const [debounced, setDebounced] = useState(bundle);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(bundle), UPDATE_DELAY);
    return () => window.clearTimeout(timeout);
  }, [bundle]);
  return debounced;
};

const Preview = () => {
  const filesData = useAtomValue(projectFilesAtom);
  const dependencies = useAtomValue(projectDependenciesAtom);
  const bundle = useMemo(() => createPreviewBundle(filesData, dependencies), [filesData, dependencies]);
  const debouncedBundle = useDebouncedBundle(bundle);
  const [status, setStatus] = useState<PreviewStatusValue>('updating');
  const [previewError, setPreviewError] = useState<PreviewError | null>(null);
  const [diagnostics, setDiagnostics] = useState<PreviewError[]>([]);
  const [consoleEntries, setConsoleEntries] = useState<PreviewConsoleEntry[]>([]);
  const [networkEntries, setNetworkEntries] = useState<PreviewNetworkEntry[]>([]);
  const [activeDevtoolsView, setActiveDevtoolsView] = useState<DevtoolsView>('console');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messageListenerReady, setMessageListenerReady] = useState(false);
  const [documentRevision, setDocumentRevision] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewPaneRef = useRef<HTMLElement>(null);
  const channelId = useRef(`preview-${crypto.randomUUID()}`).current;
  const hasPreviewError = useRef(false);
  const renderId = useRef(0);
  const currentBundle = useRef(debouncedBundle);
  const previousBundle = useRef(debouncedBundle);
  const dependencyOrigins = useMemo(() => [...new Set(dependencies.flatMap(({ enabled, url }) => {
    if (!enabled) return [];
    try {
      const dependencyUrl = new URL(url);
      return dependencyUrl.protocol === 'https:' ? [dependencyUrl.origin] : [];
    } catch {
      return [];
    }
  }))], [dependencies]);
  const shell = useMemo(
    () => createPreviewShell(channelId, dependencyOrigins, window.location.origin),
    [channelId, dependencyOrigins],
  );
  const selectedDevice = previewDevices.find(({ id }) => id === previewDevice) || previewDevices[0];

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === previewPaneRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const postToFrame = (message: PreviewHostMessage) => {
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  };

  const renderCurrentFrame = () => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage({ type: 'preview:render', channelId, renderId: renderId.current, bundle: currentBundle.current } satisfies PreviewHostMessage, '*');
  };

  useEffect(() => {
    currentBundle.current = debouncedBundle;
    const previous = previousBundle.current;
    if (previous === debouncedBundle) return;
    previousBundle.current = debouncedBundle;
    const documentChanged = previous.markup !== debouncedBundle.markup || previous.scripts !== debouncedBundle.scripts || previous.dependencies !== debouncedBundle.dependencies;
    const stylesChanged = previous.styles !== debouncedBundle.styles;
    if (!documentChanged && !stylesChanged) return;

    hasPreviewError.current = false;
    setPreviewError(null);
    setDiagnostics([]);
    setConsoleEntries([]);
    setNetworkEntries([]);
    setStatus('updating');

    if (documentChanged) {
      renderId.current += 1;
      setDocumentRevision((revision) => revision + 1);
      return;
    }
    if (stylesChanged) {
      postToFrame({ type: 'preview:update-styles', channelId, styles: debouncedBundle.styles });
    }
  }, [channelId, debouncedBundle]);

  useLayoutEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewFrameMessage>) => {
      if (event.source !== iframeRef.current?.contentWindow || event.data?.channelId !== channelId) return;
      if (event.data.type === 'preview:ready') {
        renderCurrentFrame();
      } else if (event.data.type === 'preview:rendered' && event.data.renderId === renderId.current) {
        if (!hasPreviewError.current) setStatus('ready');
      } else if (event.data.type === 'preview:console') {
        if (event.data.renderId !== renderId.current) return;
        const entry = { level: event.data.level, message: event.data.message, timestamp: event.data.timestamp } satisfies PreviewConsoleEntry;
        setConsoleEntries((current) => [...current, entry].slice(-MAX_CONSOLE_ENTRIES));
      } else if (event.data.type === 'preview:network') {
        if (event.data.renderId !== renderId.current) return;
        const entry = {
          id: event.data.id,
          method: event.data.method,
          url: event.data.url,
          kind: event.data.kind,
          state: event.data.state,
          startedAt: event.data.startedAt,
          status: event.data.status,
          duration: event.data.duration,
          message: event.data.message,
        } satisfies PreviewNetworkEntry;
        setNetworkEntries((current) => {
          const existingIndex = current.findIndex(({ id }) => id === entry.id);
          const next = existingIndex === -1
            ? [...current, entry]
            : current.map((currentEntry, index) => index === existingIndex ? entry : currentEntry);
          return next.slice(-MAX_NETWORK_ENTRIES);
        });
      } else if (event.data.type === 'preview:error') {
        hasPreviewError.current = true;
        if (event.data.renderId !== renderId.current) return;
        const diagnostic = { category: event.data.category, message: event.data.message, source: event.data.source, line: event.data.line, column: event.data.column } satisfies PreviewError;
        setDiagnostics((current) => [...current, diagnostic].slice(-MAX_ERROR_ENTRIES));
        setPreviewError(diagnostic);
        setStatus('error');
      }
    };
    window.addEventListener('message', handleMessage);
    setMessageListenerReady(true);
    return () => window.removeEventListener('message', handleMessage);
  }, [channelId]);

  const reloadPreview = () => {
    hasPreviewError.current = false;
    renderId.current += 1;
    setPreviewError(null);
    setDiagnostics([]);
    setConsoleEntries([]);
    setNetworkEntries([]);
    setStatus('updating');
    setDocumentRevision((revision) => revision + 1);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === previewPaneRef.current) await document.exitFullscreen();
    else await previewPaneRef.current?.requestFullscreen();
  };

  const location = previewError?.line
    ? ` at ${previewError.line}${previewError.column ? `:${previewError.column}` : ''}`
    : '';

  const clearActiveView = () => {
    if (activeDevtoolsView === 'console') setConsoleEntries([]);
    if (activeDevtoolsView === 'network') setNetworkEntries([]);
    if (activeDevtoolsView === 'errors') {
      setDiagnostics([]);
      setPreviewError(null);
      hasPreviewError.current = false;
      setStatus('ready');
    }
  };

  const viewCounts: Record<DevtoolsView, number> = {
    console: consoleEntries.length,
    network: networkEntries.length,
    errors: diagnostics.length,
  };

  return (
    <PreviewPane ref={previewPaneRef} id='output' aria-label='Live preview'>
      <PreviewToolbar>
        <PreviewLabel>Preview</PreviewLabel>
        <PreviewAddressBar><span>localhost / preview</span></PreviewAddressBar>
        <PreviewActions>
          <PreviewControlGroup role='group' aria-label='Preview device'>
            {previewDevices.map((device) => (
              <PreviewControlButton
                key={device.id}
                type='button'
                $active={previewDevice === device.id}
                aria-label={device.label}
                aria-pressed={previewDevice === device.id}
                title={device.label}
                onClick={() => setPreviewDevice(device.id)}>
                <Icon name={device.icon} size={15} />
              </PreviewControlButton>
            ))}
          </PreviewControlGroup>
          <PreviewStatus $status={status} aria-label={`Preview ${status}`}><span>{status}</span></PreviewStatus>
          <ReloadButton type='button' aria-label='Reload preview' title='Reload preview' onClick={reloadPreview}>
            <Icon name='refresh' />
          </ReloadButton>
          <ReloadButton type='button' aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'} title={isFullscreen ? 'Exit full screen' : 'Enter full screen'} onClick={() => void toggleFullscreen()}>
            <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />
          </ReloadButton>
        </PreviewActions>
      </PreviewToolbar>
      {previewError && (
        <PreviewErrorBanner role='alert'>
          <strong>{previewError.category} error</strong>
          <span>{previewError.message}{location}</span>
        </PreviewErrorBanner>
      )}
      <PreviewViewport $constrained={Boolean(selectedDevice.width)}>
        {messageListenerReady && (
          <PreviewFrame
            key={documentRevision}
            ref={iframeRef}
            $deviceWidth={selectedDevice.width}
            name='frontend-fun-preview'
            srcDoc={shell}
            title={`Live project preview - ${selectedDevice.label}`}
            sandbox='allow-scripts'
            onLoad={renderCurrentFrame}
          />
        )}
      </PreviewViewport>
      <DevtoolsPanel aria-label='Preview developer tools'>
        <DevtoolsHeader>
          <DevtoolsTabs role='tablist' aria-label='Preview logs'>
            {(['console', 'network', 'errors'] as DevtoolsView[]).map((view) => (
              <DevtoolsTab
                key={view}
                id={`devtools-tab-${view}`}
                type='button'
                role='tab'
                aria-controls={`devtools-panel-${view}`}
                aria-selected={activeDevtoolsView === view}
                $active={activeDevtoolsView === view}
                onClick={() => setActiveDevtoolsView(view)}>
                {view[0].toUpperCase() + view.slice(1)} {viewCounts[view] > 0 && `(${viewCounts[view]})`}
              </DevtoolsTab>
            ))}
          </DevtoolsTabs>
          <DevtoolsClear type='button' onClick={clearActiveView}>Clear</DevtoolsClear>
        </DevtoolsHeader>
        <DevtoolsContent
          id={`devtools-panel-${activeDevtoolsView}`}
          role='tabpanel'
          aria-labelledby={`devtools-tab-${activeDevtoolsView}`}>
          {activeDevtoolsView === 'console' && (consoleEntries.length > 0 ? (
            <ul>{consoleEntries.map((entry, index) => (
              <ConsoleRow key={`${entry.timestamp}-${index}`} $level={entry.level}>
                <time>{new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
                <span>{entry.message}</span>
              </ConsoleRow>
            ))}</ul>
          ) : <DevtoolsEmpty>Console output will appear here.</DevtoolsEmpty>)}
          {activeDevtoolsView === 'network' && (networkEntries.length > 0 ? (
            <ul>{networkEntries.map((entry) => (
              <NetworkRow key={entry.id} title={entry.message || entry.url}>
                <strong>{entry.method}</strong>
                <code>{entry.url}</code>
                <span data-state={entry.state}>{entry.status || (entry.state === 'pending' ? '...' : 'failed')}</span>
                <span>{entry.duration === undefined ? '-' : `${entry.duration} ms`}</span>
              </NetworkRow>
            ))}</ul>
          ) : <DevtoolsEmpty>Fetch, XHR, script, and stylesheet requests will appear here.</DevtoolsEmpty>)}
          {activeDevtoolsView === 'errors' && (diagnostics.length > 0 ? (
            <ul>{diagnostics.map((diagnostic, index) => (
              <ErrorRow key={`${diagnostic.message}-${index}`}>
                <strong>{diagnostic.category}</strong>{diagnostic.message}
                {(diagnostic.source || diagnostic.line) && <small>{diagnostic.source || 'Preview'}{diagnostic.line ? `:${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ''}` : ''}</small>}
              </ErrorRow>
            ))}</ul>
          ) : <DevtoolsEmpty>Runtime, syntax, network, and security errors will appear here.</DevtoolsEmpty>)}
        </DevtoolsContent>
      </DevtoolsPanel>
    </PreviewPane>
  );
};

export default Preview;
