import type { NextPage } from 'next';
import { useState } from 'react';
import styled from 'styled-components';

import PriceChartContainer from '../components/Chart/PriceChartContainer';
import Banner from '../components/Banner';
import MakerThing from './makerthing';
import { symbolToCoingeckoId } from '../utils/misc';

const Container = styled.div`
	display: grid;
	grid-template-columns: 5fr 2fr;
`;

const Maker: NextPage = () => {
	const [asset, setAsset] = useState('btc');
	const asset1 = { symbol: 'usd', coingeckoId: 'usd' };

	const dimensions = { height: '87%', width: '100%', chartHeight: '77%' };

	return (
		<>
			<Container>
				<Left>
					<Banner showAll={false} bannerChoice={asset} fullWidth={false} setBannerChoice={setAsset} />
					<PriceChartContainer
						height={dimensions.height}
						width={dimensions.width}
						chartHeight={dimensions.chartHeight}
						asset0={asset}
						asset1={asset1}
					></PriceChartContainer>
				</Left>
				<Right>
					<MakerThing asset={asset} setAsset={setAsset} />
				</Right>
			</Container>
		</>
	);
};

const Left = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0.5rem 1rem;
	height: calc(100vh - 58.78px);
	background-color: ${({ theme }) => theme.colors.gray[300]};
	overflow-y: scroll;
	color: ${({ theme }) => theme.text.secondary};
`;

const Right = styled.div`
	padding: 0.5rem 1rem;
	height: calc(100vh - 58.78px);
	overflow-y: scroll;

	display: flex;
	justify-content: center;

	background-color: ${({ theme }) => theme.colors.gray[300]};
`;

export default Maker;
