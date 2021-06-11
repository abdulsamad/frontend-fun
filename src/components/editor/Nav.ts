import styled from 'styled-components';

export const Nav = styled.nav`
  display: flex;
  background-color: #161616;
  color: #d4d4d4;
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
