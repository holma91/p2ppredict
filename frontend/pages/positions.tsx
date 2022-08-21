import { useState } from 'react';
import styled from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';
import { useFetchPositions } from '../hooks/useFetchPositions';
import { assetToImage, assetToName } from '../utils/misc';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import { Position } from '../types';
import { useNetwork } from 'wagmi';
import { predictionMarketAddresses } from '../utils/addresses';
import { ethers } from 'ethers';
import { Spinner } from '../components/Spinner';
declare var window: any;

const Outer = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.secondary};
	font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 1rem;
	min-height: 100vh;
	padding-bottom: 2rem;
`;

const Container = styled.div`
	width: 1250px;
	display: flex;
	flex-direction: column;
	padding: 2rem 3.5rem;
	padding-bottom: 0;

	@media (max-width: 1200px) {
		width: 1000px;
	}

	@media (max-width: 930px) {
		width: 950px;
	}

	@media (max-width: 900px) {
		width: 900px;
	}
`;

const Headah = styled.div`
	p {
		font-size: ${({ theme }) => theme.typeScale.header3};
	}
	margin-bottom: 1.5rem;
	margin-left: 0.75rem;
`;

const formatPrice = (price: string) => {
	let priceStr = parseFloat(price).toFixed(20);
	let processedPrice = priceStr.slice(0, 7);
	if (processedPrice[processedPrice.length - 1] === '.') {
		processedPrice += parseFloat(price).toFixed(20).slice(7, 8);
	}
	return processedPrice;
};

export default function PositionsPage() {
	const { chain } = useNetwork();
	const [txHash, setTxHash] = useState('');
	const [predictionSize, setPredictionSize] = useState('');
	const [currentlyBeingExercised, setCurrentlyBeingExercised] = useState('-1');

	const { positions } = useFetchPositions();

	const activeChain = chain?.network;

	const handleExercise = async (position: Position) => {
		const { ethereum } = window;
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const predictionMarket = new ethers.Contract(
				predictionMarketAddresses[activeChain ? activeChain : 'rinkeby'],
				PredictionMarket.abi,
				signer
			);

			setCurrentlyBeingExercised(position.tokenId);
			let tx;
			try {
				tx = await predictionMarket.exercise(position.tokenId);
				await tx.wait();
			} catch (e) {
				console.log(e);
				setCurrentlyBeingExercised('-1');
				return;
			}
			setCurrentlyBeingExercised('-1');

			setTxHash(tx.hash);
			setPredictionSize(position.size);

			setTimeout(() => {
				setTxHash('');
				setPredictionSize('');
			}, 30000);
		}
	};

	const isExercisable = (expiry: number) => {
		const now = new Date().getTime() / 1000;
		return now >= expiry;
	};

	const collateralAsset = chain?.network === 'rinkeby' ? 'ETH' : 'MATIC';
	const explorer =
		chain?.network === 'rinkeby'
			? 'https://rinkeby.etherscan.io/tx'
			: chain?.network === 'maticmum'
			? 'https://mumbai.polygonscan.com/tx'
			: 'https://polygonscan.com/tx';

	const marketplace =
		chain?.network === 'rinkeby'
			? `https://testnets.opensea.io/assets/rinkeby/${predictionMarketAddresses.rinkeby}`
			: chain?.network == 'maticmum'
			? `https://testnets.opensea.io/assets/rinkeby/${predictionMarketAddresses.rinkeby}`
			: `https://opensea.io/assets/matic/${predictionMarketAddresses.matic}`;

	return (
		<>
			{txHash !== '' && predictionSize !== '' && (
				<NewTx>
					<p>
						You just exercised your prediction and got payed {predictionSize} {collateralAsset}
					</p>
					<a href={`${explorer}/${txHash}`} target="_blank" rel="noreferrer">
						Tx Hash: {txHash} <FiExternalLink />
					</a>
				</NewTx>
			)}
			<Outer>
				<Container>
					<Headah>
						<p>Open Positions</p>
					</Headah>
					<Header>
						<div>Market</div>
						<div>Side</div>
						<div>Strike</div>
						<div>Expiry</div>
						<div>Price</div>
						<div>Size</div>
						<div className="status-header">Status</div>
					</Header>
					<Positions>
						{positions &&
							positions.unlistedPositions.map(position => {
								return (
									<Position key={position.tokenId} winning={position.status === 'WINNING'}>
										<Asset>
											<img src={assetToImage[position.asset]} alt={'coin'} />
											<div className="asset-name">
												<p>{assetToName[position.asset]}</p>
												<p>{position.asset.toUpperCase()}-USD</p>
											</div>
											<a
												href={`${marketplace}/${position.tokenId}`}
												target="_blank"
												rel="noreferrer"
											>
												<FiExternalLink />
											</a>
										</Asset>
										<div>{position.side}</div>
										<div>${position.strikePrice}</div>
										<div>{position.expiry}</div>

										<div className="latest-answer">
											${position.latestAnswer}{' '}
											<a
												href={`https://data.chain.link/polygon/mainnet/${
													position.asset === 'usdc' || position.asset === 'usdt'
														? 'stablecoins'
														: 'crypto-usd'
												}/${position.asset}-usd`}
												target="_blank"
												rel="noreferrer"
											>
												<FiExternalLink />
											</a>
										</div>
										<div>
											{position.size} {collateralAsset}
										</div>
										<div className="status">{position.status}</div>
										{currentlyBeingExercised === position.tokenId ? (
											<Button l={true}>
												<Spinner />
											</Button>
										) : (
											<Button
												exercisable={
													isExercisable(position.timestamp) && position.status === 'WINNING'
												}
												onClick={
													isExercisable(position.timestamp) && position.status === 'WINNING'
														? () => handleExercise(position)
														: () => {}
												}
											>
												Exercise
											</Button>
										)}
									</Position>
								);
							})}
						{(positions && positions.unlistedPositions.length === 0) ||
							(!positions && (
								<Empty>
									<p>You have no open positions</p>
								</Empty>
							))}
					</Positions>
				</Container>
				<Container>
					<Headah>
						<p>Listed Positions</p>
					</Headah>
					<Header>
						<div>Market</div>
						<div>Side</div>
						<div>Strike</div>
						<div>Expiry</div>
						<div>List Price</div>
						<div>Size</div>
						<div>Status</div>
					</Header>
					<Positions>
						{positions &&
							positions.listedPositions.map(position => {
								return (
									<Position key={position.tokenId} winning={position.status === 'WINNING'}>
										<Asset>
											<img src={assetToImage[position.asset]} alt={'coin'} />
											<div className="asset-name">
												<p>{assetToName[position.asset]}</p>
												<p>{position.asset.toUpperCase()}-USD</p>
											</div>
										</Asset>
										<div>{position.side}</div>
										<div>${position.strikePrice}</div>
										<div>{position.expiry}</div>
										<div>
											{formatPrice(position.listPrice || '10')} {collateralAsset}
										</div>
										<div>
											{position.size} {collateralAsset}
										</div>
										<div className="status">{position.status}</div>
										<ListButton>Listed</ListButton>
									</Position>
								);
							})}

						{(positions && positions.listedPositions.length === 0) ||
							(!positions && (
								<Empty>
									<p>You have no listed positions</p>
								</Empty>
							))}
					</Positions>
				</Container>
			</Outer>
		</>
	);
}

const Positions = styled.div`
	display: flex;
	flex-direction: column;
	font-size: ${({ theme }) => theme.typeScale.helperText};
`;

const Button = styled.button<{ exercisable?: boolean; l?: boolean }>`
	opacity: ${({ exercisable }) => (exercisable ? 0.85 : 0.25)};
	padding: 0.5rem 1.5rem;
	padding: ${({ l: loading }) => (loading ? '0.225rem 1.5rem' : '0.5rem 1.5rem')};
	outline: none;
	border: 2px solid ${({ theme }) => theme.colors.primary};
	color: ${({ theme, exercisable }) => (exercisable ? 'black' : theme.text.secondary)};
	font-weight: 600;
	border-radius: 0.25rem;
	background-color: ${({ theme, exercisable }) => (exercisable ? theme.colors.primary : theme.background.primary)};
	:hover {
		cursor: ${({ exercisable }) => (exercisable ? 'pointer' : 'default')};
		opacity: ${({ exercisable }) => (exercisable ? 1 : 0.25)};
	}
`;

const ListButton = styled.button`
	padding: 0.5rem 1.5rem;
	outline: none;
	border: 2px solid ${({ theme }) => theme.colors.primary};
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.secondary};
	font-weight: 600;
	border-radius: 0.25rem;
`;

const Asset = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	img {
		height: 27px;
		width: 27px;
	}

	div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	svg {
		height: 16px;
		width: 16px;
		:hover {
			color: ${({ theme }) => theme.colors.primary};
		}
	}

	@media (max-width: 830px) {
		.asset-name {
			display: none;
		}
	}
`;

const Header = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	gap: 1.5rem;
	padding: 1rem;
	border-radius: 0.5rem 0.5rem 0 0;
	border: 1px solid ${({ theme }) => theme.background.tertiary};

	@media (max-width: 1200px) {
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
		.status-header {
			display: none;
		}
	}

	@media (max-width: 900px) {
		grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	@media (max-width: 830px) {
		grid-template-columns: 0.75fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}
`;

const Empty = styled.div`
	width: 100%;
	height: 150px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-left: 1px solid ${({ theme }) => theme.background.tertiary};
	border-right: 1px solid ${({ theme }) => theme.background.tertiary};
	border-bottom: 1px solid ${({ theme }) => theme.background.tertiary};
	p {
		font-size: ${({ theme }) => theme.typeScale.header5};
	}
`;

const Position = styled.div<{ winning: boolean }>`
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	gap: 1.5rem;
	padding: 1rem;

	align-items: center;
	/* border-radius: 0.2rem; */
	border-bottom: 1px solid ${({ theme }) => theme.background.tertiary};
	border-left: 1px solid ${({ theme }) => theme.background.tertiary};
	border-right: 1px solid ${({ theme }) => theme.background.tertiary};

	:hover {
		cursor: pointer;
		background-color: ${({ theme }) => theme.background.secondary};
		color: ${({ theme }) => theme.text.primary};
	}

	.status {
		font-weight: 600;
		color: ${({ theme, winning }) => (winning ? theme.colors.primary : theme.colors.red)};
	}

	.latest-answer {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		a {
			display: flex;
			align-items: center;
			svg {
				height: 16px;
				width: 16px;
				:hover {
					color: ${({ theme }) => theme.colors.primary};
				}
			}
		}
	}

	@media (max-width: 1200px) {
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
		.status {
			display: none;
		}
	}

	@media (max-width: 900px) {
		grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	@media (max-width: 830px) {
		grid-template-columns: 0.75fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
	flex-direction: column;
	gap: 0.5rem;
	p {
		color: white !important;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		padding-bottom: 0.1rem;
	}
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
`;
