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

export const NavItem = styled.div<NavItemProps>`
  border: none;
  background-color: ${({ active }) => (active ? '#1E1E1E' : '#2d2d2d')};
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover { background-color: #37373d; }

	&:focus-visible { outline: 2px solid #03a9f4; outline-offset: -2px; }
`;

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  color: #b8b8b8;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;

  &:hover { background: #4a4a4f; color: #fff; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
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

	&:focus-visible { outline: 2px solid #03a9f4; outline-offset: -2px; }
`;
