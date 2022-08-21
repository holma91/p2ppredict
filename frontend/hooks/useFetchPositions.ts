import { useQuery } from 'react-query';
import { priceFeedToSymbol } from '../utils/misc';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { Position } from '../types';
import { formatDate } from '../utils/helpers';
import { ethers } from 'ethers';
import { useAccount, useNetwork } from 'wagmi';
import { exchangeAddresses, predictionMarketAddresses } from '../utils/addresses';

const rpcs: { [key: string]: string } = {
	rinkeby: 'https://rpc.ankr.com/eth_rinkeby',
	matic: 'https://polygon-mainnet.public.blastapi.io',
	maticmum: 'https://polygon-testnet.public.blastapi.io',
};

const getStatus = (strikePrice: any, currentPrice: any, over: boolean) => {
	if (over) {
		if (currentPrice.lt(strikePrice)) {
			return 'LOSING';
		} else {
			return 'WINNING';
		}
	} else {
		if (strikePrice.lt(currentPrice)) {
			return 'LOSING';
		} else {
			return 'WINNING';
		}
	}
};

const fetcher = async (address: string, activeChain: string) => {
	const provider = ethers.getDefaultProvider(rpcs[activeChain]);

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

	const [predictions, latestAnswers] = await predictionMarket.getPredictionsByAccount(address);
	const makerAsks = await exchange.getMakerAsksByAccount(address);

	const listPriceById: { [key: string]: any } = {};
	for (const ask of makerAsks) {
		listPriceById[ask[0].toString()] = ask[1];
	}

	const unlistedPositions: Position[] = [];
	const listedPositions: Position[] = [];

	for (let i = 0; i < predictions.length; i++) {
		let marketInfo = predictions[i][0];
		let market = priceFeedToSymbol[activeChain][marketInfo.priceFeed];

		let position: Position = {
			timestamp: parseInt(marketInfo.expiry),
			asset: market,
			side: predictions[i].over ? 'OVER' : 'UNDER',
			strikePrice: ethers.utils.formatUnits(marketInfo.strikePrice, 8),
			expiry: formatDate(marketInfo.expiry.toString()),
			tokenId: predictions[i].id.toString(),
			size: ethers.utils.formatUnits(marketInfo.collateral, 18),
			status: getStatus(marketInfo.strikePrice, latestAnswers[i], predictions[i].over),
			latestAnswer: ethers.utils.formatUnits(latestAnswers[i].toString(), 8),
		};
		if (position.tokenId in listPriceById) {
			position.listPrice = ethers.utils.formatUnits(listPriceById[position.tokenId].toString(), 18);
			listedPositions.push(position);
			listedPositions.sort(function (a: Position, b: Position) {
				return a.timestamp - b.timestamp;
			});
		} else {
			unlistedPositions.push(position);
			unlistedPositions.sort(function (a: Position, b: Position) {
				return a.timestamp - b.timestamp;
			});
		}
	}

	return { listedPositions, unlistedPositions };
};

export const useFetchPositions = () => {
	const { address } = useAccount();
	const { chain } = useNetwork();
	const activeChain = chain?.network;

	const { isLoading, isError, data } = useQuery(
		['positions', address, activeChain],
		() => fetcher(address as string, activeChain as string),
		{
			enabled: !!address && !!activeChain,
		}
	);

	return {
		positions: data,
		isLoading,
		isError,
	};
};
