import styled from 'styled-components';

const PreviewPane = styled.section`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  border-inline-start: 1px solid var(--workbench-border);
  background: #fff;
`;

export default PreviewPane;
