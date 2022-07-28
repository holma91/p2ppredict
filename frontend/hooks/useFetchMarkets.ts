import { useQuery } from 'react-query';
import {
  priceFeedToSymbol,
  symbolToCoingeckoId,
  symbolToPriceFeed,
} from '../utils/misc';
import { nile, mainnet } from '../../contracts/scripts/addresses';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';

const fetcher = async (asset: string, tronWebUser: any, tronWeb: any) => {
  let address = '';
  if (
    tronWebUser &&
    tronWebUser.defaultAddress &&
    tronWebUser.defaultAddress.base58
  ) {
    address = tronWebUser.defaultAddress.base58;
  }

  const priceFeed = symbolToPriceFeed.mainnet[asset];
  if (!priceFeed) {
    console.log('pricefeed for ', asset, ' not available');
    return '';
  }

  let predictionMarket = await tronWeb.contract(
    PredictionMarket.abi,
    mainnet.predictionMarket
  );
  let exchange = await tronWeb.contract(Exchange.abi, mainnet.exchange);

  const [predictions, latestAnswer] = await predictionMarket
    .getPredictionsByFeed(priceFeed)
    .call();

  const [makerAsks, signers] = await exchange
    .getMakerAsksByFeed(priceFeed)
    .call();

  const listPriceById: { [key: string]: any } = {};
  for (let i = 0; i < makerAsks.length; i++) {
    if (address === tronWeb.address.fromHex(signers[i])) {
      continue;
    }
    listPriceById[makerAsks[i][0].toString()] = makerAsks[i][1];
  }
  // for (const ask of makerAsks) {
  //   listPriceById[ask[0].toString()] = ask[1];
  // }

  let markets: { [key: string]: any } = {};
  let count = 0;
  for (const prediction of predictions) {
    // check if there is a makerAsk with prediction.id
    let price = listPriceById[prediction.id.toString()];
    if (!price) continue;

    let marketInfo = prediction.market;
    let market =
      priceFeedToSymbol.mainnet[tronWeb.address.fromHex(marketInfo.priceFeed)];
    let key = `${marketInfo.priceFeed.toString()}:${marketInfo.strikePrice.toString()}:${marketInfo.expiry.toString()}`;
    if (!(key in markets)) {
      markets[key] = {
        asset: asset,
        strike: tronWeb.fromSun(marketInfo.strikePrice).toString(),
        expiry: marketInfo.expiry.toString(),
        id: count++,
        latestAnswer: tronWeb.fromSun(latestAnswer.toString()),
        over: [],
        under: [],
      };
    }

    // odds = collateral / price
    // use fromSun to scale down

    let odds = tronWeb.fromSun(
      prediction.market.collateral
        .mul(10 ** 6)
        .div(price)
        .toString()
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

  // get all asset predictions from pm
  // get all makerAsks from e
  // match together into

  // match every ask with a prediction

  return markets;
  // return allMarkets[asset];
};

export const useFetchMarkets = (
  asset: string,
  tronWeb: any,
  tronWebFallback: any
) => {
  const { isLoading, isError, data } = useQuery(
    ['markets', asset],
    () => fetcher(asset, tronWeb, tronWebFallback),
    {
      enabled: !!tronWebFallback,
    }
  );

  return {
    markets: data,
    isLoading,
    isError,
  };
};
