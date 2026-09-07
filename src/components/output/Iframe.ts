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

export const DevtoolsPanel = styled.section<{ $collapsed: boolean; $height: number }>`
  display: flex;
  flex: ${({ $collapsed, $height }) => ($collapsed ? '0 0 34px' : `0 0 ${$height}px`)};
  flex-direction: column;
  min-block-size: ${({ $collapsed }) => ($collapsed ? '34px' : '118px')};
  border-block-start: 1px solid var(--workbench-border);
  background: var(--workbench-editor);
  color: var(--workbench-text);
`;

export const DevtoolsResizeHandle = styled.div<{ $collapsed: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
  flex: 0 0 7px;
  cursor: ns-resize;
  touch-action: none;
  background: transparent;

  &::after {
    content: '';
    display: block;
    inline-size: 42px;
    block-size: 2px;
    margin: 2px auto 0;
    border-radius: 2px;
    background: var(--workbench-border);
  }

  &:hover::after, &:focus-visible::after { background: var(--workbench-focus); }
  &:focus-visible { outline: 1px solid var(--workbench-focus); outline-offset: -1px; }
`;

export const DevtoolsHeader = styled.header`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-block-size: 34px;
  border-block-end: 1px solid var(--workbench-border);

  > span { display: flex; align-items: stretch; }
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

export const DevtoolsToggle = styled.button<{ $collapsed: boolean }>`
  display: grid;
  place-items: center;
  inline-size: 28px;
  margin: 3px 6px 3px 0;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--workbench-muted);
  cursor: pointer;

  svg { transform: rotate(${({ $collapsed }) => ($collapsed ? '180deg' : '0deg')}); }
  &:hover { background: var(--workbench-hover); color: var(--workbench-text); }
  &:focus-visible { outline: 1px solid var(--workbench-focus); outline-offset: -2px; }
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
  > span { white-space: pre-wrap; overflow-wrap: anywhere; }
`;

export const ConsoleValues = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 7px;
  min-inline-size: 0;
`;

export const ConsoleJson = styled.details`
  max-inline-size: 100%;

  summary {
    color: #9cdcfe;
    cursor: pointer;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

`;

export const ConsoleJsonChildren = styled.div`
  display: grid;
  gap: 2px;
  margin: 4px 0 2px 9px;
  padding-inline-start: 9px;
  border-inline-start: 2px solid var(--workbench-border);
`;

export const ConsoleJsonLeaf = styled.div`
  display: flex;
  gap: 6px;
  min-inline-size: 0;
  line-height: 1.45;

  > span:first-child { color: #9cdcfe; }
  > span:last-child { overflow-wrap: anywhere; }
  &[data-type='string'] > span:last-child { color: #ce9178; }
  &[data-type='number'] > span:last-child,
  &[data-type='boolean'] > span:last-child { color: #b5cea8; }
  &[data-type='null'] > span:last-child { color: var(--workbench-muted); }
`;

export const ConsoleJsonMeta = styled.span`
  color: var(--workbench-muted);
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
