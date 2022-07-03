import { useQuery } from 'react-query';

const secondsInADay = 60 * 24;
const secondsInAWeek = 60 * 24 * 7;
const secondsInAMonth = 60 * 24 * 7 * 30;
const secondsInAYear = 60 * 24 * 7 * 30 * 12;

const priceFetcher = async ({ queryKey }: any) => {
	console.log("aaaaahhhhh i'm fetchingggggg");

	const [_key, { asset0, asset1, timespan }] = queryKey;
	let subtractValue;
	if (timespan === '1W') {
		subtractValue = secondsInAWeek;
	} else if (timespan === '1M') {
		subtractValue = secondsInAMonth;
	} else if (timespan === '1Y') {
		subtractValue = secondsInAYear;
	} else {
		subtractValue = secondsInADay;
	}

	const to = Math.floor(new Date().getTime() / 1000);
	const from = to - subtractValue;
	const url = `https://api.coingecko.com/api/v3/coins/${asset0}/market_chart/range?vs_currency=${asset1}&from=${from}&to=${to}`;

	const response = await fetch(url);
	let prices: number[][] = (await response.json()).prices;

	// do processing here
	const processedPrices = prices.map(moment => {
		return {
			time: new Date(moment[0]),
			value: moment[1],
		};
	});

	return processedPrices;
};

export const useFetchPrices = (asset0: string, asset1: string, timespan: string) => {
	const { isLoading, isError, data } = useQuery(['prices', { asset0, asset1, timespan }], priceFetcher, {
		staleTime: Infinity,
	});

	return {
		prices: data,
		isLoading,
		isError,
	};
};
