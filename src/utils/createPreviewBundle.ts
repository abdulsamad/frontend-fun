import { PreviewDependency, ProjectFile } from '../state/types';

export interface PreviewBundle {
  markup: string;
  styles: string;
  scripts: string;
  dependencies: PreviewDependency[];
}

export type PreviewStatus = 'updating' | 'ready' | 'error';

export interface PreviewError {
  category: 'syntax' | 'module' | 'runtime' | 'network' | 'security';
  message: string;
  source?: string;
  line?: number;
  column?: number;
}

export type PreviewConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface PreviewConsoleEntry {
  level: PreviewConsoleLevel;
  message: string;
  timestamp: number;
}

export type PreviewNetworkKind = 'fetch' | 'xhr' | 'script' | 'stylesheet';
export type PreviewNetworkState = 'pending' | 'success' | 'error';

export interface PreviewNetworkEntry {
  id: string;
  method: string;
  url: string;
  kind: PreviewNetworkKind;
  state: PreviewNetworkState;
  startedAt: number;
  status?: number;
  duration?: number;
  message?: string;
}

export type PreviewHostMessage =
  | { type: 'preview:render'; channelId: string; renderId: number; bundle: PreviewBundle }
  | { type: 'preview:update-styles'; channelId: string; styles: string };

export type PreviewFrameMessage =
  | { type: 'preview:ready'; channelId: string }
  | { type: 'preview:rendered'; channelId: string; renderId: number }
  | ({ type: 'preview:console'; channelId: string; renderId: number } & PreviewConsoleEntry)
  | ({ type: 'preview:network'; channelId: string; renderId: number } & PreviewNetworkEntry)
  | ({ type: 'preview:error'; channelId: string; renderId: number } & PreviewError);

const joinFiles = (
  files: ProjectFile[],
  language: string,
  createSeparator: (name: string) => string,
) => files
  .filter((file) => file.language === language)
  .map((file) => `${createSeparator(file.name)}\n${file.value}`)
  .join('\n\n');

export const createPreviewBundle = (files: ProjectFile[], dependencies: PreviewDependency[] = []): PreviewBundle => ({
  markup: files
    .filter((file) => file.language === 'html' || file.language === 'htm')
    .map((file) => `<!-- ${file.name} -->\n${file.value}`)
    .join('\n\n'),
  styles: joinFiles(files, 'css', (name) => `/* ${name} */`),
  scripts: joinFiles(files, 'javascript', (name) => `// ${name}`),
  dependencies: dependencies.filter(({ enabled }) => enabled),
});

export const createPreviewShell = (channelId: string, dependencyOrigins: string[], appOrigin: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; script-src 'unsafe-inline' ${dependencyOrigins.join(' ')}; style-src 'unsafe-inline' ${dependencyOrigins.join(' ')}; img-src data: blob: https:; font-src data: blob: https:; connect-src data: blob: https: http: wss: ws:;" />
    <title>Frontend Fun preview</title>
    <style>#frontend-fun-root { display: contents; }</style>
    <style id="frontend-fun-styles"></style>
  </head>
  <body>
    <main id="frontend-fun-root"></main>
    <script>
      (() => {
        const channelId = ${JSON.stringify(channelId)};
        const appOrigin = ${JSON.stringify(appOrigin)};
        const root = document.getElementById('frontend-fun-root');
        const styles = document.getElementById('frontend-fun-styles');
        let lastRenderId = null;
        const send = (message) => parent.postMessage({ ...message, channelId }, '*');
        let activeRenderId = 0;
        let networkSequence = 0;
        const nextNetworkId = () => String(++networkSequence);
        const safeSerialize = (value) => {
          if (typeof value === 'string') return value;
          if (value instanceof Error) return value.stack || value.name + ': ' + value.message;
          if (value === undefined) return 'undefined';
          if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
          if (typeof value === 'symbol') return String(value);
          try {
            const seen = new WeakSet();
            const serialized = JSON.stringify(value, (_key, nestedValue) => {
              if (typeof nestedValue === 'bigint') return String(nestedValue) + 'n';
              if (typeof nestedValue === 'object' && nestedValue !== null) {
                if (seen.has(nestedValue)) return '[Circular]';
                seen.add(nestedValue);
              }
              return nestedValue;
            });
            return serialized === undefined ? String(value) : serialized;
          } catch {
            return String(value);
          }
        };
        for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
          const original = console[level].bind(console);
          console[level] = (...values) => {
            send({
              type: 'preview:console',
              renderId: activeRenderId,
              level,
              message: values.map(safeSerialize).join(' ').slice(0, 8000),
              timestamp: Date.now(),
            });
            original(...values);
          };
        }
        const reportNetwork = (entry) => send({ type: 'preview:network', renderId: activeRenderId, ...entry });
        const reportError = (category, error, line, column, source) => send({
          type: 'preview:error',
          renderId: activeRenderId,
          category,
          message: error instanceof Error ? error.message : String(error || 'Preview runtime error'),
          source,
          line: Number.isFinite(line) ? line : undefined,
          column: Number.isFinite(column) ? column : undefined,
        });
        const resolveRequestUrl = (input) => {
          try {
            return new URL(input instanceof Request ? input.url : String(input), document.baseURI);
          } catch {
            return null;
          }
        };
        const appOriginError = () => new DOMException(
          'Preview code cannot request the Frontend Fun application origin.',
          'SecurityError',
        );

        const originalFetch = window.fetch.bind(window);
        window.fetch = async (...args) => {
          const input = args[0];
          const init = args[1];
          const id = nextNetworkId();
          const startedAt = Date.now();
          const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
          const resolvedUrl = resolveRequestUrl(input);
          const url = resolvedUrl?.href || (input instanceof Request ? input.url : String(input));
          reportNetwork({ id, method, url, kind: 'fetch', state: 'pending', startedAt });
          try {
            if (resolvedUrl?.origin === appOrigin) throw appOriginError();
            const response = await originalFetch(...args);
            reportNetwork({ id, method, url, kind: 'fetch', state: response.ok ? 'success' : 'error', startedAt, status: response.status, duration: Date.now() - startedAt });
            return response;
          } catch (error) {
            reportNetwork({ id, method, url, kind: 'fetch', state: 'error', startedAt, duration: Date.now() - startedAt, message: error instanceof Error ? error.message : String(error) });
            throw error;
          }
        };

        const xhrDetails = new WeakMap();
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        const originalXhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
          const resolvedUrl = resolveRequestUrl(url);
          xhrDetails.set(this, {
            method: String(method).toUpperCase(),
            url: resolvedUrl?.href || String(url),
            blocked: resolvedUrl?.origin === appOrigin,
          });
          return originalXhrOpen.call(this, method, url, ...args);
        };
        XMLHttpRequest.prototype.send = function(...args) {
          const details = xhrDetails.get(this) || { method: 'GET', url: '', blocked: false };
          const { blocked, ...networkDetails } = details;
          const id = nextNetworkId();
          const startedAt = Date.now();
          reportNetwork({ id, ...networkDetails, kind: 'xhr', state: 'pending', startedAt });
          if (blocked) {
            const error = appOriginError();
            reportNetwork({ id, ...networkDetails, kind: 'xhr', state: 'error', startedAt, duration: 0, message: error.message });
            throw error;
          }
          this.addEventListener('loadend', () => {
            const success = this.status >= 200 && this.status < 400;
            reportNetwork({ id, ...networkDetails, kind: 'xhr', state: success ? 'success' : 'error', startedAt, status: this.status || undefined, duration: Date.now() - startedAt });
          }, { once: true });
          return originalXhrSend.apply(this, args);
        };

        window.addEventListener('error', (event) => {
          const category = event.error?.name === 'SyntaxError' ? 'syntax' : 'runtime';
          reportError(category, event.error || event.message, event.lineno, event.colno, event.filename);
        });
        window.addEventListener('unhandledrejection', (event) => reportError('runtime', event.reason));
        window.addEventListener('securitypolicyviolation', (event) => reportError('security', event.violatedDirective, undefined, undefined, event.blockedURI));

        const waitForResource = (element, url, category) => new Promise((resolve) => {
          let settled = false;
          const id = nextNetworkId();
          const startedAt = Date.now();
          const kind = element.tagName === 'LINK' ? 'stylesheet' : 'script';
          reportNetwork({ id, method: 'GET', url, kind, state: 'pending', startedAt });
          const finish = (error) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            reportNetwork({ id, method: 'GET', url, kind, state: error ? 'error' : 'success', startedAt, duration: Date.now() - startedAt, message: error?.message });
            if (error) reportError(category, error, undefined, undefined, url);
            resolve();
          };
          const timeout = window.setTimeout(() => finish(new Error('Resource load timed out after 10 seconds')), 10000);
          element.addEventListener('load', () => finish(), { once: true });
          element.addEventListener('error', () => finish(new Error('Resource failed to load')), { once: true });
        });

        const loadDependencies = async (dependencies) => {
          for (const dependency of dependencies) {
            const element = dependency.type === 'style' ? document.createElement('link') : document.createElement('script');
            element.setAttribute('data-preview-dependency', dependency.id);
            element.setAttribute('data-preview-url', dependency.url);
            if (dependency.type === 'style') {
              element.rel = 'stylesheet';
              element.href = dependency.url;
            } else {
              if (dependency.type === 'module') element.type = 'module';
              element.src = dependency.url;
            }
            const settled = waitForResource(element, dependency.url, dependency.type === 'module' ? 'module' : 'network');
            document.head.append(element);
            await settled;
          }
        };

        const activateMarkupScripts = async () => {
          const inertScripts = Array.from(root.querySelectorAll('script'));
          for (const inertScript of inertScripts) {
            const script = document.createElement('script');
            for (const attribute of inertScript.attributes) {
              script.setAttribute(attribute.name, attribute.value);
            }
            script.textContent = inertScript.textContent;
            const settled = script.src
              ? waitForResource(script, script.src, 'network')
              : Promise.resolve();
            inertScript.replaceWith(script);
            await settled;
          }
        };

        const render = async (bundle, renderId) => {
          activeRenderId = renderId;
          styles.textContent = bundle.styles;
          root.innerHTML = bundle.markup;
          await loadDependencies(bundle.dependencies);
          await activateMarkupScripts();
          if (bundle.scripts) {
            const projectScript = document.createElement('script');
            projectScript.textContent = bundle.scripts + '\\n//# sourceURL=frontend-fun-preview.js';
            document.body.append(projectScript);
          }
          send({ type: 'preview:rendered', renderId });
        };

        window.addEventListener('message', (event) => {
          if (event.source !== parent || event.data?.channelId !== channelId) return;
          if (event.data.type === 'preview:update-styles') {
            styles.textContent = event.data.styles;
            send({ type: 'preview:rendered', renderId: activeRenderId });
          }
          if (event.data.type === 'preview:render') {
            if (event.data.renderId === lastRenderId) return;
            lastRenderId = event.data.renderId;
            render(event.data.bundle, event.data.renderId).catch((error) => reportError('runtime', error));
          }
        });

        send({ type: 'preview:ready' });
      })();
    </script>
  </body>
</html>`;
