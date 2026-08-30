import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';

import { projectFilesAtom } from '../../state/projectAtoms';
import {
  createPreviewBundle,
  createPreviewShell,
  PreviewBundle,
  PreviewError,
  PreviewFrameMessage,
  PreviewHostMessage,
  PreviewStatus as PreviewStatusValue,
} from '../../utils/createPreviewBundle';
import Icon from '../Icon';
import PreviewPane from './Output';
import { PreviewErrorBanner, PreviewFrame } from './Iframe';
import { PreviewActions, PreviewAddressBar, PreviewLabel, PreviewStatus, PreviewToolbar, ReloadButton } from './Nav';

const UPDATE_DELAY = 200;

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
  const bundle = useMemo(() => createPreviewBundle(filesData), [filesData]);
  const debouncedBundle = useDebouncedBundle(bundle);
  const [status, setStatus] = useState<PreviewStatusValue>('updating');
  const [previewError, setPreviewError] = useState<PreviewError | null>(null);
  const [messageListenerReady, setMessageListenerReady] = useState(false);
  const [documentRevision, setDocumentRevision] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const channelId = useRef(`preview-${crypto.randomUUID()}`).current;
  const hasPreviewError = useRef(false);
  const renderId = useRef(0);
  const currentBundle = useRef(debouncedBundle);
  const previousBundle = useRef(debouncedBundle);
  const shell = useMemo(() => createPreviewShell(channelId), [channelId]);

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
    const documentChanged = previous.markup !== debouncedBundle.markup || previous.scripts !== debouncedBundle.scripts;
    const stylesChanged = previous.styles !== debouncedBundle.styles;
    if (!documentChanged && !stylesChanged) return;

    hasPreviewError.current = false;
    setPreviewError(null);
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
      } else if (event.data.type === 'preview:rendered') {
        if (!hasPreviewError.current) setStatus('ready');
      } else if (event.data.type === 'preview:error') {
        hasPreviewError.current = true;
        setPreviewError({ message: event.data.message, line: event.data.line, column: event.data.column });
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
    setStatus('updating');
    setDocumentRevision((revision) => revision + 1);
  };

  const location = previewError?.line
    ? ` at ${previewError.line}${previewError.column ? `:${previewError.column}` : ''}`
    : '';

  return (
    <PreviewPane id='output' aria-label='Live preview'>
      <PreviewToolbar>
        <PreviewLabel>Preview</PreviewLabel>
        <PreviewAddressBar><span>localhost / preview</span></PreviewAddressBar>
        <PreviewActions>
          <PreviewStatus $status={status} aria-label={`Preview ${status}`}><span>{status}</span></PreviewStatus>
          <ReloadButton type='button' aria-label='Reload preview' title='Reload preview' onClick={reloadPreview}>
            <Icon name='refresh' />
          </ReloadButton>
        </PreviewActions>
      </PreviewToolbar>
      {previewError && (
        <PreviewErrorBanner role='alert'>
          <strong>Preview error</strong>
          <span>{previewError.message}{location}</span>
        </PreviewErrorBanner>
      )}
      {messageListenerReady && (
        <PreviewFrame
          key={documentRevision}
          ref={iframeRef}
          name='frontend-fun-preview'
          srcDoc={shell}
          title='Live project preview'
          sandbox='allow-scripts'
          onLoad={renderCurrentFrame}
        />
      )}
    </PreviewPane>
  );
};

export default Preview;
