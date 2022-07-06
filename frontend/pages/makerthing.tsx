import type { NextPage } from 'next';
import styled from 'styled-components';

import { assetToImage } from '../utils/misc';

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 91vh;
`;

const MakerThing: NextPage = () => {
	return (
		<Container>
			<Thing>
				<Header>
					<div>Buy Options</div>
				</Header>
				<SizeDiv>
					<div className="inner-size">
						<img src={assetToImage['btc']} alt={`btc-logo`} />
						<div className="input-div">
							<input placeholder="1" />
						</div>
					</div>
					<div className="inner-size">
						<p>available: 1.24</p>
						<p>Option Size</p>
					</div>
				</SizeDiv>
				<MultiDiv>
					<div className="split">
						<div className="first">
							<input type="number" placeholder="20000" />
							<p>Strike Price</p>
						</div>
						<div>
							<input type="date " placeholder="2023-01-01" />
							<p>Expiry</p>
						</div>
					</div>
					<div className="mid">
						<div>
							<p>Breakeven</p>
							<p>$1800</p>
						</div>
						<div>
							<p>Option Price</p>
							<p>$100</p>
						</div>
						<div>
							<p>Side</p>
							<p>CALL</p>
						</div>
						<div>
							<p>IV</p>
							<p>0</p>
						</div>
					</div>
					<div className="split">
						<div className="first">
							<input type="number" placeholder="1.50" />
							<p>Over Odds</p>
						</div>
						<div>
							<input type="number" placeholder="3.00" />
							<p>Under Odds</p>
						</div>
					</div>
				</MultiDiv>
			</Thing>
		</Container>
	);
};

const MultiDiv = styled.div`
	border: 1px solid #262626;
	border-radius: 1rem;
	p {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	}

	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;

		.first {
			border-right: 1px solid #262626;
		}
		div {
			padding: 0.8rem;
			display: flex;
			flex-direction: column;
			gap: 0.6rem;

			input {
				color: ${({ theme }) => theme.text.secondary};

				font-size: ${({ theme }) => theme.typeScale.paragraph};
				background-color: inherit;
				outline: none;
				border: none;
				width: 100%;
				/* text-align: right; */
			}
		}
	}

	.mid {
		border-top: 1px solid #262626;
		border-bottom: 1px solid #262626;
		padding: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		div {
			display: flex;
			justify-content: space-between;
		}
	}
`;

const SizeDiv = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	border-radius: 1rem;
	background-color: #1e1e1e;
	padding: 1rem 1.25rem;
	gap: 1rem;

	.inner-size {
		display: flex;
		justify-content: space-between;

		img {
			height: 35px;
			width: 35px;
		}

		p {
			font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		}
	}

	.input-div {
		width: 100%;
		display: flex;
		align-items: center;
		input {
			color: ${({ theme }) => theme.text.secondary};

			font-size: ${({ theme }) => theme.typeScale.header2};
			background-color: inherit;
			outline: none;
			border: none;
			width: 100%;
			text-align: right;
		}
	}
`;

const Header = styled.div`
	display: flex;
`;

const Thing = styled.div`
	background-color: #151515;

	color: ${({ theme }) => theme.text.secondary};
	padding: 1rem;
	width: 400px;
	height: 750px;

	display: flex;
	flex-direction: column;
	gap: 1rem;
	border-radius: 15px;
`;

export default MakerThing;
