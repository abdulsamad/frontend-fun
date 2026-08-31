import { createGlobalStyle } from 'styled-components';

import FiraCode from '../assets/FiraCode.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Fira Code';
    src: local('Fira Code'), url(${FiraCode}) format('truetype');
    font-display: swap;
  }

  :root {
    color-scheme: dark;
    --workbench-canvas: #181818;
    --workbench-editor: #1f1f1f;
    --workbench-elevated: #252526;
    --workbench-hover: #2a2d2e;
    --workbench-selected: #37373d;
    --workbench-border: #2b2b2b;
    --workbench-text: #cccccc;
    --workbench-muted: #9d9d9d;
    --workbench-focus: #0078d4;
    --workbench-danger: #f14c4c;
    --workbench-success: #4ec9b0;
    --font-interface: 'Segoe WPC', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-code: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  }

  [data-theme='one-dark'] {
    --workbench-canvas: #21252b;
    --workbench-editor: #282c34;
    --workbench-elevated: #21252b;
    --workbench-hover: #323842;
    --workbench-selected: #3e4451;
    --workbench-border: #181a1f;
    --workbench-text: #abb2bf;
    --workbench-muted: #7f848e;
    --workbench-focus: #61afef;
    --workbench-danger: #e06c75;
    --workbench-success: #98c379;
  }

  [data-theme='high-contrast'] {
    --workbench-canvas: #000;
    --workbench-editor: #050505;
    --workbench-elevated: #111;
    --workbench-hover: #333;
    --workbench-selected: #444;
    --workbench-border: #777;
    --workbench-text: #fff;
    --workbench-muted: #ddd;
    --workbench-focus: #fff;
    --workbench-danger: #ff8080;
    --workbench-success: #7fff7f;
  }

  html,
  body,
  #root {
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
  }

  body {
    min-inline-size: 320px;
    overflow: hidden;
    background: var(--workbench-canvas);
    color: var(--workbench-text);
    font-family: var(--font-interface);
    font-size: 0.8125rem;
    line-height: 1.35;
  }

  button,
  input {
    font: inherit;
  }

  button {
    color: inherit;
  }

  :where(button, input, [role='tab']):focus-visible {
    outline: 1px solid var(--workbench-focus);
    outline-offset: -1px;
  }

  ::selection {
    background: #264f78;
  }

  .visually-hidden:where(:not(:focus-within, :active)) {
    position: absolute !important;
    inline-size: 1px !important;
    block-size: 1px !important;
    margin: -1px !important;
    padding: 0 !important;
    overflow: hidden !important;
    border: 0 !important;
    clip-path: inset(50%) !important;
    white-space: nowrap !important;
  }

  * {
    scrollbar-color: #5a5a5a transparent;
    scrollbar-width: thin;
  }

  .allotment-module_splitView__L-yRc {
    background: var(--workbench-canvas);
  }

  .Toastify__toast-container {
    width: min(360px, calc(100vw - 24px));
  }

  .Toastify__toast {
    min-height: 44px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--workbench-border);
    border-radius: 2px;
    background: var(--workbench-elevated);
    color: var(--workbench-text);
    box-shadow: 0 8px 24px rgb(0 0 0 / 35%);
    font-family: var(--font-interface);
    font-size: 0.8125rem;
  }

  .Toastify__toast .Toastify__toast-icon {
    display: grid;
    flex: 0 0 18px;
    align-self: center;
    place-items: center;
    width: 18px;
    height: 18px;
    margin-inline-end: 0;
  }

  .Toastify__toast .Toastify__toast-icon > svg,
  .workbench-toast-content > svg {
    display: block;
    width: 18px;
    height: 18px;
  }

  .workbench-toast-content {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
  }

  .Toastify__close-button {
    color: var(--workbench-text);
  }

  .workbench-error {
    min-block-size: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--workbench-canvas);
    color: var(--workbench-text);
  }

  @media (forced-colors: active) {
    :where(button, input, [role='tab']):focus-visible {
      outline: 2px solid Highlight;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

export default GlobalStyle;
