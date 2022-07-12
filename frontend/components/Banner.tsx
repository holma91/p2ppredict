import { useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { assetToImage } from '../utils/misc';

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
	const handleBannerChange = (symbol: string) => {
		setActive(0);
		setBannerChoice(symbol);
	};

	return (
		<Container fullWidth={fullWidth}>
			{showAll && (
				<BannerDiv active={bannerChoice === 'all'}>
					<p>ALL MARKETS</p>
				</BannerDiv>
			)}
			{Object.keys(assetToImage).map(symbol => {
				return (
					<BannerDiv active={bannerChoice === symbol} key={symbol} onClick={() => handleBannerChange(symbol)}>
						<img src={assetToImage[symbol]} alt={`${symbol}-logo`} />
					</BannerDiv>
				);
			})}
		</Container>
	);
}

const BannerDiv = styled.div<{ active: boolean }>`
	padding: 0.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 3px solid ${({ theme, active }) => (active ? theme.colors.secondary : theme.colors.gray[300])};

	:hover {
		cursor: pointer;
		border-bottom: 3px solid ${({ theme }) => theme.colors.secondary};
	}

	img {
		height: 28px;
		width: 28px;
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
	/* justify-content: space-between; */
	padding: 0.1rem 1.2rem;

	.logo {
		padding: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 3px solid ${({ theme }) => theme.colors.gray[300]};

		:hover {
			cursor: pointer;
			/* background-color: ${({ theme }) => theme.colors.gray[200]}; */
			border-bottom: 3px solid ${({ theme }) => theme.colors.secondary};
		}
	}

	.all {
		p {
			width: 108px;
		}
	}
`;
