import styled from 'styled-components';

const Terminal = styled.section`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  background: var(--workbench-editor);
`;

export const TerminalHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-block-size: 35px;
  padding-inline: 12px 6px;
  border-block-end: 1px solid var(--workbench-border);
  background: var(--workbench-editor);

  h2 {
    align-self: stretch;
    display: flex;
    align-items: center;
    margin: 0;
    border-block-end: 1px solid var(--workbench-text);
    font-size: 0.6875rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
`;

export const TerminalAction = styled.button`
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

export const TerminalViewport = styled.div`
  flex: 1;
  min-block-size: 0;
  padding: 8px 10px;
  overflow: hidden;

  .terminal-container {
    block-size: 100%;
    inline-size: 100%;
  }

  .xterm-viewport {
    background: transparent !important;
  }
`;

export default Terminal;
