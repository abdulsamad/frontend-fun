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
  background-position: center;
  transition: background 0.8s;

  &:hover {
    background: #673ab7 radial-gradient(circle, transparent 1%, #9575cd 1%) center/15000%;
  }

  &:active {
    background-color: #9575cd;
    background-size: 100%;
    transition: background 0s;
  }

  &:focus {
    outline: none;
  }
`;

export const UserId = styled.span`
  user-select: all;
  background-color: #03a9f4;
  padding: 5px;
  border-radius: 5px;
`;
