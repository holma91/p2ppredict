import type { NextPage } from 'next';
import styled from 'styled-components';

import PriceChartContainer from '../components/Chart/PriceChartContainer';

const Container = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
`;

const Maker: NextPage = () => {
	const dimensions = { height: '800px', width: '100%', chartHeight: '83%' };
	const asset0 = { symbol: 'btc', coingeckoId: 'bitcoin' };
	const asset1 = { symbol: 'usd', coingeckoId: 'usd' };
	return (
		<Container>
			<Left>
				<PriceChartContainer
					height={dimensions.height}
					width={dimensions.width}
					chartHeight={dimensions.chartHeight}
					asset0={asset0}
					asset1={asset1}
				></PriceChartContainer>
			</Left>
			<Right></Right>
		</Container>
	);
};

const Left = styled.div`
	padding: 2rem;
	height: calc(100vh - 58.78px);
	background-color: ${({ theme }) => theme.colors.gray[300]};
	overflow-y: scroll;
	color: ${({ theme }) => theme.text.secondary};
`;

const Right = styled.div`
	height: calc(100vh - 58.78px);
	overflow-y: scroll;

	display: flex;
	justify-content: center;

	background-color: ${({ theme }) => theme.colors.gray[300]};
`;

export default Maker;
