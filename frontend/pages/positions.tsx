import { useContext, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';
import { useFetchPositions } from '../hooks/useFetchPositions';
import { assetToImage, assetToName } from '../utils/misc';
import { FallbackProviderContext } from './_app';
// import { nile } from '../../contracts/scripts/addresses';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import { Position } from '../types';

const Outer = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.secondary};
	font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	display: flex;
	/* justify-content: center; */
	align-items: center;
	flex-direction: column;
	gap: 1rem;
	min-height: 100vh;
`;

const Container = styled.div`
	/* width: 95%; */
	display: flex;
	flex-direction: column;
	/* align-items: center; */
	/* gap: 0.75rem; */
	padding: 2rem 3.5rem;
	padding-bottom: 0;
`;

const Headah = styled.div`
	p {
		font-size: ${({ theme }) => theme.typeScale.header3};
	}
	margin-bottom: 1.5rem;
	margin-left: 0.75rem;
`;

export default function PositionsPage() {
	const fallbackProvider = useContext(FallbackProviderContext);
	const [loadingButton, setLoadingButton] = useState(false);
	const [txHash, setTxHash] = useState('');
	const [predictionSize, setPredictionSize] = useState('');

	const { positions, isLoading, isError } = useFetchPositions(fallbackProvider);

	const handleExercise = async (position: Position) => {
		return;
		let predictionMarket = await tronWeb.contract(PredictionMarket.abi, nile.predictionMarket);

		setLoadingButton(true);
		let result;
		try {
			result = await predictionMarket.exercise(position.tokenId).send({
				feeLimit: 1000_000_000,
				shouldPollResponse: false,
			});
		} catch (e) {
			console.log(e);
			setLoadingButton(false);
			return;
		}
		setLoadingButton(false);

		setTxHash(result);
		setPredictionSize(position.size);

		setTimeout(() => {
			setTxHash('');
			setPredictionSize('');
		}, 30000);
	};

	const isExercisable = (expiry: number) => {
		const now = new Date().getTime() / 1000;
		return now >= expiry;
	};

	return (
		<>
			{txHash !== '' && predictionSize !== '' && (
				<NewTx>
					<p>You just exercised your prediction and got payed {predictionSize} TRX</p>
					<a href={`https://nile.tronscan.org/#/transaction/${txHash}`} target="_blank" rel="noreferrer">
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
						<div>Status</div>
					</Header>
					<Positions>
						{positions &&
							positions.unlistedPositions.map(position => {
								return (
									<Position key={position.tokenId} winning={position.status === 'WINNING'}>
										<Asset>
											<img src={assetToImage[position.asset]} alt={'btc'} />
											<div>
												<p>{assetToName[position.asset]}</p>
												<p>{position.asset.toUpperCase()}-USD</p>
											</div>
										</Asset>
										<div>{position.side}</div>
										<div>${position.strikePrice}</div>
										<div>{position.expiry}</div>
										<div>${position.latestAnswer}</div>
										<div>{position.size} TRX</div>
										<div className="status">{position.status}</div>

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
									</Position>
								);
							})}
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
											<img src={assetToImage[position.asset]} alt={'btc'} />
											<div>
												<p>{assetToName[position.asset]}</p>
												<p>{position.asset.toUpperCase()}-USD</p>
											</div>
										</Asset>
										<div>{position.side}</div>
										<div>${position.strikePrice}</div>
										<div>{position.expiry}</div>
										<div>{position.listPrice} TRX</div>
										<div>{position.size} TRX</div>
										<div className="status">{position.status}</div>
										<ListButton>Listed</ListButton>
									</Position>
								);
							})}
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

const Button = styled.button<{ exercisable?: boolean }>`
	opacity: ${({ exercisable }) => (exercisable ? 0.85 : 0.25)};
	padding: 0.5rem 1.5rem;
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
`;

const Header = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	gap: 1.5rem;
	/* padding: 1rem; */
	padding: 1rem;
	/* padding-bottom: 1.5rem; */
	/* margin-bottom: 1rem; */
	border-radius: 0.5rem 0.5rem 0 0;
	border: 1px solid ${({ theme }) => theme.background.tertiary};
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
