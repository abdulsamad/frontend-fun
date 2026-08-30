import styled from 'styled-components';

export const ActivityBar = styled.nav`
  display: flex;
  flex: 0 0 48px;
  flex-direction: column;
  align-items: stretch;
  border-inline-end: 1px solid var(--workbench-border);
  background: var(--workbench-canvas);
`;

export const ActivityButton = styled.button<{ $active?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  min-block-size: 48px;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: 2px;
    background: ${({ $active }) => ($active ? 'var(--workbench-focus)' : 'transparent')};
  }

  &:hover {
    color: var(--workbench-text);
  }
`;

export const UserId = styled.code`
  display: inline-block;
  margin-block-start: 6px;
  padding: 3px 5px;
  border-radius: 2px;
  background: var(--workbench-editor);
  color: var(--workbench-success);
  font-family: var(--font-code);
  user-select: all;
`;
