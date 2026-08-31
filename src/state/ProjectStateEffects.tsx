import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import localforage from 'localforage';

import { projectDependenciesAtom, projectFilesAtom, projectHydratedAtom, replaceProjectFilesAtom } from './projectAtoms';
import { validateDependencies } from './validation';
import { workbenchSettingsAtom } from './settings';

const ProjectStateEffects = () => {
  const files = useAtomValue(projectFilesAtom);
  const dependencies = useAtomValue(projectDependenciesAtom);
  const hydrated = useAtomValue(projectHydratedAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const setDependencies = useSetAtom(projectDependenciesAtom);
  const setHydrated = useSetAtom(projectHydratedAtom);
  const autoSave = useAtomValue(workbenchSettingsAtom).autoSave;

  useEffect(() => {
    let active = true;
    Promise.all([localforage.getItem<unknown>('filesData'), localforage.getItem<unknown>('dependencies')])
      .then(([savedFiles, savedDependencies]) => {
        if (active && savedFiles) replaceFiles(savedFiles);
        if (active && savedDependencies) setDependencies(validateDependencies(savedDependencies) || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, [replaceFiles, setDependencies, setHydrated]);

  useEffect(() => {
    if (!hydrated || !autoSave) return;
    Promise.all([
      localforage.setItem('filesData', files),
      localforage.setItem('dependencies', dependencies),
    ]).catch(() => undefined);
  }, [files, dependencies, hydrated, autoSave]);

  return null;
};

export default ProjectStateEffects;
