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

const niceBlue = '#004E98';

const bet365Gray = {
	100: '#585858',
	200: '#505050',
	300: '#404040',
	400: '#383838',
	500: '#333333',
	600: '#303030',
	hover: '#636363',
};

const gray = {
	5: '#CED4DA',
	10: '#ADB5BD',
	50: '#6C757D',
	100: '#495057',
	200: '#343A40',
	300: '#212529',
	hover: '#6C757D',
};

const darkerGray = {
	5: '#CED4DA',
	10: '#ADB5BD',
	50: '#6C757D',
	100: '#252525',
	200: '#202020',
	300: '#151515',
	hover: '#303030',
};

const bet365Text = {
	100: 'white',
	200: '#dddddd',
};

const neutral = {
	100: '#ffffff',
	200: '#f4f5f7',
	300: '#e1e1e1',
	400: '#737581',
	500: '#4a4b53',
	600: '#000000',
};

type Theme = {
	colors: object;
	text: object;
	background: {
		primary: string;
		secondary: string;
		tertiary: string;
		quaternary?: string;
		quinary?: string;
		senary?: string;
	};
	typeScale: object;
	font: object;
};

export const bet365Theme: DefaultTheme = {
	colors: {
		primary: bet365Green,
		primaryHover: bet365Gray.hover,
		secondary: bet365Yellow,
		tertiary: bet365GreenHover,
		gray: bet365Gray,
	},
	text: {
		primary: bet365Text[100],
		secondary: bet365Text[200],
	},
	font: {
		primary: primaryFont,
	},
	typeScale: typeScale,
};

export const blueTheme: DefaultTheme = {
	colors: {
		primary: '#06283D',
		primaryHover: gray.hover,
		secondary: '#1363DF',
		tertiary: '#47B5FF',
		gray: gray,
		green: '#31D0AA',
		red: '#ED4B9E',
	},
	text: {
		primary: bet365Text[100],
		secondary: bet365Text[200],
	},
	font: {
		primary: primaryFont,
	},
	typeScale: typeScale,
};

export const blackTheme: Theme = {
	colors: {
		primary: '#08B2E3',
		primaryHover: darkerGray.hover,
		secondary: '#EDF7F6',
		tertiary: '#47B5FF',
		gray: darkerGray,
		green: '#31D0AA',
		red: '#ED4B9E',
	},
	text: {
		primary: bet365Text[100],
		secondary: bet365Text[200],
	},
	background: {
		primary: '#151515',
		secondary: '#202020',
		tertiary: '#262626',
		quaternary: '#353535',
		quinary: '#444444',
		senary: '#606060',
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

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type=number] {
		-moz-appearance: textfield;
	}
`;
