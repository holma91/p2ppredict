import type { NextPage } from 'next';
import Link from 'next/link';
import styled from 'styled-components';

import { useFetchPrices } from '../hooks/useFetchPrices';
import { assetToImage, assetToName, symbolToCoingeckoId } from '../utils/misc';
import { useRouter } from 'next/router';
import { useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';

const Container = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.primary};
	display: grid;
	grid-template-columns: 4fr 7fr;
	justify-content: center;
	gap: 3rem;
	padding: 1.5rem;
	padding-bottom: 2.5rem;

	@media (max-width: 1540px) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		padding-top: 1rem;
	}
`;

const homepageAssetsSymbols = [
	{ symbol: 'eth', mainnet: true, testnet: true, hide: false },
	{ symbol: 'btc', mainnet: true, testnet: true, hide: false },
	{ symbol: 'matic', mainnet: true, testnet: true, hide: false },
	{ symbol: 'usdc', mainnet: true, testnet: true, hide: false },
	{ symbol: 'link', mainnet: true, testnet: false, hide: false },
	{ symbol: 'usdt', mainnet: true, testnet: false, hide: false },
	{ symbol: 'sol', mainnet: true, testnet: false, hide: false },
	{ symbol: 'avax', mainnet: true, testnet: false, hide: false },
	{ symbol: 'yfi', mainnet: true, testnet: false, hide: false },
	{ symbol: 'crv', mainnet: true, testnet: false, hide: false },
	{ symbol: 'aave', mainnet: true, testnet: false, hide: false },
	{ symbol: 'ada', mainnet: true, testnet: false, hide: false },
	{ symbol: 'snx', mainnet: true, testnet: false, hide: false },
	{ symbol: 'uni', mainnet: true, testnet: false, hide: false },
	{ symbol: 'bnb', mainnet: true, testnet: false, hide: false },
	{ symbol: 'dot', mainnet: true, testnet: false, hide: false },
	{ symbol: 'sushi', mainnet: true, testnet: false, hide: true },
	{ symbol: 'ltc', mainnet: true, testnet: false, hide: true },
	{ symbol: 'fil', mainnet: true, testnet: false, hide: true },
	{ symbol: 'doge', mainnet: true, testnet: false, hide: true },
];

const homepageAssetsIds = [
	symbolToCoingeckoId['eth'],
	symbolToCoingeckoId['btc'],
	symbolToCoingeckoId['matic'],
	symbolToCoingeckoId['link'],
	symbolToCoingeckoId['usdt'],
	symbolToCoingeckoId['usdc'],
	symbolToCoingeckoId['sol'],
	symbolToCoingeckoId['avax'],
	symbolToCoingeckoId['yfi'],
	symbolToCoingeckoId['crv'],
	symbolToCoingeckoId['aave'],
	symbolToCoingeckoId['ada'],
	symbolToCoingeckoId['snx'],
	symbolToCoingeckoId['uni'],
	symbolToCoingeckoId['bnb'],
	symbolToCoingeckoId['dot'],
	symbolToCoingeckoId['sushi'],
	symbolToCoingeckoId['ltc'],
	symbolToCoingeckoId['fil'],
	symbolToCoingeckoId['doge'],
];

const Home: NextPage = () => {
	const router = useRouter();
	const { prices } = useFetchPrices(homepageAssetsIds);
	const { chain } = useNetwork();

	const formatPrice = (price: number) => {
		let priceStr = price.toFixed(20);
		let processedPrice = priceStr.slice(0, 7);
		if (processedPrice[processedPrice.length - 1] === '.') {
			processedPrice += price.toFixed(20).slice(7, 8);
		}
		return processedPrice;
	};

	const handleClick = (symbol: string) => {
		router.push(`/trade?asset=${symbol}`);
	};

	const [isSSR, setIsSSR] = useState(true);

	useEffect(() => {
		setIsSSR(false);
	}, []);

	return (
		<>
			<Container>
				<Left>
					<p className="header">Prediction Market</p>
					<p className="description">
						p2ppredict is a prediction market built on the Polygon PoS Network. At the moment the markets
						are for cryptocurrencies, but in the future they could be for anything. Everyone can create
						markets, and everyone can take markets!
					</p>
					<div className="menu">
						<Link href="/create">
							<a>Create Markets</a>
						</Link>
						<Link href="/trade">
							<a>Take Markets</a>
						</Link>
					</div>
				</Left>
				<Right>
					<Boxes>
						{homepageAssetsSymbols.map(asset => {
							return (
								<Box
									onClick={
										asset.testnet || chain?.network === 'matic' || !chain
											? () => handleClick(asset.symbol)
											: () => {}
									}
									key={asset.symbol}
									clickable={asset.testnet || chain?.network === 'matic' || !chain}
									hide={asset.hide}
								>
									<div className="top">
										<img src={assetToImage[asset.symbol]} alt={asset.symbol} />
										<div>
											<p className="head">
												{assetToName[asset.symbol]}
												{!isSSR && chain?.network !== 'matic' && !asset.testnet && chain ? (
													<span>mainnet only</span>
												) : null}
											</p>
											<p className="small">{asset.symbol.toUpperCase()}</p>
										</div>
									</div>
									<div className="bottom">
										{prices && prices[symbolToCoingeckoId[asset.symbol]] && (
											<>
												<p>${formatPrice(prices[symbolToCoingeckoId[asset.symbol]].usd)}</p>
												<p>
													24H:{' '}
													{prices[symbolToCoingeckoId[asset.symbol]].usd_24h_change.toFixed(
														2
													)}
													%
												</p>
											</>
										)}
									</div>
								</Box>
							);
						})}
					</Boxes>
				</Right>
			</Container>
			<Bottom>
				<div className="header">
					<p>A Prediction Market on Polygon PoS network</p>
				</div>
				<div className="largebox">
					<div className="box">
						<p className="header">~30 different crypto markets</p>
						<p>
							Currently, p2ppredict has support for ~30 different crypto markets. In the future, it&apos;s
							possible that we&apos;ll add more markets and the markets are not limited to
							cryptocurrencies.
						</p>
					</div>
					<div className="box">
						<p className="header">Price feeds from Chainlink</p>
						<p>
							Every pricefeed on p2ppredict is from{' '}
							<a href="https://chain.link" target="_blank" rel="noreferrer">
								Chainlink
							</a>
							, a decentralized oracle network. For example, here is the MATIC/USD pricefeed on Polygon
							mainnet:{' '}
							<a
								href="https://data.chain.link/polygon/mainnet/crypto-usd/matic-usd"
								target="_blank"
								rel="noreferrer"
							>
								MATIC/USD
							</a>
						</p>
					</div>
					<div className="box hackathon">
						<p className="header">Hackathon 2022 Participant</p>
						<p>
							p2ppredict is currently participating in the Polygon #BUIDL IT Hackathon. A link to our
							devpost submission can be found at{' '}
							<a href="https://devpost.com" target="_blank" rel="noreferrer">
								devpost.com
							</a>
							.
						</p>
					</div>
				</div>
			</Bottom>
		</>
	);
};

const Boxes = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
	gap: 1rem;

	@media (max-width: 1800px) {
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
	@media (max-width: 1050px) {
		grid-template-columns: 1fr 1fr 1fr;
	}
	@media (max-width: 750px) {
		grid-template-columns: 1fr 1fr;
	}

	@media (max-width: 600px) {
		grid-template-columns: 1fr;
	}
`;

const Box = styled.div<{ clickable: boolean; hide: boolean }>`
	@media (max-width: 1800px) {
		display: ${({ hide }) => (hide ? 'none' : '')};
	}
	padding: 1.5rem;
	border-radius: 1rem;
	border: 2px solid ${({ theme }) => theme.background.quinary};
	width: 235px;

	@media (max-width: 600px) {
		width: 400px;
	}
	display: flex;
	gap: 1.5rem;
	flex-direction: column;

	cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
	position: relative;
	.top {
		display: flex;
		gap: 0.5rem;
		div {
			display: flex;
			flex-direction: column;
			gap: 0.1rem;
			p {
				font-size: ${({ theme }) => theme.typeScale.paragraph};
				font-weight: 500;
			}
			.small {
				font-size: ${({ theme }) => theme.typeScale.helperText};
				color: ${({ theme }) => theme.text.secondary};
				font-weight: 400;
			}
		}
		img {
			height: 35px;
			width: 35px;
		}
	}
	.bottom {
		display: flex;
		justify-content: space-between;
	}

	.head {
		span {
			font-size: 0.65rem;
			position: absolute;
			top: 1rem;
			right: 1rem;
		}
	}

	:hover {
		border: 2px solid ${({ theme }) => theme.colors.primary};
	}

	&.hide {
		@media (max-width: 1540px) {
			display: none;
		}
	}
`;

const Left = styled.div`
	padding-top: 8.5rem;
	padding-left: 3rem;
	display: flex;
	flex-direction: column;

	.header {
		font-size: 3.5rem;
	}

	.description {
		line-height: 1.3;
		padding: 0.5rem 0;
		color: ${({ theme }) => theme.text.tertiary};
		@media (max-width: 750px) {
			padding: 0.5rem 3.5rem;
		}
		@media (max-width: 610px) {
			padding: 0.5rem 5.5rem;
		}
	}

	.menu {
		display: flex;
		gap: 0.5rem;
		font-weight: 500;
		font-size: ${({ theme }) => theme.typeScale.header5};
		color: ${({ theme }) => theme.colors.primary};

		a {
			border: 2px solid ${({ theme }) => theme.background.primary};
			padding: 0.5rem;
			border-radius: 0.5rem;
			:hover {
				cursor: pointer;
				border: 2px solid ${({ theme }) => theme.colors.primary};
			}
		}
		.mainnet {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			border: 2px solid ${({ theme }) => theme.colors.primary};
			:hover {
				cursor: pointer;
				background: ${({ theme }) => theme.colors.primary};
				color: ${({ theme }) => theme.background.primary};
			}
		}
	}

	@media (max-width: 1540px) {
		padding-top: 0;
		padding-left: 0;
		width: 700px;
		align-items: center;
		justify-content: center;
	}
	@media (max-width: 750px) {
		padding-top: 0;
	}
`;

const Right = styled.div`
	padding-top: 0.5rem;
	@media (max-width: 1540px) {
		padding-top: 1.5rem;
	}
`;

const Bottom = styled.div`
	padding: 0 2rem;
	background-color: ${({ theme }) => theme.background.secondary};
	color: ${({ theme }) => theme.text.secondary};
	height: 300px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	.header {
		width: 100%;
		max-width: 1400px;
		p {
			color: ${({ theme }) => theme.colors.primary};
			padding-top: 2rem;
			font-size: ${({ theme }) => theme.typeScale.header1};
			font-weight: 500;
		}
	}
	.largebox {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 2rem;
		width: 100%;
		max-width: 1400px;
		overflow-y: scroll;
		.box {
			overflow-y: scroll;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			line-height: 1.5rem;
			.header {
				font-size: ${({ theme }) => theme.typeScale.header4};
				font-weight: 500;
			}
			a {
				color: ${({ theme }) => theme.colors.primary};
			}
		}
		@media (max-width: 1100px) {
			grid-template-columns: 1fr 1fr;
		}

		.hackathon {
			@media (max-width: 1100px) {
				display: none;
			}
		}
	}
`;

export default Home;
