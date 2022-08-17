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
