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

const uploadSVGToIpfs = async (svg: string) => {
	const ipfs = ipfsClient.create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: auth,
		},
	});

	const { cid }: { cid: any } = await ipfs.add({ content: svg }, ipfsAddOptions);

	const svgURI = ensureIpfsUriPrefix(cid);

	return svgURI;
};

const uploadMetadataToIpfs = async (metadata: any) => {
	const ipfs = ipfsClient.create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: auth,
		},
	});

	const { cid }: { cid: any } = await ipfs.add(
		{ path: '/nft/metadata.json', content: JSON.stringify(metadata) },
		ipfsAddOptions
	);

	const metadataURI = ensureIpfsUriPrefix(cid) + '/metadata.json';

	return metadataURI;
};

const createSvg = (market: Market, choices: Choices) => {
	let asset = priceFeedToSymbol.mumbai[market.priceFeed];

	return `<svg
      width="350"
      height="350"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="350" height="350" fill="white" />
      <text x="50%" y="49" font-size="24" font-weight="300" dominant-baseline="middle" text-anchor="middle">
      ${asset.toUpperCase()} ${choices.over ? 'OVER' : 'UNDER'}
      </text>
      <line x1="40" y1="73" x2="310" y2="73" stroke="black" stroke-width="1.5" dominant-baseline="middle" text-anchor="middle" />
      <text x="50%" y="110" font-size="22" font-weight="200" dominant-baseline="middle" text-anchor="middle">
        Price Feed: ${asset.toUpperCase()}/USD
      </text>
      <text x="50%" y="155" font-size="22" font-weight="200" dominant-baseline="middle" text-anchor="middle">
        Strike Price: $${ethers.utils.formatUnits(market.strikePrice, 8)}
      </text>
      <text x="50%" y="200" font-size="22" font-weight="200" dominant-baseline="middle" text-anchor="middle">
        Value: ${ethers.utils.formatEther(market.collateral)} MATIC
      </text>
      <text x="50%" y="245" font-size="22" font-weight="200" dominant-baseline="middle" text-anchor="middle">
        Expiry: ${formatDate(market.expiry.toString())}
      </text>
    </svg>`;
};

const generateMetadata = (market: Market, choices: Choices, svgURI: string) => {
	const asset = priceFeedToSymbol.mumbai[market.priceFeed].toUpperCase();
	return {
		description: `A prediction on p2ppredict.xyz regarding the value of ${asset}`,
		name: `${choices.over ? 'OVER' : 'UNDER'} ${asset}/USD`,
		image: svgURI,
		attributes: [
			{
				trait_type: 'Asset',
				value: asset,
			},
			{
				trait_type: 'Strike Price',
				value: `$${ethers.utils.formatUnits(market.strikePrice, 8)}`,
			},
			{
				trait_type: 'Value',
				value: `${ethers.utils.formatEther(market.collateral)} MATIC`,
			},
			{
				trait_type: 'Expiry',
				value: formatDate(market.expiry.toString()),
			},
			{
				trait_type: 'Direction',
				value: choices.over ? 'OVER' : 'UNDER',
			},
		],
	};
};

export { generateMetadata, uploadSVGToIpfs, uploadMetadataToIpfs, createSvg };
