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

export type PreviewHostMessage =
  | { type: 'preview:render'; channelId: string; renderId: number; bundle: PreviewBundle }
  | { type: 'preview:update-styles'; channelId: string; styles: string };

export type PreviewFrameMessage =
  | { type: 'preview:ready'; channelId: string }
  | { type: 'preview:rendered'; channelId: string; renderId: number }
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

export const createPreviewShell = (channelId: string, dependencyOrigins: string[]) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; script-src 'unsafe-inline' ${dependencyOrigins.join(' ')}; style-src 'unsafe-inline' ${dependencyOrigins.join(' ')}; img-src data: blob: https:; font-src data: blob: https:; connect-src 'none';" />
    <title>Frontend Fun preview</title>
    <style>#frontend-fun-root { display: contents; }</style>
    <style id="frontend-fun-styles"></style>
  </head>
  <body>
    <main id="frontend-fun-root"></main>
    <script>
      (() => {
        const channelId = ${JSON.stringify(channelId)};
        const root = document.getElementById('frontend-fun-root');
        const styles = document.getElementById('frontend-fun-styles');
        let lastRenderId = null;
        const send = (message) => parent.postMessage({ ...message, channelId }, '*');
        let activeRenderId = 0;
        const reportError = (category, error, line, column, source) => send({
          type: 'preview:error',
          renderId: activeRenderId,
          category,
          message: error instanceof Error ? error.message : String(error || 'Preview runtime error'),
          source,
          line: Number.isFinite(line) ? line : undefined,
          column: Number.isFinite(column) ? column : undefined,
        });

        window.addEventListener('error', (event) => {
          const category = event.error?.name === 'SyntaxError' ? 'syntax' : 'runtime';
          reportError(category, event.error || event.message, event.lineno, event.colno, event.filename);
        });
        window.addEventListener('unhandledrejection', (event) => reportError('runtime', event.reason));
        window.addEventListener('securitypolicyviolation', (event) => reportError('security', event.violatedDirective, undefined, undefined, event.blockedURI));

        const waitForResource = (element, url, category) => new Promise((resolve) => {
          let settled = false;
          const finish = (error) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
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
              ? new Promise((resolve) => {
                  script.addEventListener('load', resolve, { once: true });
                  script.addEventListener('error', () => {
                    reportError('network', new Error('HTML script failed to load'), undefined, undefined, script.src);
                    resolve();
                  }, { once: true });
                })
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
            send({ type: 'preview:rendered' });
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
