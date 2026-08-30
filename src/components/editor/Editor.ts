import styled from 'styled-components';

const EditorGroup = styled.section`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  background: var(--workbench-editor);
`;

export const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  min-block-size: 24px;
  padding-inline: 14px;
  border-block-end: 1px solid var(--workbench-border);
  color: var(--workbench-muted);
  font-size: 0.75rem;
  user-select: none;

  span + span::before {
    content: '›';
    padding-inline: 7px;
    color: #666;
  }
`;

export const EditorSurface = styled.div`
  flex: 1;
  min-inline-size: 0;
  min-block-size: 0;
`;

export const StatusBar = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-block-size: 22px;
  padding-inline: 8px;
  border-block-start: 1px solid var(--workbench-border);
  background: var(--workbench-canvas);
  color: var(--workbench-text);
  font-size: 0.6875rem;
  user-select: none;
`;

export const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span:first-child::before {
    content: '';
    display: inline-block;
    inline-size: 7px;
    block-size: 7px;
    margin-inline-end: 6px;
    border-radius: 50%;
    background: var(--workbench-success);
  }
`;

export default EditorGroup;
