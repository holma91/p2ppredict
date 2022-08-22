import styled from 'styled-components';
import { assetToImage } from '../utils/misc';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { predictionMarketAddresses, exchangeAddresses } from '../utils/addresses';
import { Dispatch, SetStateAction, useState } from 'react';
import { formatDate, formatPrice } from '../utils/helpers';
import { ethers } from 'ethers';
import { useAccount, useNetwork } from 'wagmi';
import { TakerBid } from '../types';
import { Spinner } from './Spinner';
import { FiExternalLink } from 'react-icons/fi';
declare var window: any;

type OrderBookProps = {
	market: any;
	setTxHash: Dispatch<SetStateAction<string>>;
	setBuyInfo: Dispatch<SetStateAction<any>>;
};

export default function OrderBook({ market, setTxHash, setBuyInfo }: OrderBookProps) {
	const [currentlyBeingBought, setCurrentlyBeingBought] = useState('-1');

	const { chain } = useNetwork();
	const activeChain = chain?.network;

	const { address } = useAccount();

	const formatOdds = (odds: string) => {
		return parseFloat(odds).toFixed(2);
	};

	const handleBuy = async (prediction: any, side: string) => {
		if (!address) return;

		const takerBid: TakerBid = {
			taker: address,
			price: prediction.price,
			collection: predictionMarketAddresses[activeChain ? activeChain : 'rinkeby'],
			tokenId: prediction.id,
		};

		const { ethereum } = window;
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const exchange = new ethers.Contract(
				exchangeAddresses[activeChain ? activeChain : 'rinkeby'],
				Exchange.abi,
				signer
			);

			setCurrentlyBeingBought(takerBid.tokenId);
			let tx;
			try {
				tx = await exchange.matchAskWithTakerBid(Object.values(takerBid), {
					value: prediction.price,
				});
				await tx.wait();
			} catch (e) {
				console.log(e);
				setCurrentlyBeingBought('-1');
				return;
			}
			setCurrentlyBeingBought('-1');

			setTxHash(tx.hash);

			setBuyInfo({
				asset: prediction.asset,
				side,
				price: ethers.utils.formatUnits(takerBid.price, 18),
			});

			setTimeout(() => {
				setTxHash('');
				setBuyInfo({ asset: '', price: '', side: '' });
			}, 20000);
		}
	};

	const collateralAsset = activeChain === 'rinkeby' ? 'ETH' : 'MATIC';

	return (
		<>
			{market && (
				<Container>
					<>
						<Header>
							<Asset>
								<img src={assetToImage[market.asset]} alt="logo" />
								<p>{market.asset.toUpperCase()}/USD</p>
							</Asset>
							<div className="price">
								<p>Oracle price: ${market.latestAnswer}</p>
								<a
									href={`https://data.chain.link/polygon/mainnet/${
										market.asset === 'usdc' || market.asset === 'usdt' || market.asset === 'dai'
											? 'stablecoins'
											: 'crypto-usd'
									}/${market.asset}-usd`}
									target="_blank"
									rel="noreferrer"
								>
									<FiExternalLink />
								</a>
							</div>
							<div className="summary">
								<p>
									At {formatDate(market.expiry)}, will the price of {market.asset.toUpperCase()} be
									over or under ${market.strike}?
								</p>
							</div>
						</Header>
						<OverUnder>
							<Direction>
								<p>OVER</p>
								{market.over.map((prediction: any) => {
									return currentlyBeingBought === prediction.id ? (
										<Button l={true} key={prediction.id}>
											<Spinner />
										</Button>
									) : (
										<div
											className="prediction"
											key={prediction.id}
											onClick={() => handleBuy(prediction, 'OVER')}
										>
											<p>
												{formatPrice(ethers.utils.formatUnits(prediction.price, 18))}{' '}
												{collateralAsset}
											</p>
											<p>{formatOdds(prediction.odds.toString())}</p>
										</div>
									);
								})}
							</Direction>
							<Direction>
								<p>UNDER</p>
								{market.under.map((prediction: any) => {
									return currentlyBeingBought === prediction.id ? (
										<Button l={true} key={prediction.id}>
											<Spinner />
										</Button>
									) : (
										<div
											className="prediction"
											key={prediction.id}
											onClick={() => handleBuy(prediction, 'UNDER')}
										>
											<p>
												{formatPrice(ethers.utils.formatUnits(prediction.price, 18))}{' '}
												{collateralAsset}
											</p>
											<p>{formatOdds(prediction.odds.toString())}</p>
										</div>
									);
								})}
							</Direction>
						</OverUnder>
						<Orders></Orders>
					</>
				</Container>
			)}
		</>
	);
}

const Button = styled.button<{ l: boolean }>`
	width: 100%;
	/* margin-top: 0.5rem; */
	padding: ${({ l: loading }) => (loading ? '0.5rem 0.75rem' : '0.75rem')};
	outline: none;
	border: none;
	border-radius: 0.25rem;
	color: ${({ theme }) => theme.background.primary};
	font-weight: 600;
	background-color: ${({ theme }) => theme.colors.primary};
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.9;
	:hover {
		opacity: 1;
	}
`;

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

	.prediction {
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
		display: flex;
		gap: 0.3rem;
		font-weight: 500;
		span {
			font-weight: 400;
			font-size: 0.85rem;
		}
		a {
			:hover {
				color: ${({ theme }) => theme.colors.primary};
			}
		}
	}
	.summary {
		line-height: 1.5;
	}
`;
