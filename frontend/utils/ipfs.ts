// import * as fs from 'fs';
// import * as path from 'path';
import * as ipfsClient from 'ipfs-http-client';
import { ethers } from 'ethers';
import { priceFeedToSymbol } from './misc';
import { Choices, Market } from '../types';
import { formatDate } from './helpers';

const ipfsAddOptions: any = {
	cidVersion: 1,
	hashAlg: 'sha2-256',
};

const auth = 'Basic ' + Buffer.from(process.env.ipfsProjectId + ':' + process.env.ipfsProjectSecret).toString('base64');

function ensureIpfsUriPrefix(cidOrURI: string) {
	let uri = cidOrURI.toString();
	if (!uri.startsWith('ipfs://')) {
		uri = 'ipfs://' + cidOrURI;
	}

	if (uri.startsWith('ipfs://ipfs/')) {
		uri = uri.replace('ipfs://ipfs/', 'ipfs://');
	}
	return uri;
}

const uploadSVGToIpfs = async (overSVG: string, underSVG: string) => {
	const ipfs = ipfsClient.create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: auth,
		},
	});

	const { cid: overSVGcid }: { cid: any } = await ipfs.add({ content: overSVG }, ipfsAddOptions);
	const { cid: underSVGcid }: { cid: any } = await ipfs.add({ content: underSVG }, ipfsAddOptions);

	const overSVGURI = ensureIpfsUriPrefix(overSVGcid);
	const underSVGURI = ensureIpfsUriPrefix(underSVGcid);

	return [overSVGURI, underSVGURI];
};

const uploadMetadataToIpfs = async (overMetadata: any, underMetadata: any) => {
	const ipfs = ipfsClient.create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: auth,
		},
	});

	const { cid: overCID }: { cid: any } = await ipfs.add(
		{ path: '/nft/metadata.json', content: JSON.stringify(overMetadata) },
		ipfsAddOptions
	);
	const { cid: underCID }: { cid: any } = await ipfs.add(
		{ path: '/nft/metadata.json', content: JSON.stringify(underMetadata) },
		ipfsAddOptions
	);

	const overMetadataURI = ensureIpfsUriPrefix(overCID) + '/metadata.json';
	const underMetadataURI = ensureIpfsUriPrefix(underCID) + '/metadata.json';

	return [overMetadataURI, underMetadataURI];
};

const createSvg = (market: Market, activeChain: string): string[] => {
	let asset = priceFeedToSymbol[activeChain][market.priceFeed].toUpperCase();
	let collateralAsset = activeChain === 'rinkeby' ? 'ETH' : 'MATIC';
	let chainName = activeChain === 'rinkeby' ? 'Rinkeby' : activeChain === 'maticmum' ? 'Mumbai' : 'Polygon';
	const overSVG = `
	<svg
      width="350"
      height="350"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="350" height="350" fill="black" />
      <text x="50%" y="50" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Price Feed: ${asset}/USD
      </text>
  <text x="50%" y="100" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
        Prediction: OVER
      </text>
      <text x="50%" y="150" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Strike Price: $${ethers.utils.formatUnits(market.strikePrice, 8)}
      </text>
      <text x="50%" y="200" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Value: ${ethers.utils.formatEther(market.collateral)} ${collateralAsset}
      </text>
      <text x="50%" y="250" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Expiry: ${formatDate(market.expiry.toString())}
      </text>
  <text x="50%" y="300" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
        Network: ${chainName}
      </text>
    </svg>
	`;
	const underSVG = `
	<svg
      width="350"
      height="350"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="350" height="350" fill="black" />
      <text x="50%" y="50" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Price Feed: ${asset}/USD
      </text>
  <text x="50%" y="100" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
        Prediction: UNDER
      </text>
      <text x="50%" y="150" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Strike Price: $${ethers.utils.formatUnits(market.strikePrice, 8)}
      </text>
      <text x="50%" y="200" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Value: ${ethers.utils.formatEther(market.collateral)} ${collateralAsset}
      </text>
      <text x="50%" y="250" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
				Expiry: ${formatDate(market.expiry.toString())}
      </text>
  <text x="50%" y="300" font-size="22" font-weight="300" dominant-baseline="middle" text-anchor="middle" fill="white">
        Network: ${chainName}
      </text>
    </svg>
	`;

	return [overSVG, underSVG];
};

const generateMetadata = (market: Market, overSVGURI: string, underSVGURI: string, activeChain: string) => {
	let asset = priceFeedToSymbol[activeChain][market.priceFeed].toUpperCase();
	let collateralAsset = activeChain === 'rinkeby' ? 'ETH' : 'MATIC';
	let chainName = activeChain === 'rinkeby' ? 'Rinkeby' : activeChain === 'maticmum' ? 'Mumbai' : 'Polygon';

	const overMetadata = {
		description: `A prediction on p2ppredict.xyz regarding the value of ${asset}`,
		name: `OVER ${asset}/USD`,
		image: overSVGURI,
		attributes: [
			{
				trait_type: 'Asset',
				value: asset,
			},
			{
				trait_type: 'Prediction',
				value: 'OVER',
			},
			{
				trait_type: 'Strike Price',
				value: `$${ethers.utils.formatUnits(market.strikePrice, 8)}`,
			},
			{
				trait_type: 'Value',
				value: `${ethers.utils.formatEther(market.collateral)} ${collateralAsset}`,
			},
			{
				trait_type: 'Expiry',
				value: formatDate(market.expiry.toString()),
			},
			{
				trait_type: 'Network',
				value: chainName,
			},
		],
	};

	const underMetadata = {
		description: `A prediction on p2ppredict.xyz regarding the value of ${asset}`,
		name: `UNDER ${asset}/USD`,
		image: underSVGURI,
		attributes: [
			{
				trait_type: 'Asset',
				value: asset,
			},
			{
				trait_type: 'Prediction',
				value: 'UNDER',
			},
			{
				trait_type: 'Strike Price',
				value: `$${ethers.utils.formatUnits(market.strikePrice, 8)}`,
			},
			{
				trait_type: 'Value',
				value: `${ethers.utils.formatEther(market.collateral)} ${collateralAsset}`,
			},
			{
				trait_type: 'Expiry',
				value: formatDate(market.expiry.toString()),
			},
			{
				trait_type: 'Network',
				value: chainName,
			},
		],
	};

	return [overMetadata, underMetadata];
};

export { generateMetadata, uploadSVGToIpfs, uploadMetadataToIpfs, createSvg };
