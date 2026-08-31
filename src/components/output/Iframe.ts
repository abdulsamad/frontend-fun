import styled from 'styled-components';

export const PreviewFrame = styled.iframe`
  display: block;
  flex: 1;
  block-size: auto;
  inline-size: 100%;
  min-block-size: 0;
  border: 0;
  background: #fff;
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
