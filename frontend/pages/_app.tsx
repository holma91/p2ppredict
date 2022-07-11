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

const { chains, provider } = configureChains(
	[chain.mainnet, chain.rinkeby, chain.polygon],
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
	return (
		<ThemeProvider theme={blackTheme}>
			<GlobalStyle />
			<QueryClientProvider client={queryClient}>
				<WagmiConfig client={wagmiClient}>
					<RainbowKitProvider
						chains={chains}
						theme={midnightTheme({
							accentColor: '#7b3fe4',
							accentColorForeground: 'white',
							borderRadius: 'small',
							fontStack: 'system',
						})}
					>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</RainbowKitProvider>
				</WagmiConfig>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default MyApp;
