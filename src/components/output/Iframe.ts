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
