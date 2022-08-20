import { useQuery } from 'react-query';
import { priceFeedToSymbol, symbolToCoingeckoId, symbolToPriceFeed } from '../utils/misc';
import { mumbai } from '../../contracts/scripts/addresses';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { ethers } from 'ethers';
import { useAccount, useNetwork } from 'wagmi';
import { exchangeAddresses, predictionMarketAddresses } from '../utils/addresses';
declare var window: any;

const rpcs: { [key: string]: string } = {
	rinkeby: 'https://rpc.ankr.com/eth_rinkeby',
	matic: 'https://polygon-mainnet.public.blastapi.io',
	maticmum: 'https://polygon-testnet.public.blastapi.io',
};

const fetcher = async (asset: string, activeAddress: string, activeChain: string) => {
	const provider = ethers.getDefaultProvider(rpcs[activeChain]);
	const priceFeed = symbolToPriceFeed[activeChain][asset];

	if (!priceFeed) {
		console.log('pricefeed for ', asset, ' not available');
		return '';
	}

	// set up market and exchange
	let predictionMarket = new ethers.Contract(
		predictionMarketAddresses[activeChain ? activeChain : 'rinkeby'],
		PredictionMarket.abi,
		provider
	);
	let exchange = new ethers.Contract(
		exchangeAddresses[activeChain ? activeChain : 'rinkeby'],
		Exchange.abi,
		provider
	);
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

export const useFetchMarkets = (asset: string) => {
	const { address, isConnecting, isDisconnected } = useAccount();
	const { chain, chains } = useNetwork();
	const activeChain = chain?.network;

	const { isLoading, isError, data } = useQuery(
		['markets', asset, address, activeChain],
		() => fetcher(asset, address ? (address as string) : '0x0', activeChain ? activeChain : 'rinkeby'),
		{
			enabled: !!address && !!activeChain,
		}
	);

	return {
		markets: data,
		isLoading,
		isError,
	};
};
