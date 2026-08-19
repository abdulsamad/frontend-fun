import styled from 'styled-components';

const GlobalContainer = styled.div`
	display: flex;
	height: 100vh;
	width: 100vw;
	min-width: 0;

	@media only screen and (max-width: 768px) {
		flex-direction: column;
		height: 100dvh;
	}
`;

export default GlobalContainer;
