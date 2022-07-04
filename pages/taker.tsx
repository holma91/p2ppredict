import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Token } from '../types';

import { assetToImage, assets, symbolToCoingeckoId } from '../utils/misc';
import { mockOptions } from '../data/mockOptions';
import PriceChartContainer from '../components/Chart/PriceChartContainer';
import { useFetchPrices } from '../hooks/useFetchPrices';

interface Props {
	colored?: boolean;
}

const Container = styled.div`
	display: grid;
	grid-template-columns: 8fr 5fr;
`;

const Taker: NextPage = () => {
	const [screenWidth, setScreenWidth] = useState(0);
	const [asset0, setAsset0] = useState<Token>({ symbol: 'btc', coingeckoId: 'bitcoin' });
	const [asset1, setAsset1] = useState<Token>({ symbol: 'usd', coingeckoId: 'usd' });

	const { prices, isLoading, isError } = useFetchPrices(assets);

	console.log(prices);

	useEffect(() => {
		const handleResizeWindow = () => setScreenWidth(window.innerWidth);
		window.addEventListener('resize', handleResizeWindow);
		handleResizeWindow();
		return () => {
			window.removeEventListener('resize', handleResizeWindow);
		};
	}, []);

	let dimensions = { height: 375, width: 500, chartHeight: 240 };
	if (screenWidth < 1100) {
		dimensions.width = 350;
	} else if (screenWidth < 1350) {
		dimensions.width = 400;
	}

	return (
		<Container>
			<Left>
				<div className="header">
					<h4>Markets</h4>
				</div>
				<Overview>
					<SectionHeader>
						<div className="section-left">
							<div className="top">
								<h6>Expires: Today</h6>
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
					{mockOptions.slice(0, 3).map(option => {
						return (
							<MarketContainer key={option.id}>
								<div className="market">
									<AssetDiv>
										<div>
											<img src={assetToImage[option.asset]} alt="logo" />
											<p>{option.asset.toUpperCase()}</p>
										</div>
										<p className="live-price">
											{isLoading ? '' : `$${prices[symbolToCoingeckoId[option.asset]].usd}`}
										</p>
									</AssetDiv>
									<p>${option.strike}</p>
									<p>{option.expiry}</p>
								</div>
								<ChoiceDiv colored={true}>
									<div>{option.over}</div>
									<div>{option.under}</div>
								</ChoiceDiv>
							</MarketContainer>
						);
					})}
					<SectionHeader>
						<div className="section-left">
							<div className="top">
								<h6>Expires: This Week</h6>
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
					{mockOptions.slice(3).map(option => {
						return (
							<MarketContainer key={option.id}>
								<div className="market">
									<AssetDiv>
										<div>
											<img src={assetToImage[option.asset]} alt="logo" />
											<p>{option.asset.toUpperCase()}</p>
										</div>
										<p className="live-price">
											{isLoading ? '' : `$${prices[symbolToCoingeckoId[option.asset]].usd}`}
										</p>
									</AssetDiv>
									<p>${option.strike}</p>
									<p>{option.expiry}</p>
								</div>
								<ChoiceDiv colored={true}>
									<div>{option.over}</div>
									<div>{option.under}</div>
								</ChoiceDiv>
							</MarketContainer>
						);
					})}
				</Overview>
			</Left>
			<Right>
				<PriceChartContainer
					height={dimensions.height}
					width={dimensions.width}
					chartHeight={dimensions.chartHeight}
					asset0={asset0}
					asset1={asset1}
				></PriceChartContainer>
			</Right>
		</Container>
	);
};

const Right = styled.div`
	height: 93vh;
	overflow-y: scroll;

	display: flex;
	justify-content: center;

	background-color: ${({ theme }) => theme.colors.gray[300]};

	padding-top: 2.7rem;
`;

const Left = styled.div`
	height: 93vh;
	overflow-y: scroll;
	color: ${({ theme }) => theme.text.secondary};

	.header {
		padding: 0.65rem 1.4rem;
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
	grid-template-columns: 1fr 1fr;
	background-color: ${({ theme }) => theme.colors.gray[100]};
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
			color: ${({ theme }) => theme.colors.tertiary};
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
	color: ${({ colored, theme }) => (colored ? theme.colors.tertiary : theme.text.secondary)};
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

		:hover {
			background-color: ${({ theme }) => theme.colors.primaryHover};
			background-color: ${({ colored, theme }) => (colored ? theme.colors.primaryHover : theme.colors.gray[100])};
		}
	}

	:hover {
		cursor: pointer;
	}
`;

const MarketContainer = styled.div`
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
	display: grid;
	justify-items: stretch;
	align-items: stretch; //
	grid-template-columns: 1fr 1fr;
	background-color: ${({ theme }) => theme.colors.gray[200]};
	h6 {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		font-weight: 500;
	}

	.market {
		padding: 0.65rem 1.4rem;
		display: flex;
		justify-content: space-between;
		align-items: center;

		p {
			font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		}
		:hover {
			cursor: pointer;
			background-color: ${({ theme }) => theme.colors.primaryHover};
		}
	}
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

export default Taker;
