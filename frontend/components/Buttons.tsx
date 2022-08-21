import styled from 'styled-components';

const Button = styled.button`
	padding: 3px 10px;
	font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	border-radius: 2px;
	cursor: pointer;
	font-family: ${({ theme }) => theme.font.primary};
	font-weight: 300;
`;

export const PrimaryButton = styled(Button)`
	background-color: ${({ theme }) => theme.colors.secondary};
	color: black;
	border: 2px solid transparent;

	:hover {
		background-color: white;
	}
`;

export const SecondaryButton = styled(Button)`
	background-color: white;
	border: 3px solid ${({ theme }) => theme.colors.primary};
	color: ${({ theme }) => theme.colors.primary};
	border-radius: 0;
`;

export const TertiaryButton = styled(Button)`
	background-color: white;
	border: 2px solid transparent;
	color: ${({ theme }) => theme.colors.primary};
`;
