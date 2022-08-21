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

const someText = {
	100: 'white',
	200: '#dddddd',
};

type Theme = {
	colors: {
		primary: string;
		primaryHover: string;
		secondary: string;
		tertiary: string;
		gray?: object;
		red?: string;
		green?: string;
	};
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

export const blackTheme: Theme = {
	colors: {
		primary: '#08B2E3',
		primaryHover: darkerGray.hover,
		secondary: '#EDF7F6',
		tertiary: '#47B5FF',
		gray: darkerGray,
	},
	text: {
		primary: someText[100],
		secondary: someText[200],
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
