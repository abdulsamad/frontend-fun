import { FC } from 'react';

export type IconName =
  | 'chevron-down'
  | 'close'
  | 'copy'
  | 'delete'
  | 'explorer'
  | 'file-add'
  | 'folder'
  | 'open'
  | 'refresh'
  | 'save'
  | 'terminal'
  | 'word-wrap';

const paths: Record<IconName, string> = {
  'chevron-down': 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',
  close: 'M18.3 5.71 16.89 4.29 12 9.17 7.11 4.29 5.7 5.71 10.59 10.59 5.7 15.48 7.11 16.89 12 12 16.89 16.89 18.3 15.48 13.41 10.59z',
  copy: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z',
  delete: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.5-8h1.5v7H9.5v-7zm3.5 0h1.5v7H13v-7zM15.5 4l-1-1h-5l-1 1H5v2h14V4z',
  explorer: 'M4 2h10l6 6v14H4V2zm2 2v16h12V9h-5V4H6zm9 1.5V7h1.5L15 5.5zM2 6h1v17h13v1H2V6z',
  'file-add': 'M13 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h9v-2H5V4h7v5h5v3h2V8l-6-6zm5 12v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z',
  folder: 'M10 4H2v16h20V6H12l-2-2zm10 14H4V8h16v10z',
  open: 'M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h15.5a2 2 0 0 0 1.94-1.51L23.5 10A2 2 0 0 0 21.56 7.5H12L10 4zm9.5 14H4l2.13-8.5h15.43L19.5 18z',
  refresh: 'M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3l-3.35 3.35z',
  save: 'M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z',
  terminal: 'M4 5.5 9.5 11 4 16.5 5.5 18l7-7-7-7L4 5.5zM12 18h8v2h-8v-2z',
  'word-wrap': 'M3 5h15v2H3V5zm0 4h12a4 4 0 0 1 0 8h-2v2l-3-3 3-3v2h2a2 2 0 1 0 0-4H3V9zm0 6h5v2H3v-2z',
};

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon: FC<IconProps> = ({ name, size = 16 }) => (
  <svg aria-hidden='true' focusable='false' width={size} height={size} viewBox='0 0 24 24'>
    <path fill='currentColor' d={paths[name]} />
  </svg>
);

export default Icon;
