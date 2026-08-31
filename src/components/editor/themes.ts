interface ITheme {
  base: string;
  inherit: boolean;
  rules: any[];
  colors: {
    [key: string]: string | boolean | number;
  };
}

export const customTheme: ITheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1F1F1F',
    'editor.foreground': '#CCCCCC',
    'editor.lineHighlightBackground': '#2A2D2E66',
    'editor.selectionBackground': '#264F78',
    'editorCursor.foreground': '#AEAFAD',
    'editor.findMatchHighlightBackground': '#EA5C0055',
    'editorGroup.background': '#181818',
    'editorGroup.border': '#2B2B2B',
    'editorGroupHeader.tabsBackground': '#181818',
    'editorIndentGuide.background1': '#404040',
    'editorIndentGuide.activeBackground1': '#707070',
    'editorLineNumber.foreground': '#6E7681',
    'editorLineNumber.activeForeground': '#CCCCCC',
    'editorWhitespace.foreground': '#3B3B3B',
    'editorRuler.foreground': '#3B3B3B',
    'editorHoverWidget.background': '#252526',
    'editorHoverWidget.border': '#454545',
    'editorSuggestWidget.background': '#252526',
    'editorSuggestWidget.border': '#454545',
    'editorSuggestWidget.selectedBackground': '#04395E',
    'editorWidget.background': '#252526',
    'editorWidget.border': '#454545',
  },
};

export const oneDarkTheme: ITheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '5C6370', fontStyle: 'italic' },
    { token: 'string', foreground: '98C379' },
    { token: 'keyword', foreground: 'C678DD' },
    { token: 'number', foreground: 'D19A66' },
    { token: 'type', foreground: 'E5C07B' },
    { token: 'function', foreground: '61AFEF' },
    { token: 'variable', foreground: 'E06C75' },
  ],
  colors: {
    'editor.background': '#282C34',
    'editor.foreground': '#ABB2BF',
    'editor.lineHighlightBackground': '#2C313C',
    'editor.selectionBackground': '#3E4451',
    'editorCursor.foreground': '#528BFF',
    'editorGroup.background': '#21252B',
    'editorGroupHeader.tabsBackground': '#21252B',
    'editorLineNumber.foreground': '#4B5263',
    'editorLineNumber.activeForeground': '#ABB2BF',
    'editorIndentGuide.background1': '#3B4048',
    'editorIndentGuide.activeBackground1': '#5C6370',
    'editorWidget.background': '#21252B',
    'editorWidget.border': '#181A1F',
    'editorSuggestWidget.background': '#21252B',
    'editorSuggestWidget.selectedBackground': '#3E4451',
  },
};

export const cobalt: ITheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      background: '002240',
      token: '',
    },
    {
      foreground: 'e1efff',
      token: 'punctuation - (punctuation.definition.string || punctuation.definition.comment)',
    },
    {
      foreground: 'ff628c',
      token: 'constant',
    },
    {
      foreground: 'ffdd00',
      token: 'entity',
    },
    {
      foreground: 'ff9d00',
      token: 'keyword',
    },
    {
      foreground: 'ffee80',
      token: 'storage',
    },
    {
      foreground: '3ad900',
      token: 'string -string.unquoted.old-plist -string.unquoted.heredoc',
    },
    {
      foreground: '3ad900',
      token: 'string.unquoted.heredoc string',
    },
    {
      foreground: '0088ff',
      fontStyle: 'italic',
      token: 'comment',
    },
    {
      foreground: '80ffbb',
      token: 'support',
    },
    {
      foreground: 'cccccc',
      token: 'variable',
    },
    {
      foreground: 'ff80e1',
      token: 'variable.language',
    },
    {
      foreground: 'ffee80',
      token: 'meta.function-call',
    },
    {
      foreground: 'f8f8f8',
      background: '800f00',
      token: 'invalid',
    },
    {
      foreground: 'ffffff',
      background: '223545',
      token: 'text source',
    },
    {
      foreground: 'ffffff',
      background: '223545',
      token: 'string.unquoted.heredoc',
    },
    {
      foreground: 'ffffff',
      background: '223545',
      token: 'source source',
    },
    {
      foreground: '80fcff',
      fontStyle: 'italic',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '9eff80',
      token: 'string.quoted source',
    },
    {
      foreground: '80ff82',
      token: 'string constant',
    },
    {
      foreground: '80ffc2',
      token: 'string.regexp',
    },
    {
      foreground: 'edef7d',
      token: 'string variable',
    },
    {
      foreground: 'ffb054',
      token: 'support.function',
    },
    {
      foreground: 'eb939a',
      token: 'support.constant',
    },
    {
      foreground: 'ff1e00',
      token: 'support.type.exception',
    },
    {
      foreground: '8996a8',
      token: 'meta.preprocessor.c',
    },
    {
      foreground: 'afc4db',
      token: 'meta.preprocessor.c keyword',
    },
    {
      foreground: '73817d',
      token: 'meta.sgml.html meta.doctype',
    },
    {
      foreground: '73817d',
      token: 'meta.sgml.html meta.doctype entity',
    },
    {
      foreground: '73817d',
      token: 'meta.sgml.html meta.doctype string',
    },
    {
      foreground: '73817d',
      token: 'meta.xml-processing',
    },
    {
      foreground: '73817d',
      token: 'meta.xml-processing entity',
    },
    {
      foreground: '73817d',
      token: 'meta.xml-processing string',
    },
    {
      foreground: '9effff',
      token: 'meta.tag',
    },
    {
      foreground: '9effff',
      token: 'meta.tag entity',
    },
    {
      foreground: '9effff',
      token: 'meta.selector.css entity.name.tag',
    },
    {
      foreground: 'ffb454',
      token: 'meta.selector.css entity.other.attribute-name.id',
    },
    {
      foreground: '5fe461',
      token: 'meta.selector.css entity.other.attribute-name.class',
    },
    {
      foreground: '9df39f',
      token: 'support.type.property-name.css',
    },
    {
      foreground: 'f6f080',
      token: 'meta.property-group support.constant.property-value.css',
    },
    {
      foreground: 'f6f080',
      token: 'meta.property-value support.constant.property-value.css',
    },
    {
      foreground: 'f6aa11',
      token: 'meta.preprocessor.at-rule keyword.control.at-rule',
    },
    {
      foreground: 'edf080',
      token: 'meta.property-value support.constant.named-color.css',
    },
    {
      foreground: 'edf080',
      token: 'meta.property-value constant',
    },
    {
      foreground: 'eb939a',
      token: 'meta.constructor.argument.css',
    },
    {
      foreground: 'f8f8f8',
      background: '000e1a',
      token: 'meta.diff',
    },
    {
      foreground: 'f8f8f8',
      background: '000e1a',
      token: 'meta.diff.header',
    },
    {
      foreground: 'f8f8f8',
      background: '4c0900',
      token: 'markup.deleted',
    },
    {
      foreground: 'f8f8f8',
      background: '806f00',
      token: 'markup.changed',
    },
    {
      foreground: 'f8f8f8',
      background: '154f00',
      token: 'markup.inserted',
    },
    {
      background: '8fddf630',
      token: 'markup.raw',
    },
    {
      background: '004480',
      token: 'markup.quote',
    },
    {
      background: '130d26',
      token: 'markup.list',
    },
    {
      foreground: 'c1afff',
      fontStyle: 'bold',
      token: 'markup.bold',
    },
    {
      foreground: 'b8ffd9',
      fontStyle: 'italic',
      token: 'markup.italic',
    },
    {
      foreground: 'c8e4fd',
      background: '001221',
      fontStyle: 'bold',
      token: 'markup.heading',
    },
  ],
  colors: {
    'editor.foreground': '#FFFFFF',
    'editor.background': '#002240',
    'editor.selectionBackground': '#B36539BF',
    'editor.lineHighlightBackground': '#00000059',
    'editorCursor.foreground': '#FFFFFF',
    'editorWhitespace.foreground': '#FFFFFF26',
  },
};
