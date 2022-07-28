import { useQuery } from 'react-query';

const priceFetcher = async ({ queryKey }: any) => {
  const [_key, { assets }] = queryKey;

  let assetsString = '';

  for (const asset of assets) {
    assetsString += asset + '%2C';
  }
  assetsString = assetsString.slice(0, assetsString.length - 3);

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${assetsString}&vs_currencies=usd&include_24hr_change=true`;

  const response = await fetch(url);

  return response.json();
};

export const useFetchPrices = (assets: string[]) => {
  const { isLoading, isError, data } = useQuery(
    ['prices', { assets }],
    priceFetcher,
    {
      staleTime: Infinity,
    }
  );

  return {
    prices: data,
    isLoading,
    isError,
  };
};
