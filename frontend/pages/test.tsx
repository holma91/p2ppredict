import { useState } from 'react';
import styled from 'styled-components';
import PriceChartContainer from '../components/Chart/PriceChartContainer';
import type { Token } from '../types';
import { symbolToCoingeckoId } from '../utils/misc';

export default function Test() {
	const [asset0, setAsset0] = useState<Token>({ symbol: 'btc', coingeckoId: 'bitcoin' });
	const [asset1, setAsset1] = useState<Token>({ symbol: 'usd', coingeckoId: 'usd' });

	const handleAssetChange = (assetNumber: number, value: string) => {
		if (assetNumber === 0) {
			setAsset0({
				symbol: value,
				coingeckoId: symbolToCoingeckoId[value],
			});
		} else if (assetNumber === 1) {
			setAsset0({
				symbol: value,
				coingeckoId: symbolToCoingeckoId[value],
			});
		}
	};

	return (
		<Container>
			<div>
				<label htmlFor="assets">Choose asset:</label>
				<select value={asset0.symbol} name="assets" onChange={e => handleAssetChange(0, e.target.value)}>
					<option value="btc">btc</option>
					<option value="eth">eth</option>
					<option value="bnb">bnb</option>
				</select>
			</div>
			<PriceChartContainer height={500} width={700} chartHeight={365} asset0={asset0} asset1={asset1} />
		</Container>
	);
}

// 375, 500, 240

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;

	gap: 1rem;

	height: 100vh;
`;
