import type { NextPage } from 'next';
import { useState } from 'react';
import styled from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';
import { useNetwork } from 'wagmi';

import type { Token } from '../types';
import Banner from '../components/Banner';

import { assetToImage, symbolToCoingeckoId } from '../utils/misc';
import { allMarkets } from '../data/mockMarkets';
import PriceChartContainer from '../components/Chart/PriceChartContainer';
import { useFetchPrices } from '../hooks/useFetchPrices';
import { formatDate } from '../utils/helpers';
import OrderBook from '../components/OrderBook';
import { useRouter } from 'next/router';
import { useFetchMarkets } from '../hooks/useFetchMarkets';
import Link from 'next/link';

interface Props {
	colored?: boolean;
}

const OuterContainer = styled.div`
	color: ${({ theme }) => theme.text.secondary};
`;

const Container = styled.div`
	display: grid;
	grid-template-columns: 8fr 6fr;

	@media (max-width: 900px) {
		grid-template-columns: 100% 0;
	}
`;

const Taker: NextPage = () => {
	const { chain } = useNetwork();
	const router = useRouter();
	let { asset } = router.query;
	asset = asset as string; // I promise
	const [asset0, setAsset0] = useState(asset ? asset : 'btc');
	const [asset1, setAsset1] = useState<Token>({
		symbol: 'usd',
		coingeckoId: 'usd',
	});
	const [active, setActive] = useState(0);
	const { prices, isLoading } = useFetchPrices(Object.values(symbolToCoingeckoId));
	const [txHash, setTxHash] = useState('');
	const [buyInfo, setBuyInfo] = useState({ asset: '', price: '', side: '' });
	let { markets } = useFetchMarkets(asset0);

	let dimensions = { height: '375px', width: '100%', chartHeight: '240px' };

	const handleClick = (option: any) => {
		setActive(option.id);
		setAsset0(option.asset);
	};

	const formatOdds = (odds: string) => {
		return parseFloat(odds).toFixed(2);
	};

	const collateralAsset = chain?.network === 'rinkeby' ? 'ETH' : 'MATIC';
	const explorer =
		chain?.network === 'rinkeby'
			? 'https://rinkeby.etherscan.io/tx'
			: chain?.network === 'maticmum'
			? 'https://mumbai.polygonscan.com/tx'
			: 'https://polygonscan.com/tx';

	return (
		<>
			{txHash !== '' && buyInfo.asset !== '' && (
				<NewTx>
					<p>
						You just bought the {buyInfo.side} side of a {buyInfo.asset.toUpperCase()} prediction for{' '}
						{buyInfo.price} {collateralAsset}
					</p>
					<a href={`${explorer}/${txHash}`} target="_blank" rel="noreferrer">
						Tx Hash: {txHash} <FiExternalLink />
					</a>
				</NewTx>
			)}
			<OuterContainer>
				<Banner
					showAll={false}
					bannerChoice={asset0}
					fullWidth={true}
					setBannerChoice={setAsset0}
					setActive={setActive}
				/>
				<Container>
					<Left>
						<Overview>
							<SectionHeader>
								<div className="section-left">
									<div className="top">
										<h6>Expires: Soon</h6>
									</div>
									<div className="bottom">
										<p>ASSET</p>
										<p>STRIKE</p>
										<p>EXPIRY</p>
									</div>
								</div>
								<ChoiceDiv>
									<div>OVER</div>
									<div>UNDER</div>
								</ChoiceDiv>
							</SectionHeader>
							{markets && Object.values(markets).length > 0 ? (
								Object.values(markets).map((market: any) => {
									return (
										<MarketContainer
											key={market.id}
											isActive={active === market.id}
											onClick={() => handleClick(market)}
										>
											<Market>
												<AssetDiv>
													<div>
														<img src={assetToImage[market.asset]} alt="logo" />
														<p>{market.asset.toUpperCase()}</p>
													</div>
													<p className="live-price">
														{isLoading
															? ''
															: `$${prices[symbolToCoingeckoId[market.asset]].usd}`}
													</p>
												</AssetDiv>
												<p>${market.strike}</p>
												<p>{formatDate(market.expiry)}</p>
											</Market>
											<ChoiceDiv colored={true}>
												<div>
													{market.over.length > 0
														? formatOdds(market.over[0].odds.toString())
														: '-'}
												</div>
												<div>
													{market.under.length > 0
														? formatOdds(market.under[0].odds.toString())
														: '-'}
												</div>
											</ChoiceDiv>
										</MarketContainer>
									);
								})
							) : (
								<NoMarkets>
									<p>No markets for {asset0.toUpperCase()} available</p>
									<Link href="/create">
										<a>Create Markets</a>
									</Link>
								</NoMarkets>
							)}
						</Overview>
					</Left>
					<Right>
						<PriceChartContainer
							height={dimensions.height}
							width={dimensions.width}
							chartHeight={dimensions.chartHeight}
							asset0={asset0 === 'all' ? allMarkets[0].asset : asset0}
							asset1={asset1}
						></PriceChartContainer>
						{markets && (
							<OrderBook
								market={Object.values(markets)[active]}
								setTxHash={setTxHash}
								setBuyInfo={setBuyInfo}
							></OrderBook>
						)}
					</Right>
				</Container>
			</OuterContainer>
		</>
	);
};

const NoMarkets = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 0.75rem;
	height: 300px;
	border-right: 1px solid ${({ theme }) => theme.background.tertiary};
	border-bottom: 1px solid ${({ theme }) => theme.background.tertiary};
	font-size: ${({ theme }) => theme.typeScale.header3};

	a {
		border: 2px solid ${({ theme }) => theme.background.primary};
		padding: 0.5rem;
		border-radius: 0.5rem;

		font-size: ${({ theme }) => theme.typeScale.paragraph};
		border: 2px solid ${({ theme }) => theme.colors.primary};
		:hover {
			cursor: pointer;
			background-color: ${({ theme }) => theme.colors.primary};
			color: white;
		}
	}
`;

const Right = styled.div`
	padding: 0 1.75rem;
	height: 93vh;
	overflow-y: scroll;

	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;

	background-color: ${({ theme }) => theme.colors.gray[300]};
	@media (max-width: 900px) {
		display: none;
	}
`;

const Left = styled.div`
	height: 93vh;
	overflow-y: scroll;
	color: ${({ theme }) => theme.text.secondary};
	background-color: ${({ theme }) => theme.background.primary};

	.header {
		padding: 0.65rem 1.4rem;
		padding-top: 0.5rem;
		display: flex;
		justify-content: space-between;
		background-color: ${({ theme }) => theme.colors.gray[300]};
		h4 {
			font-size: ${({ theme }) => theme.typeScale.header4};
			font-weight: 500;
		}
	}
`;

const SectionHeader = styled.div`
	display: grid;
	grid-template-columns: 3fr 2fr;
	background-color: ${({ theme }) => theme.background.primary};
	border-bottom: 1px solid ${({ theme }) => theme.background.quaternary};

	h6 {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		font-weight: 400;
	}

	.section-left {
		border-right: 1px solid #606060;
		padding: 0.65rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		.top {
			color: ${({ theme }) => theme.colors.primary};
		}

		.bottom {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		p {
			font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		}
	}
`;

const ChoiceDiv = styled.div<Props>`
	color: ${({ colored, theme }) => (colored ? theme.colors.primary : theme.text.secondary)};
	display: flex;
	justify-content: space-evenly;
	width: 100%;

	align-items: center;

	div,
	p {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: ${({ theme }) => theme.typeScale.helperText};

		/* :hover {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      background-color: ${({ colored, theme }) => (colored ? theme.colors.primaryHover : theme.colors.gray[100])};
    } */
	}

	/* :hover {
    cursor: pointer;
  } */
`;

const MarketContainer = styled.div<{ isActive: boolean }>`
	border-bottom: 1px solid ${({ theme }) => theme.background.quaternary};
	display: grid;
	justify-items: stretch;
	align-items: stretch; //
	grid-template-columns: 3fr 2fr;
	/* background-color: ${({ theme }) => theme.colors.gray[200]}; */
	background-color: ${({ theme, isActive }) => (isActive ? theme.background.tertiary : '')};
	h6 {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		font-weight: 500;
	}

	:hover {
		cursor: pointer;
		background-color: ${({ theme }) => theme.background.secondary};
	}
`;

const Market = styled.div`
	padding: 0.65rem 1.4rem;
	display: flex;
	justify-content: space-between;
	align-items: center;

	p {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	}
	/* :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.primaryHover};
  } */
`;

const Overview = styled.div``;

const AssetDiv = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	.live-price {
		font-size: 0.8rem;
	}

	div {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		img {
			height: 20px;
			width: 20px;
		}
	}
`;

const NewTx = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	width: 100vw;
	padding-top: 1rem;
	padding-bottom: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 0.5rem;
	p {
		color: white !important;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		padding-bottom: 0.1rem;
	}
	a {
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		padding-bottom: 0.1rem;
		/* border-bottom: 2px solid ${({ theme }) => theme.colors.primary}; */
		:hover {
			color: ${({ theme }) => theme.colors.primary};
		}
	}
	svg {
		width: 22px;
	}
`;

export default Taker;
