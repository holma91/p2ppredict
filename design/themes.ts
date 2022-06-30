import { createGlobalStyle, DefaultTheme } from 'styled-components';

const primaryFont = `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;`;

const typeScale = {
  header1: '1.8rem',
  header2: '1.6rem',
  header3: '1.4rem',
  header4: '1.2rem',
  header5: '1.1rem',
  header6: '1rem',
  paragraph: '1rem',
  smallParagraph: '0.92rem',
  helperText: '0.8rem',
  copyrightText: '0.7rem',
};

const purple = {
  100: '#A679DC',
  200: '#8D53D2',
  300: '#742DC8',
  400: '#5F25A4',
  500: '#050449',
};

const bet365Green = '#126e51';
const bet365GreenHover = '#26ffbe';
const bet365Yellow = '#FFE418';

const bet365Gray = {
  100: '#585858',
  200: '#505050',
  300: '#404040',
  400: '#383838',
  500: '#333333',
  600: '#303030',
};

const neutral = {
  100: '#ffffff',
  200: '#f4f5f7',
  300: '#e1e1e1',
  400: '#737581',
  500: '#4a4b53',
  600: '#000000',
};

export const bet365Theme: DefaultTheme = {
  colors: {
    primary: bet365Green,
    secondary: bet365Yellow,
    tertiary: bet365GreenHover,
    gray: bet365Gray,
  },
  text: {},
  font: {
    primary: primaryFont,
  },
  typeScale: typeScale,
};

export const defaultTheme: DefaultTheme = {
  colors: {
    primary: purple[200],
    primaryHover: purple[300],
    primaryActive: purple[100],
    secondary: '#0070f3',
  },
  font: {
    primary: primaryFont,
  },
  typeScale: typeScale,
};

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }

  blockquote,
  dl,
  dd,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  figure,
  p,
  pre {
    margin: 0;
  }

  ol,
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;
