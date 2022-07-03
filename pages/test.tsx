import { useState } from 'react';
import styled from 'styled-components';
import PriceChartContainer from '../components/Chart/PriceChartContainer';
import { useFetchPrices } from '../hooks/useFetchPrices';

export default function Test() {
	const [assetValue, setAssetValue] = useState('bitcoin');
	const [timeWindowValue, setTimeWindowValue] = useState('24H');

	const { prices, isLoading, isError } = useFetchPrices(assetValue, 'usd', timeWindowValue);
	console.log(prices);

	return (
		<Container>
			<div>
				<label htmlFor="assets">Choose asset:</label>
				<select value={assetValue} name="assets" onChange={e => setAssetValue(e.target.value)}>
					<option value="bitcoin">btc</option>
					<option value="ethereum">eth</option>
					<option value="binancecoin">bnb</option>
				</select>
				<label htmlFor="timeWindows">Choose asset:</label>
				<select value={timeWindowValue} name="timeWindows" onChange={e => setTimeWindowValue(e.target.value)}>
					<option value="24H">24H</option>
					<option value="1W">1W</option>
					<option value="1M">1M</option>
					<option value="1Y">1Y</option>
				</select>
			</div>
			{isError ? (
				<p>error!</p>
			) : isLoading ? (
				<p>loading</p>
			) : (
				<PriceChartContainer height={375} width={500} chartHeight={240} />
			)}
			{/* <pre>{prices && JSON.parse(prices)}</pre> */}
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	gap: 1rem;

	height: 100vh;
`;
