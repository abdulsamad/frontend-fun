import styled from 'styled-components';

export const PreviewToolbar = styled.header`
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-block-size: 42px;
  padding-inline: 8px;
  border-block-end: 1px solid var(--workbench-border);
  background: var(--workbench-elevated);
  color: var(--workbench-text);

  @media (max-width: 620px) {
    display: flex;
    justify-content: flex-end;
  }
`;

export const PreviewLabel = styled.span`
  padding-inline: 2px;
  color: var(--workbench-muted);
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  @media (max-width: 620px) {
    display: none;
  }
`;

export const PreviewAddressBar = styled.div`
  display: flex;
  align-items: center;
  min-inline-size: 0;
  min-block-size: 28px;
  padding-inline: 10px;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  background: var(--workbench-editor);
  color: var(--workbench-text);
  font-family: var(--font-code);
  font-size: 0.75rem;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 620px) {
    display: none;
  }
`;

export const PreviewStatus = styled.span<{ $status: 'updating' | 'ready' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--workbench-muted);
  font-size: 0.6875rem;
  text-transform: capitalize;

  &::before {
    content: '';
    inline-size: 7px;
    block-size: 7px;
    border-radius: 50%;
    background: ${({ $status }) => ($status === 'error' ? 'var(--workbench-danger)' : $status === 'ready' ? 'var(--workbench-success)' : '#cca700')};
  }

  @media (max-width: 520px) {
    span {
      display: none;
    }
  }
`;

export const ReloadButton = styled.button`
  display: grid;
  place-items: center;
  min-inline-size: 28px;
  min-block-size: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--workbench-muted);
  cursor: pointer;

  &:hover {
    background: var(--workbench-hover);
    color: var(--workbench-text);
  }
`;

export const PreviewControlGroup = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  background: var(--workbench-editor);
`;

export const PreviewControlButton = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  inline-size: 26px;
  block-size: 24px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: ${({ $active }) => ($active ? 'var(--workbench-selected)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};
  cursor: pointer;

  &:hover {
    background: var(--workbench-hover);
    color: var(--workbench-text);
  }

  &:focus-visible {
    outline: 1px solid var(--workbench-focus);
    outline-offset: -1px;
  }
`;

export const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;
