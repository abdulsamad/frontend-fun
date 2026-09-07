import styled from 'styled-components';

export const PreviewViewport = styled.div<{ $constrained: boolean }>`
  display: flex;
  flex: 1;
  justify-content: center;
  min-block-size: 0;
  overflow: auto;
  padding: ${({ $constrained }) => ($constrained ? '14px' : '0')};
  background: ${({ $constrained }) => ($constrained ? '#252526' : '#fff')};
`;

export const PreviewFrame = styled.iframe<{ $deviceWidth?: number }>`
  display: block;
  flex: ${({ $deviceWidth }) => ($deviceWidth ? '0 0 auto' : '1')};
  block-size: 100%;
  inline-size: ${({ $deviceWidth }) => ($deviceWidth ? `${$deviceWidth}px` : '100%')};
  min-block-size: 0;
  border: ${({ $deviceWidth }) => ($deviceWidth ? '1px solid #4b4b4b' : '0')};
  background: #fff;
  box-shadow: ${({ $deviceWidth }) => ($deviceWidth ? '0 8px 24px rgba(0, 0, 0, 0.28)' : 'none')};
`;

export const DevtoolsPanel = styled.section`
  display: flex;
  flex: 0 0 min(32%, 190px);
  flex-direction: column;
  min-block-size: 118px;
  border-block-start: 1px solid var(--workbench-border);
  background: var(--workbench-editor);
  color: var(--workbench-text);
`;

export const DevtoolsHeader = styled.header`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-block-size: 34px;
  border-block-end: 1px solid var(--workbench-border);
`;

export const DevtoolsTabs = styled.div`
  display: flex;
  align-items: stretch;
`;

export const DevtoolsTab = styled.button<{ $active: boolean }>`
  position: relative;
  padding-inline: 12px;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'var(--workbench-muted)')};
  cursor: pointer;
  font-size: 0.6875rem;

  &::after {
    content: '';
    position: absolute;
    inset-inline: 10px;
    inset-block-end: 0;
    block-size: 1px;
    background: ${({ $active }) => ($active ? 'var(--workbench-text)' : 'transparent')};
  }

  &:hover { color: var(--workbench-text); }
  &:focus-visible { outline: 1px solid var(--workbench-focus); outline-offset: -2px; }
`;

export const DevtoolsClear = styled.button`
  margin: 3px 6px;
  padding-inline: 8px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--workbench-muted);
  cursor: pointer;
  font-size: 0.6875rem;

  &:hover { background: var(--workbench-hover); color: var(--workbench-text); }
`;

export const DevtoolsContent = styled.div`
  flex: 1;
  min-block-size: 0;
  overflow: auto;
  font-family: var(--font-code);
  font-size: 0.6875rem;

  ul { margin: 0; padding: 0; list-style: none; }
`;

export const DevtoolsEmpty = styled.p`
  margin: 0;
  padding: 12px;
  color: var(--workbench-muted);
  font-family: var(--font-interface);
`;

export const ConsoleRow = styled.li<{ $level: 'log' | 'info' | 'warn' | 'error' | 'debug' }>`
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 8px;
  padding: 5px 10px;
  border-block-end: 1px solid color-mix(in srgb, var(--workbench-border) 55%, transparent);
  color: ${({ $level }) => ($level === 'error' ? '#f48771' : $level === 'warn' ? '#cca700' : 'var(--workbench-text)')};

  time { color: var(--workbench-muted); }
  span { white-space: pre-wrap; overflow-wrap: anywhere; }
`;

export const NetworkRow = styled.li`
  display: grid;
  grid-template-columns: 52px minmax(100px, 1fr) 48px 52px;
  gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-block-end: 1px solid color-mix(in srgb, var(--workbench-border) 55%, transparent);

  code { overflow: hidden; color: var(--workbench-text); text-overflow: ellipsis; white-space: nowrap; }
  span { color: var(--workbench-muted); }
  [data-state='success'] { color: var(--workbench-success); }
  [data-state='error'] { color: #f48771; }

  @media (max-width: 520px) {
    grid-template-columns: 44px minmax(80px, 1fr) 44px;
    span:last-child { display: none; }
  }
`;

export const ErrorRow = styled.li`
  padding: 6px 10px;
  border-block-end: 1px solid color-mix(in srgb, var(--workbench-border) 55%, transparent);
  color: #f8d7da;
  overflow-wrap: anywhere;

  strong { margin-inline-end: 7px; color: #f48771; }
  small { display: block; margin-block-start: 3px; color: var(--workbench-muted); }
`;

export const PreviewErrorBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-block-end: 1px solid #6e1f1f;
  background: #3c1f1e;
  color: #f8d7da;
  font-family: var(--font-code);
  font-size: 0.75rem;

  strong {
    color: #fff;
    font-family: var(--font-interface);
    white-space: nowrap;
  }
`;

export const PreviewDiagnostics = styled.section`
  max-block-size: 150px;
  overflow: auto;
  padding: 8px 12px;
  border-block-end: 1px solid var(--workbench-border);
  background: #241b1b;
  color: #f8d7da;
  font-family: var(--font-code);
  font-size: 0.6875rem;

  h2 { margin: 0 0 6px; font-family: var(--font-interface); font-size: 0.75rem; }
  ul { display: grid; gap: 5px; margin: 0; padding: 0; list-style: none; }
  li { overflow-wrap: anywhere; }
  strong { color: #fff; text-transform: uppercase; }
`;

export const ClearDiagnosticsButton = styled.button`
  float: right;
  border: 1px solid var(--workbench-border);
  border-radius: 3px;
  background: transparent;
  color: var(--workbench-muted);
  cursor: pointer;
  font-size: 0.6875rem;

  &:hover { color: var(--workbench-text); }
`;
