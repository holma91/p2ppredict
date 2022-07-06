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
							<input />
						</div>
					</div>
					<div className="inner-size">
						<p>available: 1.24</p>
						<p>Option Size</p>
					</div>
				</SizeDiv>
			</Thing>
		</Container>
	);
};

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
	margin-bottom: 1rem;
`;

const Thing = styled.div`
	background-color: #151515;

	color: ${({ theme }) => theme.text.secondary};
	padding: 1rem;
	width: 400px;
	height: 750px;

	display: flex;
	flex-direction: column;
	border-radius: 15px;
`;

export default MakerThing;
