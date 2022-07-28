import styled from 'styled-components';
import { assetToImage, priceFeedToSymbol } from '../utils/misc';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { nile } from '../../contracts/scripts/addresses';
import { Dispatch, SetStateAction, useContext } from 'react';
// import { TronWebContext } from '../pages/_app';
import { formatDate } from '../utils/helpers';

type OrderBookProps = {
	market: any;
	setTxHash: Dispatch<SetStateAction<string>>;
	setBuyInfo: Dispatch<SetStateAction<any>>;
};

export default function OrderBook({ market, setTxHash, setBuyInfo }: OrderBookProps) {
	// const tronWeb = useContext(TronWebContext);

	const formatOdds = (odds: string) => {
		return parseFloat(odds).toFixed(2);
	};

	const handleBuy = async (prediction: any, side: string) => {
		if (!tronWeb || !tronWeb.defaultAddress) {
			return;
		}

		let exchange = await tronWeb.contract(Exchange.abi, nile.exchange);

		const takerBid = {
			taker: tronWeb.defaultAddress.base58,
			price: prediction.price,
			collection: nile.predictionMarket,
			tokenId: prediction.id,
		};

		let result;
		try {
			result = await exchange.matchAskWithTakerBid(Object.values(takerBid)).send({
				feeLimit: 200_000_000,
				callValue: takerBid.price,
				shouldPollResponse: false,
			});
		} catch (e) {
			console.log(e);
			return;
		}

		setTxHash(result);
		setBuyInfo({
			asset: prediction.asset,
			side,
			price: tronWeb.fromSun(takerBid.price),
		});

		// refetching

		setTimeout(() => {
			setTxHash('');
			setBuyInfo({ asset: '', price: '', side: '' });
		}, 20000);
	};
	return (
		<Container>
			{market && (
				<>
					<Header>
						<Asset>
							<img src={assetToImage[market.asset]} alt="logo" />
							<p>{market.asset.toUpperCase()}/USD</p>
						</Asset>
						<div className="price">
							Oracle price: ${market.latestAnswer} <span>(go to mainnet for real prices)</span>
						</div>
						<div className="summary">
							<p>
								At {formatDate(market.expiry)}, will the price of {market.asset.toUpperCase()} be over
								or under ${market.strike}?
							</p>
						</div>
					</Header>
					<OverUnder>
						<Direction>
							<p>OVER</p>
							{market.over.map((prediction: any) => {
								return (
									<div key={prediction.id} onClick={() => handleBuy(prediction, 'OVER')}>
										<p>{TronWeb.fromSun(prediction.price)} TRX</p>
										<p>{formatOdds(prediction.odds.toString())}</p>
									</div>
								);
							})}
						</Direction>
						<Direction>
							<p>UNDER</p>
							{market.under.map((prediction: any) => {
								return (
									<div key={prediction.id} onClick={() => handleBuy(prediction, 'UNDER')}>
										<p>{TronWeb.fromSun(prediction.price)} TRX</p>
										<p>{formatOdds(prediction.odds.toString())}</p>
									</div>
								);
							})}
						</Direction>
					</OverUnder>
					<Orders></Orders>
				</>
			)}
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
		border: 2px solid ${({ theme }) => theme.background.senary};
		border-radius: 0.25rem;
		width: 100%;
		display: flex;
		justify-content: space-between;
		color: ${({ theme }) => theme.text.secondary};

		:hover {
			cursor: pointer;
			color: ${({ theme }) => theme.text.primary};
			border: 2px solid ${({ theme }) => theme.colors.primary};
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
	background-color: ${({ theme }) => theme.background.secondary};
	padding: 1rem;
	border-radius: 0.5rem; ;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	/* justify-content: space-between; */
	/* align-items: center; */
	.price {
		font-weight: 500;
		span {
			font-weight: 400;
			font-size: 0.85rem;
		}
	}
	.summary {
		line-height: 1.5;
	}
`;
