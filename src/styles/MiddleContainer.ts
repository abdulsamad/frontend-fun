import styled from 'styled-components';

const MiddleContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media only screen and (max-width: 768px) {
    height: 50dvh;
    min-height: 360px;
    width: 100% !important;
  }
`;

export default MiddleContainer;
