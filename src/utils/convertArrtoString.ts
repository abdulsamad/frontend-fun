import { fileData } from '../context/types';

const convertArrayToString = (filesData: fileData[]) => {
  // Filtering and Combining all files into One
  const allFilesHTMLCombined = filesData
    .filter(({ language }) => language === 'html' || language === 'htm')
    .reduce((prevVal, currVal, index) => {
      return index === 0 ? currVal.value : prevVal + ' ' + currVal.value;
    }, '');

  const allFilesCSSCombined = filesData
    .filter(({ language }) => language === 'css')
    .reduce((prevVal, currVal, index) => {
      return index === 0 ? currVal.value : prevVal + ' ' + currVal.value;
    }, '');

  const allFilesJSCombined = filesData
    .filter(({ language }) => language === 'javascript')
    .reduce((prevVal, currVal, index) => {
      return index === 0 ? currVal.value : prevVal + ' ' + currVal.value;
    }, '');

  return { allFilesHTMLCombined, allFilesCSSCombined, allFilesJSCombined };
};

export default convertArrayToString;
