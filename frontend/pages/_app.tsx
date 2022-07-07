import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { blackTheme, bet365Theme, blueTheme, GlobalStyle } from '../design/themes';
import Layout from '../components/Layout';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider theme={blackTheme}>
			<GlobalStyle />
			<QueryClientProvider client={queryClient}>
				<Layout>
					<Component {...pageProps} />
				</Layout>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default MyApp;
