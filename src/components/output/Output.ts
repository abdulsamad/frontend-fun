import styled from 'styled-components';

const Output = styled.section`
	height: 100%;
	width: 100%;
	background-color: #ffffff;
	min-width: 0;

	@media only screen and (max-width: 768px) {
		height: 25dvh;
		width: 100% !important;
	}
`;

export default Output;
