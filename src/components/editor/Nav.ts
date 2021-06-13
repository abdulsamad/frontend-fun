import styled from 'styled-components';

export const Nav = styled.nav`
  display: flex;
  background-color: #161616;
  color: #d4d4d4;
  overflow-x: auto;
`;

interface NavItemProps {
  active?: boolean;
}

export const NavItem = styled.button<NavItemProps>`
  border: none;
  background-color: ${({ active }) => (active ? '#1E1E1E' : '#2d2d2d')};
  padding: 5px 10px;
  display: flex;
  align-items: center;

  &:focus {
    border: none;
    outline: none;
  }
`;

interface WrapButtonProps {
  active?: boolean;
}

export const WrapButton = styled.button<WrapButtonProps>`
  height: 100%;
  display: flex;
  align-items: center;
  border: none;
  margin-left: auto;
  background-color: ${({ active }) => (active ? '' : '#2d2d2d')};

  &:focus {
    border: none;
    outline: none;
  }
`;
