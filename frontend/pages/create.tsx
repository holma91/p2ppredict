import type { NextPage } from 'next';
import { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import PriceChartContainer from '../components/Chart/PriceChartContainer';
import Banner from '../components/Banner';
import { FiExternalLink } from 'react-icons/fi';
import { useNetwork } from 'wagmi';

const MakerThing = dynamic(() => import('../components/MakerThing'), {
	ssr: false,
});

const Container = styled.div`
	display: grid;
	grid-template-columns: 5fr 2fr;

	@media (max-width: 1500px) {
		grid-template-columns: 4fr 2fr;
	}

	@media (max-width: 1400px) {
		grid-template-columns: 5fr 3fr;
	}

	@media (max-width: 1200px) {
		grid-template-columns: 3fr 2fr;
	}

	@media (max-width: 1100px) {
		grid-template-columns: 4fr 3fr;
	}

	@media (max-width: 1000px) {
		grid-template-columns: 4fr 4fr;
	}

	@media (max-width: 900px) {
		grid-template-columns: 1fr;
	}
`;

const Maker: NextPage = () => {
	const { chain, chains } = useNetwork();
	const [asset, setAsset] = useState('btc');
	const asset1 = { symbol: 'usd', coingeckoId: 'usd' };
	const [txHash, setTxHash] = useState('');
	const [connectMessage, setConnectMessage] = useState('');

	const explorer =
		chain?.network === 'rinkeby'
			? 'https://rinkeby.etherscan.io/tx'
			: chain?.network === 'maticmum'
			? 'https://mumbai.polygonscan.com/tx'
			: 'https://polygonscan.com/tx';

	const dimensions = {
		height: '84%',
		width: '100%',
		chartHeight: 'calc(100% - 125px)',
	};

	return (
		<>
			{connectMessage !== '' && (
				<NewTx>
					<p>{connectMessage}</p>
				</NewTx>
			)}
			{txHash !== '' && (
				<NewTx>
					<a href={`${explorer}/${txHash}`} target="_blank" rel="noreferrer">
						Tx Hash: {txHash} <FiExternalLink />
					</a>
				</NewTx>
			)}
			<Container>
				<Left>
					<Banner
						showAll={false}
						bannerChoice={asset}
						fullWidth={false}
						setBannerChoice={setAsset}
						setActive={() => {}}
					/>
					<PriceChartContainer
						height={dimensions.height}
						width={dimensions.width}
						chartHeight={dimensions.chartHeight}
						asset0={asset}
						asset1={asset1}
					></PriceChartContainer>
				</Left>
				<Right>
					<MakerThing
						asset={asset}
						setAsset={setAsset}
						setTxHash={setTxHash}
						setConnectMessage={setConnectMessage}
					/>
				</Right>
			</Container>
		</>
	);
};

const Left = styled.div`
	display: flex;
	flex-direction: column;
	/* padding: 0.5rem 1rem; */
	padding-top: 0.5rem;
	padding-left: 1rem;
	height: calc(105vh - 58.78px);
	/* height: 90%; */
	background-color: ${({ theme }) => theme.background.primary};

	overflow-y: scroll;
	color: ${({ theme }) => theme.text.secondary};
	@media (max-width: 900px) {
		display: none;
	}
`;

const Right = styled.div`
	padding: 0.5rem 1rem;
	height: calc(105vh - 58.78px);
	overflow-y: scroll;

	display: flex;
	/* flex-direction: column; */
	justify-content: center;
	/* align-items: center; */

	background-color: ${({ theme }) => theme.background.primary};

	@media (max-width: 400px) {
		padding: 0.5rem 0;
	}
`;

const NewTx = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	width: 100vw;
	padding-top: 1rem;
	padding-bottom: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;

	a {
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		padding-bottom: 0.1rem;
		/* border-bottom: 2px solid ${({ theme }) => theme.colors.primary}; */
		:hover {
			color: ${({ theme }) => theme.colors.primary};
		}
	}
	svg {
		width: 22px;
	}
	p {
		color: white;
		font-weight: 500;
		padding-bottom: 0.1rem;
	}
`;

export default Maker;
