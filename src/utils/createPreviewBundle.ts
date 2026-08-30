import { ProjectFile } from '../state/types';

export interface PreviewBundle {
  markup: string;
  styles: string;
  scripts: string;
}

export type PreviewStatus = 'updating' | 'ready' | 'error';

export interface PreviewError {
  message: string;
  line?: number;
  column?: number;
}

export type PreviewHostMessage =
  | { type: 'preview:render'; channelId: string; renderId: number; bundle: PreviewBundle }
  | { type: 'preview:update-styles'; channelId: string; styles: string };

export type PreviewFrameMessage =
  | { type: 'preview:ready'; channelId: string }
  | { type: 'preview:rendered'; channelId: string }
  | ({ type: 'preview:error'; channelId: string } & PreviewError);

const joinFiles = (
  files: ProjectFile[],
  language: string,
  createSeparator: (name: string) => string,
) => files
  .filter((file) => file.language === language)
  .map((file) => `${createSeparator(file.name)}\n${file.value}`)
  .join('\n\n');

export const createPreviewBundle = (files: ProjectFile[]): PreviewBundle => ({
  markup: files
    .filter((file) => file.language === 'html' || file.language === 'htm')
    .map((file) => `<!-- ${file.name} -->\n${file.value}`)
    .join('\n\n'),
  styles: joinFiles(files, 'css', (name) => `/* ${name} */`),
  scripts: joinFiles(files, 'javascript', (name) => `// ${name}`),
});

export const createPreviewShell = (channelId: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        const reportError = (error, line, column) => send({
          type: 'preview:error',
          message: error instanceof Error ? error.message : String(error || 'Preview runtime error'),
          line: Number.isFinite(line) ? line : undefined,
          column: Number.isFinite(column) ? column : undefined,
        });

        window.addEventListener('error', (event) => {
          reportError(event.error || event.message, event.lineno, event.colno);
        });
        window.addEventListener('unhandledrejection', (event) => reportError(event.reason));

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
                  script.addEventListener('error', resolve, { once: true });
                })
              : Promise.resolve();
            inertScript.replaceWith(script);
            await settled;
          }
        };

        const render = async (bundle) => {
          styles.textContent = bundle.styles;
          root.innerHTML = bundle.markup;
          await activateMarkupScripts();
          if (bundle.scripts) {
            const projectScript = document.createElement('script');
            projectScript.textContent = bundle.scripts + '\\n//# sourceURL=frontend-fun-preview.js';
            document.body.append(projectScript);
          }
          send({ type: 'preview:rendered' });
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
            render(event.data.bundle).catch(reportError);
          }
        });

        send({ type: 'preview:ready' });
      })();
    </script>
  </body>
</html>`;
