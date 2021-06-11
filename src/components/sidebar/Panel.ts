import styled from 'styled-components';

export const Panel = styled.div`
  background-color: #252525;
  width: 50px;
  box-shadow: 2px 3px 3px #2f2f2f;
`;

interface PanelItemProps {
  active?: boolean;
}

export const PanelItem = styled.button<PanelItemProps>`
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-left: ${({ active }) => (active ? '3px solid #fff' : 'none')};
  background-color: ${({ active }) => (active ? '#21252B' : 'transparent')};

  &:focus {
    border: none;
    outline: none;
  }
`;
