import type { AppProps } from 'next/app'
import { ThemeProvider } from "styled-components";
import { defaultTheme, GlobalStyle } from '../design/themes';
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}

export default MyApp
