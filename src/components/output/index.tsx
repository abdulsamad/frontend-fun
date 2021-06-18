import { FC, useRef, useEffect } from 'react';

import { useAppContext } from '../../context';

import OutputContainer from './Output';
import { Nav, Addressbar, Address } from './Nav';
import Iframe from './Iframe';
import ConvertArrToString from '../../utils/convertArrtoString';

interface Props {
  id: string;
}

const Output: FC<Props> = ({ id }) => {
  const { filesData, activeFile } = useAppContext();
  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const { allFilesHTMLCombined, allFilesCSSCombined, allFilesJSCombined } =
    ConvertArrToString(filesData);

  useEffect(() => {
    const outputIframeDocument = (iFrameRef.current as HTMLIFrameElement).contentWindow?.document;

    if (outputIframeDocument) {
      outputIframeDocument.body.innerHTML = '';

      // Append HTML to iFrame
      outputIframeDocument.body.innerHTML += allFilesHTMLCombined;

      // Append CSS to iFrame
      const style = document.createElement('style') as HTMLStyleElement;
      style.innerHTML = allFilesCSSCombined;
      outputIframeDocument.body.appendChild(style);

      // Append Javascript to iFrame
      if (activeFile.language === 'javascript') {
        const script = document.createElement('script') as HTMLScriptElement;
        script.innerHTML = allFilesJSCombined;
        outputIframeDocument.body.appendChild(script);
      }
    }
  }, [allFilesCSSCombined, allFilesHTMLCombined, allFilesJSCombined, activeFile]);

  return (
    <OutputContainer id={id}>
      <Nav>
        <Addressbar>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#54BB52">
            <path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-5 7.723v2.277h-2v-2.277c-.595-.347-1-.984-1-1.723 0-1.104.896-2 2-2s2 .896 2 2c0 .738-.404 1.376-1 1.723zm-5-7.723v-4c0-2.206 1.794-4 4-4 2.205 0 4 1.794 4 4v4h-8z" />
          </svg>
          <Address>127.0.0.1</Address>
        </Addressbar>
      </Nav>
      <Iframe name="output-iframe" ref={iFrameRef} title="code output" />
    </OutputContainer>
  );
};

export default Output;
