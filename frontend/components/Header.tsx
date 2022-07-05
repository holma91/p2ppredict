import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface ActorProps {
	isActive: boolean;
}

const Header = () => {
	const router = useRouter();
	const page = router.asPath === '/taker' ? 'taker' : router.asPath === '/maker' ? 'maker' : 'positions';

	return (
		<HeaderContainer>
			<Title>
				<Link href="/">
					<a>p2ppredict</a>
				</Link>
			</Title>
			<MenuContainer>
				<Link href="/maker">
					<Actor isActive={page === 'maker'}>
						<a>create markets</a>
					</Actor>
				</Link>
				<Link href="/positions">
					<Actor isActive={page === 'positions'}>
						<a>open positions</a>
					</Actor>
				</Link>
				<Link href="/taker">
					<Actor isActive={page === 'taker'}>
						<a>trade</a>
					</Actor>
				</Link>
			</MenuContainer>
			<ButtonContainer>
				<Link href="/positions">
					<a className="signUp">sign up</a>
				</Link>
				<Link href="/positions">
					<PrimaryButton>
						<a className="logIn">log in</a>
					</PrimaryButton>
				</Link>
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
	border-bottom: 3px solid ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.primary)};

	a {
		font-weight: 300;
		padding: 0 0.75rem;
	}

	:hover {
		cursor: pointer;
		color: ${({ theme, isActive }) => (isActive ? 'white' : theme.colors.tertiary)};
	}
`;

const HeaderContainer = styled.div`
	position: sticky;
	top: 0;
	z-index: 100;
	background-color: ${({ theme }) => theme.colors.primary};
	display: flex;
	justify-content: space-between;
	align-items: stretch;
`;

const Title = styled.div`
	padding: 0.9rem 1.3rem;

	a {
		color: white;
		font-weight: 800;
		font-size: ${({ theme }) => theme.typeScale.header2};
		span {
			color: ${({ theme }) => theme.colors.secondary};
		}
	}
`;

const ButtonContainer = styled.div`
	padding: 0.9rem 1.3rem;

	display: flex;
	gap: 0.9rem;
	justify-content: space-between;
	align-items: center;

	.signUp {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		font-weight: 300;
		color: white;
		:hover {
			cursor: pointer;
			color: ${({ theme }) => theme.colors.tertiary};
		}
	}

	.logIn {
		font-size: ${({ theme }) => theme.typeScale.smallParagraph};
		color: black;
	}
`;

export default Header;
