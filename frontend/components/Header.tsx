import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { PrimaryButton } from './Buttons';
import { useContext } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ActorProps {
	isActive: boolean;
}

const Header = () => {
	const router = useRouter();
	const page =
		router.asPath === '/trade'
			? 'trade'
			: router.asPath === '/create'
			? 'create'
			: router.asPath === '/positions'
			? 'positions'
			: '';

	return (
		<HeaderContainer>
			<Title>
				<Link href="/">
					<a>p2ppredict</a>
				</Link>
				<span>testnet</span>
			</Title>
			<MenuContainer>
				<Link href="/create">
					<Actor isActive={page === 'create'}>
						<a>create markets</a>
					</Actor>
				</Link>
				<Link href="/trade">
					<Actor isActive={page === 'trade'}>
						<a>trade</a>
					</Actor>
				</Link>
			</MenuContainer>
			<ButtonContainer>
				{/* <Link href="/positions">
					<PrimaryButton>
						<a className="logIn">connect</a>
					</PrimaryButton>
				</Link> */}
				<ConnectButton />
			</ButtonContainer>
		</HeaderContainer>
	);
};

const MenuContainer = styled.div`
	display: flex;
	align-items: stretch;
`;

const Actor = styled.div<ActorProps>`
	display: flex;
	align-items: center;
	color: white;
	border-bottom: 3px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.background.primary)};

	a {
		/* font-weight: 300; */
		padding: 0 0.75rem;
	}

	:hover {
		cursor: pointer;
		color: ${({ theme, isActive }) => (isActive ? 'white' : theme.colors.primary)};
	}
`;

const HeaderContainer = styled.div`
	position: sticky;
	top: 0;
	z-index: 100;
	background-color: ${({ theme }) => theme.background.primary};
	border-bottom: 1px solid ${({ theme }) => theme.background.secondary};
	display: flex;
	justify-content: space-between;
	align-items: stretch;
	font-weight: 600;
`;

const Title = styled.div`
	position: relative;
	padding: 0.9rem 1.3rem;
	padding-right: 3rem;
	display: flex;
	align-items: center;

	a {
		color: ${({ theme }) => theme.colors.primary};
		font-weight: 800;
		font-size: ${({ theme }) => theme.typeScale.header2};
		span {
			color: ${({ theme }) => theme.colors.secondary};
		}
	}
	span {
		color: white;
		position: absolute;
		top: 0.4rem;
		right: 0;
		font-size: 0.85rem;
	}
`;

const ButtonContainer = styled.div`
	padding: 0rem 1.3rem;

	display: flex;
	gap: 0.9rem;
	justify-content: space-between;
	align-items: center;

	.signUp {
		font-size: ${({ theme }) => theme.typeScale.paragraph};
		/* font-weight: 300; */
		color: white;
		:hover {
			cursor: pointer;
			color: ${({ theme }) => theme.colors.primary};
		}
	}

	.logIn {
		font-size: ${({ theme }) => theme.typeScale.paragraph};
		color: black;
	}

	@media (max-width: 600px) {
		display: none;
	}
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

export default Header;
