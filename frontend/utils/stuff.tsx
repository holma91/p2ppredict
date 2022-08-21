import styled from 'styled-components';
import { assetToImage } from './misc';

const StyledChoice = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	img {
		height: 20px;
		width: 20px;
	}
`;

export const mumbaiOptions = [
	{
		value: 'matic',
		label: (
			<StyledChoice>
				<img src={assetToImage['matic']} alt="logo" />
				<span>MATIC</span>
			</StyledChoice>
		),
	},
	{
		value: 'btc',
		label: (
			<StyledChoice>
				<img src={assetToImage['btc']} alt="logo" />
				<span>BTC</span>
			</StyledChoice>
		),
	},
	{
		value: 'eth',
		label: (
			<StyledChoice>
				<img src={assetToImage['eth']} alt="logo" />
				<span>ETH</span>
			</StyledChoice>
		),
	},
	{
		value: 'usdc',
		label: (
			<StyledChoice>
				<img src={assetToImage['usdc']} alt="logo" />
				<span>USDC</span>
			</StyledChoice>
		),
	},
	{
		value: 'usdt',
		label: (
			<StyledChoice>
				<img src={assetToImage['usdt']} alt="logo" />
				<span>USDT</span>
			</StyledChoice>
		),
	},
];

export const rinkebyOptions = [
	{
		value: 'matic',
		label: (
			<StyledChoice>
				<img src={assetToImage['matic']} alt="logo" />
				<span>MATIC</span>
			</StyledChoice>
		),
	},
	{
		value: 'btc',
		label: (
			<StyledChoice>
				<img src={assetToImage['btc']} alt="logo" />
				<span>BTC</span>
			</StyledChoice>
		),
	},
	{
		value: 'eth',
		label: (
			<StyledChoice>
				<img src={assetToImage['eth']} alt="logo" />
				<span>ETH</span>
			</StyledChoice>
		),
	},
	{
		value: 'usdc',
		label: (
			<StyledChoice>
				<img src={assetToImage['usdc']} alt="logo" />
				<span>USDC</span>
			</StyledChoice>
		),
	},
	{
		value: 'link',
		label: (
			<StyledChoice>
				<img src={assetToImage['link']} alt="logo" />
				<span>LINK</span>
			</StyledChoice>
		),
	},
	{
		value: 'atom',
		label: (
			<StyledChoice>
				<img src={assetToImage['atom']} alt="logo" />
				<span>ATOM</span>
			</StyledChoice>
		),
	},
	{
		value: 'bnb',
		label: (
			<StyledChoice>
				<img src={assetToImage['bnb']} alt="logo" />
				<span>BNB</span>
			</StyledChoice>
		),
	},
];

export const polygonOptions = [
	{
		value: 'matic',
		label: (
			<StyledChoice>
				<img src={assetToImage['matic']} alt="logo" />
				<span>MATIC</span>
			</StyledChoice>
		),
	},
	{
		value: 'btc',
		label: (
			<StyledChoice>
				<img src={assetToImage['btc']} alt="logo" />
				<span>BTC</span>
			</StyledChoice>
		),
	},
	{
		value: 'eth',
		label: (
			<StyledChoice>
				<img src={assetToImage['eth']} alt="logo" />
				<span>ETH</span>
			</StyledChoice>
		),
	},
	{
		value: 'usdc',
		label: (
			<StyledChoice>
				<img src={assetToImage['usdc']} alt="logo" />
				<span>USDC</span>
			</StyledChoice>
		),
	},
	{
		value: 'usdt',
		label: (
			<StyledChoice>
				<img src={assetToImage['usdt']} alt="logo" />
				<span>USDT</span>
			</StyledChoice>
		),
	},
	{
		value: 'link',
		label: (
			<StyledChoice>
				<img src={assetToImage['link']} alt="logo" />
				<span>LINK</span>
			</StyledChoice>
		),
	},
	{
		value: 'aave',
		label: (
			<StyledChoice>
				<img src={assetToImage['aave']} alt="logo" />
				<span>AAVE</span>
			</StyledChoice>
		),
	},
	{
		value: 'ada',
		label: (
			<StyledChoice>
				<img src={assetToImage['ada']} alt="logo" />
				<span>ADA</span>
			</StyledChoice>
		),
	},
	{
		value: 'ape',
		label: (
			<StyledChoice>
				<img src={assetToImage['ape']} alt="logo" />
				<span>APE</span>
			</StyledChoice>
		),
	},
	{
		value: 'avax',
		label: (
			<StyledChoice>
				<img src={assetToImage['avax']} alt="logo" />
				<span>AVAX</span>
			</StyledChoice>
		),
	},
	{
		value: 'atom',
		label: (
			<StyledChoice>
				<img src={assetToImage['atom']} alt="logo" />
				<span>ATOM</span>
			</StyledChoice>
		),
	},
	{
		value: 'bnb',
		label: (
			<StyledChoice>
				<img src={assetToImage['bnb']} alt="logo" />
				<span>BNB</span>
			</StyledChoice>
		),
	},
	{
		value: 'sol',
		label: (
			<StyledChoice>
				<img src={assetToImage['sol']} alt="logo" />
				<span>SOL</span>
			</StyledChoice>
		),
	},
	{
		value: 'yfi',
		label: (
			<StyledChoice>
				<img src={assetToImage['yfi']} alt="logo" />
				<span>YFI</span>
			</StyledChoice>
		),
	},
	{
		value: 'axs',
		label: (
			<StyledChoice>
				<img src={assetToImage['axs']} alt="logo" />
				<span>AXS</span>
			</StyledChoice>
		),
	},
	{
		value: 'crv',
		label: (
			<StyledChoice>
				<img src={assetToImage['crv']} alt="logo" />
				<span>CRV</span>
			</StyledChoice>
		),
	},
	{
		value: 'doge',
		label: (
			<StyledChoice>
				<img src={assetToImage['doge']} alt="logo" />
				<span>DOGE</span>
			</StyledChoice>
		),
	},
	{
		value: 'dai',
		label: (
			<StyledChoice>
				<img src={assetToImage['dai']} alt="logo" />
				<span>DAI</span>
			</StyledChoice>
		),
	},
	{
		value: 'dot',
		label: (
			<StyledChoice>
				<img src={assetToImage['dot']} alt="logo" />
				<span>DOT</span>
			</StyledChoice>
		),
	},
];
