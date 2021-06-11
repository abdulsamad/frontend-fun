import { FC } from 'react';

import HTMLLogo from '../assets/html.svg';
import CSSLogo from '../assets/css.svg';
import JavaScriptLogo from '../assets/javascript.svg';

interface Props {
  fileName: string;
}

const AddLanguageLogo: FC<Props> = ({ fileName }) => {
  const languageLogoSwitch = (fileName: string) => {
    const fileType = fileName.toLowerCase().split('.').pop();

    switch (fileType) {
      case 'html':
      case 'htm':
        return HTMLLogo;
      case 'css':
        return CSSLogo;
      case 'js':
        return JavaScriptLogo;
      default:
        return fileName;
    }
  };

  return (
    <>
      <img height={16} width={16} src={languageLogoSwitch(fileName)} alt="Language" />
      <span style={{ marginLeft: 5 }}>{fileName}</span>
    </>
  );
};

export default AddLanguageLogo;
