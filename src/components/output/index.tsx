import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';

import { projectDependenciesAtom, projectFilesAtom } from '../../state/projectAtoms';
import {
  createPreviewBundle,
  createPreviewShell,
  PreviewBundle,
  PreviewConsoleEntry,
  PreviewConsoleValue,
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
  ConsoleJson,
  ConsoleJsonChildren,
  ConsoleJsonLeaf,
  ConsoleJsonMeta,
  ConsoleValues,
  DevtoolsClear,
  DevtoolsContent,
  DevtoolsEmpty,
  DevtoolsHeader,
  DevtoolsPanel,
  DevtoolsResizeHandle,
  DevtoolsTab,
  DevtoolsTabs,
  DevtoolsToggle,
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

const appendDiagnostic = (current: PreviewError[], diagnostic: PreviewError) => {
  const previous = current.at(-1);
  if (previous && previous.category === diagnostic.category && previous.message === diagnostic.message && previous.source === diagnostic.source) {
    return current;
  }
  return [...current, diagnostic].slice(-MAX_ERROR_ENTRIES);
};

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const jsonSummary = (value: JsonValue) => {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value && typeof value === 'object') return `Object {${Object.keys(value).length}}`;
  return String(value);
};

const JsonNode = ({ label, value }: { label: string; value: JsonValue }) => {
  if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
    const entries = Array.isArray(value)
      ? value.map((child, index) => [String(index), child] as const)
      : Object.entries(value);
    return (
      <ConsoleJson>
        <summary><strong>{label}</strong> <ConsoleJsonMeta>{jsonSummary(value)}</ConsoleJsonMeta></summary>
        <ConsoleJsonChildren>{entries.map(([key, child]) => <JsonNode key={key} label={key} value={child} />)}</ConsoleJsonChildren>
      </ConsoleJson>
    );
  }
  const type = value === null ? 'null' : typeof value;
  return <ConsoleJsonLeaf data-type={type}><span>{label}</span><span>{typeof value === 'string' ? JSON.stringify(value) : String(value)}</span></ConsoleJsonLeaf>;
};

const ConsoleValue = ({ type, value }: PreviewConsoleValue) => {
  if (type !== 'json') return <span>{value}</span>;
  try {
    return <JsonNode label='value' value={JSON.parse(value) as JsonValue} />;
  } catch {
    return <span>{value}</span>;
  }
};

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
  const [isDevtoolsCollapsed, setIsDevtoolsCollapsed] = useState(false);
  const [devtoolsHeight, setDevtoolsHeight] = useState(190);
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
        const values = Array.isArray(event.data.values)
          ? event.data.values
            .filter((value) => (value?.type === 'text' || value?.type === 'json') && typeof value.value === 'string')
            .slice(0, 20)
            .map((value) => ({ type: value.type, value: value.value.slice(0, 8000) }))
          : [];
        const entry = { level: event.data.level, values, timestamp: event.data.timestamp } satisfies PreviewConsoleEntry;
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
        if (event.data.renderId !== renderId.current) return;
        const diagnostic = { category: event.data.category, message: event.data.message, source: event.data.source, line: event.data.line, column: event.data.column, recoverable: event.data.recoverable } satisfies PreviewError;
        setDiagnostics((current) => appendDiagnostic(current, diagnostic));
        if (!diagnostic.recoverable) {
          hasPreviewError.current = true;
          setPreviewError(diagnostic);
          setStatus('error');
        }
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

  const resizeDevtools = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDevtoolsCollapsed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const startHeight = devtoolsHeight;
    const handleMove = (moveEvent: PointerEvent) => {
      const maxHeight = Math.max(180, Math.floor((previewPaneRef.current?.clientHeight || 560) * 0.8));
      const nextHeight = Math.min(maxHeight, Math.max(118, startHeight + startY - moveEvent.clientY));
      setDevtoolsHeight(nextHeight);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp, { once: true });
  };

  const resizeDevtoolsWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const delta = event.key === 'ArrowUp' ? 20 : -20;
    setDevtoolsHeight((height) => Math.min(600, Math.max(118, height + delta)));
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
      <DevtoolsPanel $collapsed={isDevtoolsCollapsed} $height={devtoolsHeight} aria-label='Preview developer tools'>
        <DevtoolsResizeHandle
          $collapsed={isDevtoolsCollapsed}
          role='separator'
          aria-orientation='horizontal'
          aria-label='Resize preview console'
          aria-valuemin={118}
          aria-valuemax={600}
          aria-valuenow={devtoolsHeight}
          tabIndex={0}
          onPointerDown={resizeDevtools}
          onKeyDown={resizeDevtoolsWithKeyboard}
        />
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
                onClick={() => {
                  if (activeDevtoolsView === view && !isDevtoolsCollapsed) setIsDevtoolsCollapsed(true);
                  else {
                    setActiveDevtoolsView(view);
                    setIsDevtoolsCollapsed(false);
                  }
                }}>
                {view[0].toUpperCase() + view.slice(1)} {viewCounts[view] > 0 && `(${viewCounts[view]})`}
              </DevtoolsTab>
            ))}
          </DevtoolsTabs>
          <span>
            {!isDevtoolsCollapsed && <DevtoolsClear type='button' onClick={clearActiveView}>Clear</DevtoolsClear>}
            <DevtoolsToggle
              type='button'
              $collapsed={isDevtoolsCollapsed}
              aria-expanded={!isDevtoolsCollapsed}
              aria-label={isDevtoolsCollapsed ? 'Expand preview console' : 'Collapse preview console'}
              title={isDevtoolsCollapsed ? 'Expand logs' : 'Collapse logs'}
              onClick={() => setIsDevtoolsCollapsed((collapsed) => !collapsed)}>
              <Icon name='chevron-down' size={16} />
            </DevtoolsToggle>
          </span>
        </DevtoolsHeader>
        {!isDevtoolsCollapsed && <DevtoolsContent
          id={`devtools-panel-${activeDevtoolsView}`}
          role='tabpanel'
          aria-labelledby={`devtools-tab-${activeDevtoolsView}`}>
          {activeDevtoolsView === 'console' && (consoleEntries.length > 0 ? (
            <ul>{consoleEntries.map((entry, index) => (
              <ConsoleRow key={`${entry.timestamp}-${index}`} $level={entry.level}>
                <time>{new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
                <ConsoleValues>{entry.values.map((value, valueIndex) => <ConsoleValue key={valueIndex} {...value} />)}</ConsoleValues>
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
        </DevtoolsContent>}
      </DevtoolsPanel>
    </PreviewPane>
  );
};

export default Preview;
