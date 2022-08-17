import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider, darkTheme, midnightTheme } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { blackTheme, bet365Theme, blueTheme, GlobalStyle } from '../design/themes';
import Layout from '../components/Layout';
import { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const FallbackProviderContext = createContext<any>('');

const { chains, provider } = configureChains(
	[chain.rinkeby, chain.polygon, chain.polygonMumbai],
	[alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: 'My RainbowKit App',
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
	const [fallbackProvider, setFallbackProvider] = useState(new ethers.providers.JsonRpcProvider(process.env.mumbai));
	// useEffect(() => {
	// 	const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
	// 	setFallbackProvider(provider);
	// }, []);
	return (
		<ThemeProvider theme={blackTheme}>
			<GlobalStyle />
			<QueryClientProvider client={queryClient}>
				<WagmiConfig client={wagmiClient}>
					<RainbowKitProvider
						chains={chains}
						theme={darkTheme({
							accentColor: blackTheme.colors.primary,
							accentColorForeground: 'white',
							borderRadius: 'small',
							fontStack: 'system',
						})}
					>
						<FallbackProviderContext.Provider value={fallbackProvider}>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</FallbackProviderContext.Provider>
					</RainbowKitProvider>
				</WagmiConfig>
				{/* <ReactQueryDevtools initialIsOpen={false} /> */}
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default MyApp;
