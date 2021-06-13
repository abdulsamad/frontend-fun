import styled from 'styled-components';

export const Files = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const TopBar = styled.div`
  width: 100%;
  background-color: #252525;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 700;
`;

export const TopBarButton = styled.button`
  border: none;

  &:focus {
    border: none;
    outline: none;
  }
`;

interface FileItemProps {
  active?: boolean;
}

export const FileItem = styled.div<FileItemProps>`
  padding: 0 16px;
  margin-bottom: 0;
  background-color: ${({ active }) => (active ? ' #37373d' : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  & > div {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  &:hover {
    & > button {
      visibility: visible;
    }
  }
`;

export const DeleteButton = styled.button`
  border: none;
  visibility: hidden;

  &:focus {
    outline: none;
  }
`;
