import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import localforage from 'localforage';

import { projectFilesAtom, projectHydratedAtom, replaceProjectFilesAtom } from './projectAtoms';

const ProjectStateEffects = () => {
  const files = useAtomValue(projectFilesAtom);
  const hydrated = useAtomValue(projectHydratedAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const setHydrated = useSetAtom(projectHydratedAtom);

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
    if (!hydrated) return;
    localforage.setItem('filesData', files).catch(() => undefined);
  }, [files, hydrated]);

  return null;
};

export default ProjectStateEffects;
