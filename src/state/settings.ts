import { atom } from 'jotai';

export type WorkbenchTheme = 'one-dark' | 'vscode-dark' | 'high-contrast';

export interface WorkbenchSettings {
  theme: WorkbenchTheme;
  wordWrap: boolean;
  fontSize: number;
  showTerminal: boolean;
  autoSave: boolean;
}

export const defaultWorkbenchSettings: WorkbenchSettings = {
  theme: 'one-dark',
  wordWrap: false,
  fontSize: 14,
  showTerminal: true,
  autoSave: true,
};

export const workbenchSettingsAtom = atom<WorkbenchSettings>(defaultWorkbenchSettings);
