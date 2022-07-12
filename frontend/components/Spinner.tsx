import styled from 'styled-components';

export const Spinner = () => {
	return (
		<SpinnerStyle>
			<div className="spinner-container">
				<div className="loading-spinner"></div>
			</div>
		</SpinnerStyle>
	);
};

const SpinnerStyle = styled.div`
	@keyframes spinner {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.loading-spinner {
		width: 22px;
		height: 22px;
		border: 6px solid #f3f3f3; /* Light grey */
		border-top: 6px solid ${({ theme }) => theme.background.primary}; /* Blue */
		border-radius: 50%;
		animation: spinner 1.5s linear infinite;
		padding: 0;
		margin: 0;
	}
	.spinner-container {
		display: grid;
		justify-content: center;
		align-items: center;
		/* height: 350px; */
	}
`;
