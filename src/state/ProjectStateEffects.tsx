import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import localforage from 'localforage';

import { projectFilesAtom, projectHydratedAtom, replaceProjectFilesAtom } from './projectAtoms';
import { workbenchSettingsAtom } from './settings';

const ProjectStateEffects = () => {
  const files = useAtomValue(projectFilesAtom);
  const hydrated = useAtomValue(projectHydratedAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const setHydrated = useSetAtom(projectHydratedAtom);
  const autoSave = useAtomValue(workbenchSettingsAtom).autoSave;

  useEffect(() => {
    let active = true;
    localforage.getItem<unknown>('filesData')
      .then((savedFiles) => {
        if (active && savedFiles) replaceFiles(savedFiles);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, [replaceFiles, setHydrated]);

  useEffect(() => {
    if (!hydrated || !autoSave) return;
    localforage.setItem('filesData', files).catch(() => undefined);
  }, [files, hydrated, autoSave]);

  return null;
};

export default ProjectStateEffects;
