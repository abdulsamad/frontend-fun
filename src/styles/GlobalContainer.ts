import styled from 'styled-components';

const GlobalContainer = styled.main`
  block-size: 100%;
  inline-size: 100dvw;
  min-inline-size: 0;
  overflow: hidden;
  background: var(--workbench-canvas);

  .split-view-view,
  .split-view-view > div {
    min-inline-size: 0;
    min-block-size: 0;
  }
`;

export const WorkbenchFrame = styled.div`
  display: grid;
  grid-template-rows: 36px minmax(0, 1fr);
  block-size: 100dvh;
  inline-size: 100dvw;
  min-inline-size: 0;
  overflow: hidden;
  background: var(--workbench-canvas);
`;

export const WorkbenchTopBar = styled.header`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-inline: 8px;
  border-block-end: 1px solid var(--workbench-border);
  background: var(--workbench-elevated);
`;

export const TopBarBrand = styled.span`
  margin-inline-end: 8px;
  color: var(--workbench-text);
  font-size: 0.75rem;
  font-weight: 600;
`;

export const TopBarMenu = styled.details`
  position: relative;

  summary {
    padding: 5px 8px;
    border-radius: 3px;
    color: var(--workbench-muted);
    cursor: pointer;
    font-size: 0.75rem;
    list-style: none;
  }

  summary::-webkit-details-marker { display: none; }
  summary:hover { background: var(--workbench-hover); color: var(--workbench-text); }
`;

export const TopBarMenuPanel = styled.div`
  position: absolute;
  z-index: 10;
  inset-block-start: 31px;
  inset-inline-start: 0;
  display: grid;
  gap: 10px;
  inline-size: 220px;
  padding: 12px;
  border: 1px solid var(--workbench-border);
  border-radius: 4px;
  background: var(--workbench-elevated);
  box-shadow: 0 12px 28px rgb(0 0 0 / 35%);

  label {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    color: var(--workbench-text);
    font-size: 0.75rem;
  }

  select { max-inline-size: 120px; }
`;

export const CompactWorkbench = styled.div`
  display: grid;
  grid-template-rows: 42px minmax(0, 1fr);
  block-size: 100%;
  min-block-size: 0;
`;

export const CompactViewTabs = styled.nav`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block-end: 1px solid var(--workbench-border);
  background: var(--workbench-elevated);
`;

export const CompactViewButton = styled.button<{ $active: boolean }>`
  min-inline-size: 0;
  border: 0;
  border-block-end: 2px solid ${({ $active }) => ($active ? 'var(--workbench-focus)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--workbench-editor)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.6875rem;

  &:hover {
    color: var(--workbench-text);
    background: var(--workbench-hover);
  }
`;

export const CompactStage = styled.div`
  position: relative;
  min-block-size: 0;
`;

export const CompactSurface = styled.section<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  display: ${({ $active }) => ($active ? 'block' : 'none')};
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
`;

export const PaneLoading = styled.div`
  display: grid;
  place-items: center;
  block-size: 100%;
  min-block-size: 0;
  background: var(--workbench-editor);
  color: var(--workbench-muted);
  font-size: 0.75rem;
`;

export default GlobalContainer;
