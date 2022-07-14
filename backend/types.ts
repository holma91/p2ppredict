export type MakerAsk = {
  signer: string;
  tokenId: string;
  price: string;
  priceFeed: string;
  tresholdPrice: string;
  strikePrice: string;
  expiry: string;
  marketId: string;
};

export type MakerAskWithCollateral = {
  signer: string;
  tokenId: string;
  price: string;
  priceFeed: string;
  tresholdPrice: string;
  strikePrice: string;
  expiry: string;
  marketId: string;
  collateral: string;
};

export type Market = {
  priceFeed: string;
  strikePrice: string;
  expiry: string;
  collateral: { [key: string]: string };
};

export type MarketWithoutCollateral = {
  priceFeed: string;
  strikePrice: string;
  expiry: string;
};

export type MarketWithAsksType = {
  market: MarketWithoutCollateral;
  makerAsks: { [key: string]: MakerAskWithCollateral };
};
