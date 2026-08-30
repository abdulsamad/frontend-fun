import styled from 'styled-components';

export const EditorTabs = styled.nav`
  display: flex;
  min-block-size: 35px;
  overflow-x: auto;
  overflow-y: hidden;
  border-block-end: 1px solid var(--workbench-border);
  background: var(--workbench-canvas);
`;

export const TabList = styled.div`
  display: flex;
  min-inline-size: min-content;
`;

export const Tab = styled.div<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px;
  align-items: center;
  min-inline-size: 118px;
  max-inline-size: 220px;
  border-inline-end: 1px solid var(--workbench-border);
  border-block-start: 1px solid ${({ $active }) => ($active ? 'var(--workbench-focus)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--workbench-editor)' : 'var(--workbench-canvas)')};
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--workbench-editor)' : 'var(--workbench-hover)')};
  }
`;

export const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  min-inline-size: 0;
  block-size: 34px;
  padding-inline: 10px 4px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CloseButton = styled.button`
  display: grid;
  place-items: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #3c3c3c;
    color: #fff;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

export const EditorActions = styled.div`
  position: sticky;
  inset-inline-end: 0;
  display: flex;
  align-items: center;
  margin-inline-start: auto;
  padding-inline: 4px;
  border-inline-start: 1px solid var(--workbench-border);
  background: var(--workbench-canvas);
`;

export const ActionButton = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  min-inline-size: 28px;
  min-block-size: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--workbench-selected)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};
  cursor: pointer;

  &:hover {
    background: var(--workbench-hover);
    color: var(--workbench-text);
  }
`;
