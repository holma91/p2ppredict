import { useState } from 'react';
import styled from 'styled-components';
import { getTimeWindowChange } from './utils/utils';
import SwapLineChart from './SwapLineChart';
import { useFetchPriceData } from '../../hooks/useFetchPriceData';
import { assetToImage, timeWindowToNumber, symbolToCoingeckoId } from '../../utils/misc';
import type { Token } from '../../types';

type PriceChartContainerProps = {
	height: string;
	width: string;
	chartHeight: string;
	asset0: string;
	asset1: Token;
};

const PriceChartContainer = ({ height, width, chartHeight, asset0, asset1 }: PriceChartContainerProps) => {
	const [timeWindow, setTimeWindow] = useState('24H');
	const {
		prices = [],
		isLoading,
		isError,
	} = useFetchPriceData(symbolToCoingeckoId[asset0], asset1.coingeckoId, timeWindow);

	const [hoverValue, setHoverValue] = useState<number | undefined>();
	const [hoverDate, setHoverDate] = useState<string | undefined>();
	const valueToDisplay = hoverValue || (prices && prices[prices.length - 1]?.value);
	const { changePercentage, changeValue } = getTimeWindowChange(prices);
	const isChangePositive = changeValue >= 0;

	const locale = 'en-US';
	const currentDate = new Date().toLocaleString(locale, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});

	const formatPrice = (price: number) => {
		let priceStr = price.toFixed(20);
		let processedPrice = priceStr.slice(0, 7);
		if (processedPrice[processedPrice.length - 1] === '.') {
			processedPrice += price.toFixed(20).slice(7, 8);
		}
		return parseFloat(processedPrice) === 0 ? price : processedPrice;
	};

	return (
		<ChartContainer height={height} width={width}>
			<StyledPriceChart>
				<StyledFlex>
					<div className="styledFlex-inner">
						<img src={assetToImage[asset0]} alt="logo" />
						{asset1.symbol !== 'usd' && <img src={assetToImage[asset1.symbol]} alt="logo" />}
						<div className="chosen-assets">
							{asset0.toUpperCase()}/{asset1.symbol.toUpperCase()}
						</div>
					</div>
					<div>
						<ButtonMenu2>
							<Button active={timeWindow === '24H'} onClick={() => setTimeWindow('24H')}>
								24H
							</Button>
							<Button active={timeWindow === '1W'} onClick={() => setTimeWindow('1W')}>
								1W
							</Button>
							<Button active={timeWindow === '1M'} onClick={() => setTimeWindow('1M')}>
								1M
							</Button>
							{/* {width > 350 && (
								<Button active={timeWindow === '3M'} onClick={() => setTimeWindow('3M')}>
									3M
								</Button>
							)} */}

							<Button active={timeWindow === '1Y'} onClick={() => setTimeWindow('1Y')}>
								1Y
							</Button>
						</ButtonMenu2>
					</div>
				</StyledFlex>
				<StyledFlexV2>
					<div className="inner">
						<div className="inner-inner">
							<span className="price">{valueToDisplay && formatPrice(valueToDisplay)}</span>
							<Change change={changeValue}>({changePercentage}%)</Change>
						</div>
						<div className="date">{hoverDate || currentDate}</div>
					</div>
				</StyledFlexV2>
				<Box height={chartHeight}>
					<SwapLineChart
						data={prices}
						setHoverValue={setHoverValue}
						setHoverDate={setHoverDate}
						isChangePositive={isChangePositive}
						timeWindow={timeWindowToNumber[timeWindow]}
					/>
				</Box>
			</StyledPriceChart>
		</ChartContainer>
	);
};

const Change = styled.span<{ change: number }>`
	font-size: 1.25rem;
	font-weight: 600;
	padding-bottom: 0.25rem;
	color: ${({ theme, change }) => (change > 0 ? theme.colors.green : theme.colors.red)};
`;

const ChartContainer = styled.div<{ height: string; width: string }>`
	display: flex;
	height: ${({ height }) => height};
	width: ${({ width }) => width};
	border: 1px solid ${({ theme }) => theme.background.quaternary};
	border-radius: 0.5rem;
`;

const Box = styled.div<{ height: string }>`
	height: ${({ height }) => height};
	width: 100%;
	padding: 1rem;
`;

const ButtonMenu2 = styled.div`
	/* width: 100%; */
	display: flex;
	background-color: ${({ theme }) => theme.background.secondary};
`;

type ButtonProps = {
	active: boolean;
};

const Button = styled.button<ButtonProps>`
	padding: 0.5rem;
	font-weight: 600;
	font-size: 1rem;
	border: 0;
	background-color: ${({ theme, active }) => (active ? theme.colors.primary : 'inherit')};
	color: ${({ theme, active }) => (active ? 'white' : 'inherit')};

	:hover {
		cursor: pointer;
		color: ${({ theme, active }) => (active ? '' : theme.colors.primary)};
	}
`;

const StyledPriceChart = styled.div`
	color: ${({ theme }) => `${theme.text.primary}`};
	width: 100%;
	height: 100%;
	border-radius: 0.5rem;
	padding-top: 0.5rem;
	background-color: ${({ theme }) => `${theme.background.primary}`};
`;

const StyledFlex = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 0.5rem 1.5rem;

	.styledFlex-inner {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.chosen-assets {
			font-size: ${({ theme }) => theme.typeScale.header4};
			font-weight: 600;
		}

		img {
			height: 27px;
			width: 27px;
		}
	}
`;

const StyledFlexV2 = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1.5rem;
	width: 100%;

	.inner {
		display: flex;
		flex-direction: column;
		padding-top: 0.75rem;
	}

	.date {
		font-size: 0.9rem;
		font-weight: 400;
		color: ${({ theme }) => theme.text.secondary};
	}

	.inner-inner {
		display: flex;
		align-items: end;
		gap: 0.5rem;

		.price {
			font-size: 2.5rem;
			font-weight: 600;
		}
	}
`;

export default PriceChartContainer;
