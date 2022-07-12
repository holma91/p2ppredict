import styled from 'styled-components';
import { assetToImage } from '../utils/misc';

type OrderBookProps = {
	market: any;
	asset: string;
};

export default function OrderBook({ market, asset }: OrderBookProps) {
	console.log(market);

	return (
		<Container>
			<Header>
				<Asset>
					<img src={assetToImage[market.asset]} alt="logo" />
					<p>{market.asset.toUpperCase()}/USD</p>
				</Asset>
				<div>
					<p>
						At {market.expiry}, will the price of {market.asset.toUpperCase()} be over or under $
						{market.strike}?
					</p>
				</div>
			</Header>
			<OverUnder>
				<Direction>
					<p>OVER</p>
					<div>
						<p>1.32 ETH</p>
						<p>2.00</p>
					</div>
					<div>
						<p>1.10 ETH</p>
						<p>1.96</p>
					</div>
					<div>
						<p>1.15 ETH</p>
						<p>1.94</p>
					</div>
					<div>
						<p>0.15 ETH</p>
						<p>1.84</p>
					</div>
					<div>
						<p>0.67 ETH</p>
						<p>1.82</p>
					</div>
				</Direction>
				<Direction>
					<p>UNDER</p>
					<div>
						<p>1.32 ETH</p>
						<p>2.00</p>
					</div>
					<div>
						<p>1.10 ETH</p>
						<p>1.99</p>
					</div>
					<div>
						<p>1.10 ETH</p>
						<p>1.96</p>
					</div>
					<div>
						<p>1.15 ETH</p>
						<p>1.94</p>
					</div>
				</Direction>
			</OverUnder>
			<Orders></Orders>
		</Container>
	);
}

const Asset = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;

	p {
		font-size: ${({ theme }) => theme.typeScale.header4};
		font-weight: 600;
	}

	img {
		height: 27px;
		width: 27px;
	}
`;

const Direction = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	width: 100%;

	.header {
	}

	div {
		padding: 0.5rem;
		border: 1px solid ${({ theme }) => theme.background.senary};
		border-radius: 0.25rem;
		width: 100%;
		display: flex;
		justify-content: space-between;
		color: ${({ theme }) => theme.text.secondary};

		:hover {
			cursor: pointer;
			color: ${({ theme }) => theme.text.primary};
			border: 1px solid ${({ theme }) => theme.colors.primary};
		}
	}
`;

const Orders = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-items: center;
	gap: 0.5rem;

	.direction {
		width: 100%;
		display: grid;
		gap: 0.5rem;

		div {
			display: flex;
			justify-content: space-between;
		}
	}
`;

const OverUnder = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-items: center;
	gap: 1rem;
`;

const Container = styled.div`
	color: ${({ theme }) => theme.text.primary};
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	border: 1px solid ${({ theme }) => theme.background.tertiary};
	background-color: ${({ theme }) => theme.background.tertiary};
	padding: 1rem;
	border-radius: 0.5rem; ;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	/* justify-content: space-between; */
	/* align-items: center; */
`;
