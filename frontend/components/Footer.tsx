import styled from 'styled-components';

const Footer = () => {
	return (
		<FooterContainer>
			<p>p2ppredict is a prediction market created for the polygon hackathon summer 2022</p>
		</FooterContainer>
	);
};

const FooterContainer = styled.div`
	border-top: 1px solid ${({ theme }) => theme.background.secondary};
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.primary};
	padding: 1rem 1.5rem;
	font-size: ${({ theme }) => theme.typeScale.smallParagraph};
`;

export default Footer;
