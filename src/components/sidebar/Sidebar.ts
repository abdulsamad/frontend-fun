import styled from 'styled-components';

const Sidebar = styled.aside`
  display: flex;
  block-size: 100%;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  border-inline-end: 1px solid var(--workbench-border);
  background: var(--workbench-canvas);
  color: var(--workbench-text);
`;

export const ExplorerPane = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
  min-block-size: 0;
  background: var(--workbench-canvas);
`;

export default Sidebar;
