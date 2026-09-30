import styled from 'styled-components';

export const ExplorerHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-block-size: 35px;
  padding-inline: 12px 6px;
  border-block-end: 1px solid var(--workbench-border);

  h2 {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
`;

export const NewFileButton = styled.button`
  min-inline-size: 76px;
  min-block-size: 28px;
  padding-inline: 10px;
  border: 1px solid var(--workbench-border);
  border-radius: 4px;
  background: var(--workbench-editor);
  color: var(--workbench-text);
  cursor: pointer;
  font-size: 0.75rem;

  &:hover:not(:disabled) {
    background: var(--workbench-hover);
  }

  &:disabled {
    color: var(--workbench-muted);
    cursor: progress;
  }
`;

export const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  min-block-size: 24px;
  padding-inline: 5px;
  background: var(--workbench-elevated);
  color: var(--workbench-text);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  user-select: none;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const FileList = styled.ul`
  flex: 1;
  min-block-size: 0;
  margin: 0;
  padding: 4px 0;
  overflow: auto;
  list-style: none;
`;

export const FileRow = styled.li<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  min-block-size: 24px;
  padding-inline-start: 13px;
  background: ${({ $active }) => ($active ? 'var(--workbench-selected)' : 'transparent')};

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--workbench-selected)' : 'var(--workbench-hover)')};
  }

  &:not(:hover):not(:focus-within) > div {
    opacity: 0;
  }

  @media (max-width: 959px) {
    > div { opacity: 1 !important; }
  }
`;

export const FileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  min-inline-size: 0;
  min-block-size: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: start;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const FileActions = styled.div`
  display: flex;
  align-items: center;
  padding-inline-end: 3px;
`;

export const FileActionButton = styled.button`
  display: grid;
  place-items: center;
  min-inline-size: 24px;
  min-block-size: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--workbench-muted);
  cursor: pointer;

  &:hover {
    background: #3c3c3c;
    color: var(--workbench-text);
  }
`;

export const EmptyState = styled.div`
  display: grid;
  gap: 8px;
  margin: 8px;
  padding: 12px;
  border: 1px dashed var(--workbench-border);
  border-radius: 4px;
  color: var(--workbench-muted);
  font-size: 0.75rem;

  p { margin: 0; }

  button {
    justify-self: start;
    min-block-size: 28px;
    padding-inline: 10px;
    border: 1px solid var(--workbench-border);
    border-radius: 3px;
    background: var(--workbench-hover);
    color: var(--workbench-text);
    cursor: pointer;
  }
`;

export const WorkbenchDialog = styled.dialog`
  inline-size: min(430px, calc(100vw - 32px));
  padding: 0;
  border: 1px solid #454545;
  border-radius: 3px;
  background: var(--workbench-elevated);
  color: var(--workbench-text);
  box-shadow: 0 16px 48px rgb(0 0 0 / 55%);
  opacity: 0;
  transform: scale(0.96);
  transform-origin: center;
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out),
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;

  &[open] {
    opacity: 1;
    transform: scale(1);
  }

  @starting-style {
    &[open] {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  &::backdrop {
    background: rgb(0 0 0 / 55%);
    opacity: 0;
    transition:
      opacity 250ms var(--ease-out),
      display 250ms allow-discrete,
      overlay 250ms allow-discrete;
  }

  &[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    &[open]::backdrop {
      opacity: 0;
    }
  }

  form {
    display: grid;
    gap: 14px;
    padding: 20px;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1rem;
    font-weight: 500;
  }

  p {
    color: var(--workbench-muted);
  }

  label {
    display: grid;
    gap: 6px;
  }

  input {
    min-block-size: 30px;
    padding-inline: 8px;
    border: 1px solid #3c3c3c;
    border-radius: 2px;
    background: var(--workbench-editor);
    color: var(--workbench-text);

    &:focus {
      border-color: var(--workbench-focus);
      outline: 1px solid var(--workbench-focus);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition-duration: 160ms !important;

    &[open] {
      transform: none;
    }

    &::backdrop {
      transition-duration: 160ms !important;
    }

    @starting-style {
      &[open] {
        opacity: 0;
        transform: none;
      }
    }
  }
`;

export const DialogError = styled.p`
  color: var(--workbench-danger) !important;
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const DialogButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  min-block-size: 30px;
  padding-inline: 14px;
  border: 1px solid ${({ $primary, $danger }) => ($primary || $danger ? 'transparent' : '#454545')};
  border-radius: 2px;
  background: ${({ $primary, $danger }) => ($danger ? '#a1260d' : $primary ? 'var(--workbench-focus)' : '#313131')};
  color: #fff;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.12);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
