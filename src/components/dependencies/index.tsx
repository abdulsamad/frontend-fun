import { FormEvent, useState } from 'react';
import { useAtom } from 'jotai';
import styled from 'styled-components';

import { projectDependenciesAtom } from '../../state/projectAtoms';
import { PreviewDependencyType } from '../../state/types';

const Panel = styled.details`
  position: relative;

  summary { padding: 5px 8px; border-radius: 3px; color: var(--workbench-muted); cursor: pointer; font-size: 0.75rem; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary:hover { background: var(--workbench-hover); color: var(--workbench-text); }
`;

const Content = styled.div`
  position: absolute;
  z-index: 20;
  inset-block-start: 31px;
  inset-inline-start: 0;
  display: grid;
  gap: 10px;
  inline-size: min(380px, calc(100vw - 24px));
  padding: 12px;
  border: 1px solid var(--workbench-border);
  border-radius: 4px;
  background: var(--workbench-elevated);
  box-shadow: 0 12px 28px rgb(0 0 0 / 35%);
  color: var(--workbench-text);
  font-size: 0.75rem;
`;

const DependencyRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 7px;
  min-inline-size: 0;

  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--font-code); }
  button { border: 0; background: transparent; color: var(--workbench-muted); cursor: pointer; }
  button:hover { color: var(--workbench-text); }
`;

const AddForm = styled.form`
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: 6px;

  input, select { min-inline-size: 0; border: 1px solid var(--workbench-border); background: var(--workbench-editor); color: var(--workbench-text); padding: 5px; }
  button { border: 1px solid var(--workbench-border); background: var(--workbench-hover); color: var(--workbench-text); cursor: pointer; }
`;

const presets = [
  { label: 'React', type: 'script' as const, url: 'https://unpkg.com/react@18/umd/react.development.js' },
  { label: 'React DOM', type: 'script' as const, url: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js' },
  { label: 'Vue', type: 'script' as const, url: 'https://unpkg.com/vue@3/dist/vue.global.js' },
  { label: 'Alpine', type: 'script' as const, url: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js' },
  { label: 'Tailwind', type: 'script' as const, url: 'https://cdn.tailwindcss.com' },
];

const Dependencies = () => {
  const [dependencies, setDependencies] = useAtom(projectDependenciesAtom);
  const [type, setType] = useState<PreviewDependencyType>('script');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const addDependency = (event: FormEvent) => {
    event.preventDefault();
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS URL.');
      if (dependencies.some((dependency) => dependency.url === parsed.href)) throw new Error('That URL is already added.');
      if (dependencies.length >= 20) throw new Error('You can add up to 20 dependencies.');
      setDependencies([...dependencies, { id: crypto.randomUUID(), type, url: parsed.href, enabled: true }]);
      setUrl('');
      setError('');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Enter a valid HTTPS URL.');
    }
  };

  const addPreset = (preset: typeof presets[number]) => {
    if (dependencies.some((dependency) => dependency.url === preset.url) || dependencies.length >= 20) return;
    setDependencies([...dependencies, { id: crypto.randomUUID(), type: preset.type, url: preset.url, enabled: true }]);
  };

  const move = (index: number, offset: number) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= dependencies.length) return;
    const next = [...dependencies];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setDependencies(next);
  };

  return (
    <Panel>
      <summary>Dependencies ({dependencies.filter(({ enabled }) => enabled).length})</summary>
      <Content>
        <strong>CDN dependencies</strong>
        <small>HTTPS resources load before your project code. Runtime network requests stay blocked.</small>
        {dependencies.map((dependency, index) => (
          <DependencyRow key={dependency.id}>
            <input type='checkbox' checked={dependency.enabled} aria-label={`Enable ${dependency.url}`} onChange={() => setDependencies(dependencies.map((current) => current.id === dependency.id ? { ...current, enabled: !current.enabled } : current))} />
            <span title={dependency.url}>{dependency.type}: {dependency.url}</span>
            <span>
              <button type='button' aria-label='Move dependency up' onClick={() => move(index, -1)}>↑</button>
              <button type='button' aria-label='Move dependency down' onClick={() => move(index, 1)}>↓</button>
              <button type='button' aria-label='Remove dependency' onClick={() => setDependencies(dependencies.filter(({ id }) => id !== dependency.id))}>×</button>
            </span>
          </DependencyRow>
        ))}
        <AddForm onSubmit={addDependency}>
          <select aria-label='Dependency type' value={type} onChange={(event) => setType(event.target.value as PreviewDependencyType)}>
            <option value='script'>Script</option><option value='module'>Module</option><option value='style'>Style</option>
          </select>
          <input aria-label='Dependency URL' value={url} onChange={(event) => setUrl(event.target.value)} placeholder='https://cdn.example.com/library.js' />
          <button type='submit'>Add</button>
        </AddForm>
        {error && <span role='alert'>{error}</span>}
        <div>Presets: {presets.map((preset) => <button key={preset.label} type='button' onClick={() => addPreset(preset)}>{preset.label}</button>)}</div>
      </Content>
    </Panel>
  );
};

export default Dependencies;
