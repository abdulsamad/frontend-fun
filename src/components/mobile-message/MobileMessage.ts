import styled from 'styled-components';

const MobileMessage = styled.div`
	display: none;

	@media screen and (max-width: 768px) {
		height: 100vh;
		width: 100vw;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: 100vh;
		background: linear-gradient(to right, #141e30, #243b55);
		color: white;
		font-family: 'Arial', sans-serif;

		p {
			text-align: center;
		}
	}
`;

export default MobileMessage;
