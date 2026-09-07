import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import localforage from 'localforage';

import { projectDependenciesAtom, projectFilesAtom, projectHydratedAtom, projectNameAtom, renameProjectAtom, replaceProjectFilesAtom } from './projectAtoms';
import { isValidProjectName, validateDependencies } from './validation';
import { workbenchSettingsAtom } from './settings';

const ProjectStateEffects = () => {
  const files = useAtomValue(projectFilesAtom);
  const dependencies = useAtomValue(projectDependenciesAtom);
  const projectName = useAtomValue(projectNameAtom);
  const hydrated = useAtomValue(projectHydratedAtom);
  const replaceFiles = useSetAtom(replaceProjectFilesAtom);
  const setDependencies = useSetAtom(projectDependenciesAtom);
  const renameProject = useSetAtom(renameProjectAtom);
  const setHydrated = useSetAtom(projectHydratedAtom);
  const autoSave = useAtomValue(workbenchSettingsAtom).autoSave;

  useEffect(() => {
    let active = true;
    Promise.all([localforage.getItem<unknown>('filesData'), localforage.getItem<unknown>('dependencies'), localforage.getItem<unknown>('projectName')])
      .then(([savedFiles, savedDependencies, savedProjectName]) => {
        if (active && savedFiles) replaceFiles(savedFiles);
        if (active && savedDependencies) setDependencies(validateDependencies(savedDependencies) || []);
        if (active && isValidProjectName(savedProjectName)) renameProject(savedProjectName);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, [renameProject, replaceFiles, setDependencies, setHydrated]);

  useEffect(() => {
    if (!hydrated || !autoSave) return;
    Promise.all([
      localforage.setItem('filesData', files),
      localforage.setItem('dependencies', dependencies),
      localforage.setItem('projectName', projectName),
    ]).catch(() => undefined);
  }, [files, dependencies, projectName, hydrated, autoSave]);

  return null;
};

export default ProjectStateEffects;
