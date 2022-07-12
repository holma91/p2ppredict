import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import styled from 'styled-components';
import Select from 'react-select';
import { assetToImage } from '../utils/misc';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import { blackTheme } from '../design/themes';
import { useContractWrite, useWaitForTransaction, useContractEvent } from 'wagmi';
import { rinkeby } from '../utils/addresses';
import { markAssetError } from 'next/dist/client/route-loader';
import { ethers } from 'ethers';
import { Spinner } from '../components/Spinner';
import { BiLinkExternal } from 'react-icons/bi';

const StyledChoice = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	img {
		height: 20px;
		width: 20px;
	}
`;

const symbolToLabel: { [key: string]: JSX.Element } = {
	btc: (
		<StyledChoice>
			<img src={assetToImage['btc']} alt="logo" />
			<span>BTC</span>
		</StyledChoice>
	),
	eth: (
		<StyledChoice>
			<img src={assetToImage['eth']} alt="logo" />
			<span>ETH</span>
		</StyledChoice>
	),
};

const options = [
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
		value: 'matic',
		label: (
			<StyledChoice>
				<img src={assetToImage['matic']} alt="logo" />
				<span>MATIC</span>
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
		value: 'sol',
		label: (
			<StyledChoice>
				<img src={assetToImage['sol']} alt="logo" />
				<span>SOL</span>
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
];

const customStyles = {
	option: (provided: any, state: any) => ({
		...provided,
		// borderBottom: '2px solid grey',
		color: state.isSelected ? 'grey' : 'white',
		backgroundColor: blackTheme.background.primary,
		// backgroundColor: state.isSelected ? 'grey' : 'black',
		':hover': {
			cursor: 'pointer',
			backgroundColor: state.isSelected ? '' : blackTheme.background.tertiary,
		},
	}),
	input: (provided: any) => ({
		...provided,
		color: 'white',
	}),
	control: (provided: any) => ({
		...provided,
		margin: 0,
		backgroundColor: blackTheme.background.tertiary,
		border: 0,
		outline: 'none',
		// This line disable the blue border
		boxShadow: 'none',
	}),
	singleValue: (provided: any) => ({
		...provided,
		color: 'white',
		// backgroundColor: 'green',
	}),
	menuList: (provided: any) => ({
		...provided,
		backgroundColor: blackTheme.background.primary,
		paddingTop: 0,
		paddingBottom: 0,
		border: `1px solid ${blackTheme.background.tertiary}`,
		// height: '100px',
	}),
	indicatorSeparator: (provided: any) => ({
		...provided,
		backgroundColor: blackTheme.background.tertiary,
	}),
};

const StyledSelect = styled(Select)`
	width: 100%;
	background-color: ${({ theme }) => theme.background.primary};
	outline: none;
`;

type MakerThingProps = {
	asset: string;
	setAsset: Dispatch<SetStateAction<string>>;
};

const MakerThing = ({ asset, setAsset }: MakerThingProps) => {
	const [over, setOver] = useState(true);
	const [positionSize, setPositionSize] = useState('0.001');
	const [strikePrice, setStrikePrice] = useState('0');
	const [expiry, setExpiry] = useState('2023-01-01');
	const [overOdds, setOverOdds] = useState('2');
	const [underOdds, setUnderOdds] = useState('2');
	const [limitOrder, setLimitOrder] = useState('0');

	const [createdMarketId, setCreatedMarketId] = useState(null);

	const createMarketFunc = useContractWrite({
		addressOrName: rinkeby.predictionMarket,
		contractInterface: PredictionMarket.abi,
		functionName: 'createMarketWithPosition',
	});

	const waitForCreateMarketFunc = useWaitForTransaction({
		hash: createMarketFunc.data?.hash,
		onSuccess(data) {
			console.log(data);
		},
	});

	useContractEvent({
		addressOrName: rinkeby.predictionMarket,
		contractInterface: PredictionMarket.abi,
		eventName: 'MarketCreated',
		listener: ([priceFeed, strikePrice, expiry, collateral, overPredictionId, underPredictionId]) => {
			setCreatedMarketId(overPredictionId.toString());
			setTimeout(() => {
				setCreatedMarketId(null);
			}, 20000);
		},
	});

	const handlePositionSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// check that position is not too large
		setPositionSize(e.target.value);
	};

	const handleStrikePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setStrikePrice(e.target.value);
	};

	const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setExpiry(e.target.value);
	};

	const handleOverOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value === '' || e.target.value.slice(e.target.value.length - 1) === '.') {
			setOverOdds(e.target.value);
			return;
		}
		let overOdds = parseFloat(e.target.value);
		setOverOdds(overOdds.toString());
		let underOdds = 1 / (1 - 1 / overOdds);
		setUnderOdds(underOdds.toFixed(4));
	};

	const handleUnderOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value === '' || e.target.value.slice(e.target.value.length - 1) === '.') {
			setUnderOdds(e.target.value);
			return;
		}
		let underOdds = parseFloat(e.target.value);
		setUnderOdds(underOdds.toString());
		let overOdds = 1 / (1 - 1 / underOdds);
		setOverOdds(overOdds.toFixed(4));
	};

	const handleLimitOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const regex = new RegExp('^[0-9]+$');
		console.log(e.target.value.slice(e.target.value.length - 1));
		console.log(regex.test(e.target.value.slice(e.target.value.length - 1)));

		if (
			!regex.test(e.target.value.slice(e.target.value.length - 1)) &&
			e.target.value.slice(e.target.value.length - 1) !== '.'
		) {
			return;
		}
		setLimitOrder(e.target.value);
	};

	const handleChange = (selectedOption: any) => {
		setAsset(selectedOption.value);
	};

	const createMarket = async () => {
		const ETH_USD_DECIMALS = 8;
		const market = {
			priceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
			strikePrice: ethers.utils.parseUnits(strikePrice, ETH_USD_DECIMALS),
			expiry: ethers.BigNumber.from(new Date(expiry).getTime() / 1000),
			collateral: ethers.utils.parseUnits(positionSize, 18),
		};
		// odds = collateral / price <=> price = collateral / odds
		let listPrice;
		const scaleFactor = 4;
		if (over) {
			let scaledUnderOdds = ethers.utils.parseUnits(underOdds, scaleFactor);
			listPrice = market.collateral.div(scaledUnderOdds).mul(10 ** scaleFactor);
		} else {
			let scaledOverOdds = ethers.utils.parseUnits(overOdds, scaleFactor);
			listPrice = market.collateral.div(scaledOverOdds).mul(10 ** scaleFactor);
		}
		console.log(ethers.utils.formatEther(listPrice));
		let tresholdPrice = ethers.utils.parseUnits(limitOrder, ETH_USD_DECIMALS);
		let endTimestamp = 1000000000000000;

		createMarketFunc.write({
			args: [market, over, listPrice, endTimestamp, tresholdPrice],
			overrides: {
				value: market.collateral,
			},
		});
	};

	return (
		<Container>
			{createdMarketId ? (
				<NewMarket>
					<Link href={`/markets/${createdMarketId}`}>
						<a target="_blank">
							View Newly Created Market <BiLinkExternal></BiLinkExternal>
						</a>
					</Link>
				</NewMarket>
			) : null}
			<Thing>
				<Header>
					<label>Asset:</label>
					<StyledSelect
						defaultValue={{
							label: symbolToLabel[asset],
							value: asset,
						}}
						options={options}
						styles={customStyles}
						onChange={handleChange}
						instanceId="yo"
						autoFocus={true}
					/>
				</Header>
				<SizeDiv>
					<div className="inner-size">
						<img src={assetToImage['eth']} alt={`eth-logo`} />
						<div className="input-div">
							<input type="number" value={positionSize} onChange={handlePositionSizeChange} />
						</div>
					</div>
					<div className="inner-size">
						<p>available: 1.24</p>
						<p>Position Size</p>
					</div>
				</SizeDiv>
				<MultiDiv>
					<div className="split">
						<div className="first">
							<input type="number" value={strikePrice} onChange={handleStrikePriceChange} />
							<p>Strike Price</p>
						</div>
						<div>
							<input type="date " value={expiry} onChange={handleExpiryChange} />
							<p>Expiry</p>
						</div>
					</div>
					<div className="mid">
						<div>
							<p>Percent to strike</p>
							<p>23.44%</p>
						</div>
						<div>
							<p>Countdown to expiry</p>
							<p>200D</p>
						</div>
					</div>
					<div className="split">
						<div className="first">
							<input type="string" value={overOdds} onChange={handleOverOddsChange} name="over" />
							<p>Over Odds</p>
						</div>
						<div>
							<input type="string" value={underOdds} onChange={handleUnderOddsChange} name="under" />
							<p>Under Odds</p>
						</div>
					</div>
				</MultiDiv>
				<ToggleDiv>
					<CustomToggle over={over} onClick={() => setOver(!over)}>
						{over && <p>OVER</p>}
						<div className="ball"></div>
						{!over && <p>UNDER</p>}
					</CustomToggle>
				</ToggleDiv>
				<LimitOrderDiv>
					<p>
						Invalidate order if {asset.toUpperCase()} goes {over ? 'under' : 'over'}:
					</p>
					<input type="string" value={limitOrder} onChange={handleLimitOrderChange} />
				</LimitOrderDiv>
				<SummaryDiv>
					<div>
						<p>Depositing</p>
						<p>{positionSize} ETH</p>
					</div>
					<div>
						<p>Listing {over ? 'UNDER' : 'OVER'} for</p>
						<p>
							{over
								? `${(parseFloat(positionSize) / parseFloat(underOdds)).toFixed(4)} ETH`
								: `${(parseFloat(positionSize) / parseFloat(overOdds)).toFixed(4)} ETH`}
						</p>
					</div>
					<div>
						<p>Risk</p>
						<p>
							{over
								? `${(
										parseFloat(positionSize) -
										parseFloat(positionSize) / parseFloat(underOdds)
								  ).toFixed(4)} ETH`
								: `${(
										parseFloat(positionSize) -
										parseFloat(positionSize) / parseFloat(overOdds)
								  ).toFixed(4)} ETH`}
						</p>
					</div>
					<div>
						<p>Payout</p>
						<p>
							{over
								? `${parseFloat(positionSize)} + ${(
										parseFloat(positionSize) / parseFloat(underOdds)
								  ).toFixed(4)} ETH`
								: `${parseFloat(positionSize)} + ${(
										parseFloat(positionSize) / parseFloat(overOdds)
								  ).toFixed(4)} ETH`}
						</p>
					</div>
					{createMarketFunc.isLoading ? (
						<Button l={true} type="button">
							<Spinner />
						</Button>
					) : waitForCreateMarketFunc.isLoading ? (
						<Button l={true} type="button">
							<Spinner />
						</Button>
					) : (
						<Button type="button" l={false} onClick={createMarket}>
							CREATE MARKET
						</Button>
					)}
				</SummaryDiv>
			</Thing>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const Button = styled.button<{ l: boolean }>`
	margin-top: 0.5rem;
	padding: ${({ l: loading }) => (loading ? '0.5rem 0.75rem' : '0.75rem')};
	outline: none;
	border: none;
	border-radius: 0.2rem;
	color: ${({ theme }) => theme.text.secondary};
	background-color: ${({ theme }) => theme.colors.primary};
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SummaryDiv = styled.div`
	background-color: ${({ theme }) => theme.background.tertiary};
	display: flex;
	flex-direction: column;
	border-radius: 1rem;
	padding: 1rem;
	gap: 0.5rem;
	div {
		display: flex;
		justify-content: space-between;
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	}
`;

const LimitOrderDiv = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;

	p {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		padding-left: 0.75rem;
	}

	input {
		color: ${({ theme }) => theme.text.secondary};

		font-size: ${({ theme }) => theme.typeScale.paragraph};
		background-color: ${({ theme }) => theme.background.tertiary};
		outline: none;
		border: none;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 1rem;
	}
`;

const CustomToggle = styled.div<{ over: boolean }>`
	background-color: #dddddd;
	height: 40px;
	width: 140px;
	border-radius: 30px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	/* justify-content: ${({ over }) => (over ? 'left' : 'right')}; */
	cursor: pointer;

	p {
		font-size: ${({ theme }) => theme.typeScale.header4};
		padding: 1.5rem;
		padding-left: ${({ over }) => (over ? '' : '0')};
		padding-right: ${({ over }) => (over ? '0' : '')};
		color: black;
	}

	.ball {
		background-color: ${({ theme }) => theme.background.primary};
		height: 33px;
		width: 33px;
		border-radius: 100%;
		margin: 0.3rem;
	}
`;

const ToggleDiv = styled.div`
	display: flex;
	justify-content: center;
`;

const MultiDiv = styled.div`
	border: 1px solid ${({ theme }) => theme.background.tertiary};
	border-radius: 1rem;
	p {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
	}

	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;

		.first {
			border-right: 1px solid #262626;
		}
		div {
			padding: 0.8rem;
			display: flex;
			flex-direction: column;
			gap: 0.6rem;

			input {
				color: ${({ theme }) => theme.text.secondary};

				font-size: ${({ theme }) => theme.typeScale.paragraph};
				background-color: inherit;
				outline: none;
				border: none;
				width: 100%;
				/* text-align: right; */
			}
		}
	}

	.mid {
		border-top: 1px solid ${({ theme }) => theme.background.tertiary};
		border-bottom: 1px solid ${({ theme }) => theme.background.tertiary};
		padding: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		div {
			display: flex;
			justify-content: space-between;
		}
	}
`;

const SizeDiv = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	border-radius: 1rem;
	background-color: ${({ theme }) => theme.background.tertiary};
	padding: 1rem 1.25rem;
	gap: 1rem;

	.inner-size {
		display: flex;
		justify-content: space-between;

		img {
			height: 35px;
			width: 35px;
		}

		p {
			font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		}
	}

	.input-div {
		width: 100%;
		display: flex;
		align-items: center;
		input {
			color: ${({ theme }) => theme.text.secondary};

			font-size: ${({ theme }) => theme.typeScale.header2};
			background-color: inherit;
			outline: none;
			border: none;
			width: 100%;
			text-align: right;
		}
	}
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
`;

const Thing = styled.div`
	background-color: ${({ theme }) => theme.background.primary};

	color: ${({ theme }) => theme.text.secondary};
	padding: 1rem;
	width: 400px;
	/* height: 750px; */

	display: flex;
	flex-direction: column;
	gap: 1rem;
	border-radius: 15px;
	border: 2px solid ${({ theme }) => theme.background.tertiary};
`;

const NewMarket = styled.div`
	background-color: ${({ theme }) => theme.background.primary};
	width: 100%;
	height: 150px;
	border-radius: 0.5rem;
	padding: 1rem;
	color: ${({ theme }) => theme.text.secondary};
	a {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		:hover {
			color: ${({ theme }) => theme.text.primary};
		}
	}
	svg {
		width: 22px;
	}
`;

export default MakerThing;
