import { ethers } from 'ethers';

export type Token = {
	symbol: string;
	coingeckoId: string;
};

export type Position = {
	timestamp: number;
	asset: string;
	side: string;
	strikePrice: string;
	expiry: string;
	tokenId: string;
	size: string;
	listPrice?: string;
	latestAnswer?: string;
	status?: 'WINNING' | 'LOSING';
};

export type Market = {
	priceFeed: string;
	strikePrice: ethers.BigNumber;
	collateral: ethers.BigNumber;
	expiry: ethers.BigNumber;
	ipfsOver: string;
	ipfsUnder: string;
};

export type Choices = {
	over: Boolean;
	endTime: ethers.BigNumber;
	listPrice: string | ethers.BigNumber;
	tresholdPrice: ethers.BigNumber;
};

export type TakerBid = {
	taker: string;
	price: ethers.BigNumber;
	collection: string;
	tokenId: string;
};
