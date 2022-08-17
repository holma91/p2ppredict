import { useQuery } from 'react-query';
import { priceFeedToSymbol, symbolToCoingeckoId, symbolToPriceFeed } from '../utils/misc';
import { mumbai } from '../../contracts/scripts/addresses';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

const fetcher = async (asset: string, activeAddress: string, fallbackProvider: ethers.providers.JsonRpcProvider) => {
	console.log(fallbackProvider);
	const priceFeed = symbolToPriceFeed.mumbai[asset];

	if (!priceFeed) {
		console.log('pricefeed for ', asset, ' not available');
		return '';
	}
	// set up market and exchange
	let predictionMarket = new ethers.Contract(mumbai.predictionMarket, PredictionMarket.abi, fallbackProvider);
	let exchange = new ethers.Contract(mumbai.exchange, Exchange.abi, fallbackProvider);
	console.log(predictionMarket);

	// get predictions and makerasks
	const [predictions, latestAnswer] = await predictionMarket.getPredictionsByFeed(priceFeed);

	const [makerAsks, signers] = await exchange.getMakerAsksByFeed(priceFeed);

	const listPriceById: { [key: string]: any } = {};
	for (let i = 0; i < makerAsks.length; i++) {
		console.log(activeAddress.toLowerCase(), signers[i].toLowerCase());
		console.log(activeAddress.toLowerCase() === signers[i].toLowerCase());

		if (activeAddress.toLowerCase() === signers[i].toLowerCase()) {
			continue;
		}
		listPriceById[makerAsks[i][0].toString()] = makerAsks[i][1];
	}

	let markets: { [key: string]: any } = {};
	let count = 0;
	for (const prediction of predictions) {
		// check if there is a makerAsk with prediction.id
		let price = listPriceById[prediction.id.toString()];
		if (!price) continue;

		let marketInfo = prediction.market;
		let market = priceFeedToSymbol.mumbai[marketInfo.priceFeed];
		let key = `${marketInfo.priceFeed.toString()}:${marketInfo.strikePrice.toString()}:${marketInfo.expiry.toString()}`;
		if (!(key in markets)) {
			markets[key] = {
				asset: asset,
				strike: ethers.utils.formatUnits(marketInfo.strikePrice, 8).toString(),
				// strike: tronWeb.fromSun(marketInfo.strikePrice).toString(),
				expiry: marketInfo.expiry.toString(),
				id: count++,
				latestAnswer: ethers.utils.formatUnits(latestAnswer, 8).toString(),
				over: [],
				under: [],
			};
		}

		// odds = collateral / price
		// use fromSun to scale down

		let odds = ethers.utils.formatUnits(
			prediction.market.collateral
				.mul(10 ** 8)
				.div(price)
				.toString(),
			8
		);

		if (prediction.over) {
			markets[key].over.push({
				asset: markets[key].asset,
				odds: odds,
				price: price.toString(),
				id: prediction.id.toString(),
			});
			markets[key].over.sort(function (a: any, b: any) {
				return parseFloat(b.odds) - parseFloat(a.odds);
			});
		} else {
			markets[key].under.push({
				asset: markets[key].asset,
				odds: odds,
				price: price.toString(),
				id: prediction.id.toString(),
			});
			markets[key].under.sort(function (a: any, b: any) {
				return parseFloat(b.odds) - parseFloat(a.odds);
			});
		}
	}

	return markets;
};

export const useFetchMarkets = (
	asset: string,
	activeAddress: string,
	fallbackProvider: ethers.providers.JsonRpcProvider
) => {
	const { address, isConnecting, isDisconnected } = useAccount();
	const { isLoading, isError, data } = useQuery(
		['markets', asset, address],
		() => fetcher(asset, address as string, fallbackProvider),
		{
			enabled: !!fallbackProvider && !!address,
		}
	);

	return {
		markets: data,
		isLoading,
		isError,
	};
};
