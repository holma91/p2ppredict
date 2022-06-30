import Link from 'next/link';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton } from './Buttons';

const Header = () => {
  return (
    <HeaderContainer>
      <Title>
        <Link href="/">
          <a>
            p2p<span>predict</span>
          </a>
        </Link>
      </Title>
      <MenuContainer>
        <div className="actor">
          <p>maker</p>
        </div>
        <div className="actor">
          <p>taker</p>
        </div>
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
  /* gap: 2rem; */

  .actor {
    display: flex;
    align-items: center;
    color: white;
    /* border-bottom: 4px solid ${({ theme }) => theme.colors.primary}; */

    p {
      font-weight: 300;
      padding: 0 0.75rem;
    }

    :hover {
      cursor: pointer;
      color: ${({ theme }) => theme.colors.tertiary};
      /* border-bottom: 4px solid ${({ theme }) => theme.colors.secondary}; */
    }
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
