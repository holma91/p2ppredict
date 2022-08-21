import { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useNetwork } from 'wagmi';
import { assetToImage } from '../utils/misc';

const isBlackAndWhite = (activeChain: string | undefined, symbol: string) => {
	let colored: string[] = [];
	if (activeChain === 'rinkeby') {
		colored = ['eth', 'btc', 'matic', 'usdc', 'bnb', 'atom', 'link'];
	} else if (activeChain === 'maticmum') {
		colored = ['eth', 'btc', 'matic', 'usdc', 'usdt', 'dai'];
	} else {
		colored = [
			'aave',
			'ada',
			'algo',
			'ape',
			'avax',
			'axs',
			'bnb',
			'btc',
			'eth',
			'busd',
			'crv',
			'dai',
			'doge',
			'dot',
			'ftm',
			'icp',
			'link',
			'ltc',
			'matic',
			'mkr',
			'shib',
			'snx',
			'sol',
			'sushi',
			'trx',
			'uni',
			'usdc',
			'usdt',
			'vet',
			'xmr',
			'xtz',
			'yfi',
			'zec',
		];
	}
	if (colored.includes(symbol)) {
		return false;
	}
	return true;
};

export default function Banner({
	bannerChoice,
	showAll,
	fullWidth,
	setBannerChoice,
	setActive,
}: {
	bannerChoice: string;
	showAll: boolean;
	fullWidth: boolean;
	setBannerChoice: Dispatch<SetStateAction<string>>;
	setActive: Dispatch<SetStateAction<number>>;
}) {
	const { chain } = useNetwork();

	const handleBannerChange = (symbol: string) => {
		if (isBlackAndWhite(chain?.network ? chain?.network : 'matic', symbol)) return;
		setActive(0);
		setBannerChoice(symbol);
	};

	return (
		<Container fullWidth={fullWidth}>
			{Object.keys(assetToImage).map(symbol => {
				return (
					<BannerDiv
						isBlackAndWhite={isBlackAndWhite(chain?.network, symbol)}
						active={bannerChoice === symbol}
						key={symbol}
						onClick={() => handleBannerChange(symbol)}
					>
						<img src={assetToImage[symbol]} alt={`${symbol}-logo`} />
					</BannerDiv>
				);
			})}
		</Container>
	);
}

const BannerDiv = styled.div<{ isBlackAndWhite: boolean; active: boolean }>`
	padding: 0.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 3px solid ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.gray[300])};
	:hover {
		cursor: ${({ isBlackAndWhite }) => (isBlackAndWhite ? '' : 'pointer')};
		border-bottom: 3px solid
			${({ isBlackAndWhite, theme }) => (isBlackAndWhite ? theme.colors.gray[300] : theme.colors.primary)};
	}
	img {
		height: 28px;
		width: 28px;
		filter: ${({ isBlackAndWhite }) => (isBlackAndWhite ? 'gray' : '')}; /* IE6-9 */
		-webkit-filter: ${({ isBlackAndWhite }) =>
			isBlackAndWhite ? 'grayscale(1)' : ''}; /* Google Chrome, Safari 6+ & Opera 15+ */
		filter: ${({ isBlackAndWhite }) =>
			isBlackAndWhite ? 'grayscale(1)' : ''}; /* Google Chrome, Safari 6+ & Opera 15+ */
	}
	p {
		display: flex;
		align-items: center;
		height: 28px;
		width: 108px;
	}
`;

const Container = styled.div<{ fullWidth: boolean }>`
	overflow-x: scroll;
	top: ${({ fullWidth }) => (fullWidth ? '58.78px' : '')}; // do something better
	position: sticky;
	background-color: ${({ theme }) => theme.colors.gray[300]};
	display: flex;
	align-items: center;
	padding: 0.1rem 1.2rem;

	.logo {
		padding: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 3px solid ${({ theme }) => theme.colors.gray[300]};

		:hover {
			cursor: pointer;
			border-bottom: 3px solid ${({ theme }) => theme.colors.secondary};
		}
	}

	.all {
		p {
			width: 108px;
		}
	}
`;
