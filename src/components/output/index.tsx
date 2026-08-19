import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { useAppContext } from '../../context';

import OutputContainer from './Output';
import { Nav, Addressbar, Address } from './Nav';
import Iframe from './Iframe';
import ConvertArrToString from '../../utils/convertArrtoString';

const Output: FC = () => {
	const { filesData } = useAppContext();
	const [previewError, setPreviewError] = useState('');
	const previewId = useRef(`preview-${Math.random().toString(36).slice(2)}`).current;
	const { allFilesHTMLCombined, allFilesCSSCombined, allFilesJSCombined } = useMemo(() => ConvertArrToString(filesData), [filesData]);
	const srcDoc = `
  <html>
    <head>
      <style>${allFilesCSSCombined}</style>
    </head>
    <body>
      ${allFilesHTMLCombined}
      <script>
        window.addEventListener('error', function (event) {
          parent.postMessage({ type: 'preview-error', id: '${previewId}', message: event.message || 'Preview runtime error' }, '*');
        });
        try { ${allFilesJSCombined} } catch (error) { parent.postMessage({ type: 'preview-error', id: '${previewId}', message: error.message }, '*'); }
      </script>
    </body>
  </html>`;

	useEffect(() => {
		setPreviewError('');
	}, [srcDoc]);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			if (event.data?.type === 'preview-error' && event.data.id === previewId) setPreviewError(String(event.data.message));
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [previewId]);

	return (
		<OutputContainer id='output'>
			<Nav>
				<Addressbar>
					<svg width='16' height='16' viewBox='0 0 24 24' fill='#54BB52'>
						<path d='M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-5 7.723v2.277h-2v-2.277c-.595-.347-1-.984-1-1.723 0-1.104.896-2 2-2s2 .896 2 2c0 .738-.404 1.376-1 1.723zm-5-7.723v-4c0-2.206 1.794-4 4-4 2.205 0 4 1.794 4 4v4h-8z' />
					</svg>
					<Address>127.0.0.1</Address>
				</Addressbar>
			</Nav>
			{previewError && <div role='alert' style={{ padding: 12, color: '#b00020', background: '#fff' }}>Preview error: {previewError}</div>}
			<Iframe name='output-iframe' srcDoc={srcDoc} title='code output' sandbox='allow-scripts' />
		</OutputContainer>
	);
};

export default Output;
