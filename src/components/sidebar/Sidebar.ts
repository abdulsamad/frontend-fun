import styled from 'styled-components';

const Sidebar = styled.section`
	height: 100vh;
	width: 100%;
	min-width: 250px;
	overflow: auto;
	color: #f5f5f5;
	background-color: #131313;
	display: flex;
	min-height: 0;

	@media only screen and (max-width: 768px) {
		height: 25dvh;
		min-height: 180px;
		width: 100% !important;
	}
`;

export default Sidebar;
