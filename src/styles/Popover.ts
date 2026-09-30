import styled from 'styled-components';

export const PopoverDetails = styled.details`
  position: relative;

  &::details-content {
    overflow: visible;
    transition: content-visibility 160ms allow-discrete;
  }

  @media (prefers-reduced-motion: reduce) {
    &::details-content {
      transition-duration: 120ms !important;
    }
  }
`;

export const PopoverPanel = styled.div<{ $origin: 'top left' | 'top right' }>`
  opacity: 0;
  pointer-events: none;
  transform: scale(0.97);
  transform-origin: ${({ $origin }) => $origin};
  transition:
    opacity 160ms var(--ease-out),
    transform 160ms var(--ease-out);

  details[open] > & {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }

  @starting-style {
    details[open] > & {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition-duration: 120ms !important;

    details[open] > & {
      transform: none;
    }

    @starting-style {
      details[open] > & {
        opacity: 0;
        transform: none;
      }
    }
  }
`;
