import Link from 'next/link';
import styled from 'styled-components';
import { PrimaryButton } from './Buttons';

const Header = () => {
  return (
    <HeaderContainer>
      <Title>
        <Link href="/">
          <a>p2ppredict</a>
        </Link>
      </Title>
      <ButtonContainer>
        <Link href="/positions">
          <PrimaryButton>
            <a>log in</a>
          </PrimaryButton>
        </Link>
      </ButtonContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid #ecedef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
`;
const Title = styled.div`
  a {
    font-weight: 600;
    font-size: 25px;
    :hover {
      color: #0f6cf7;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: space-between;
  align-items: center;
`;

export default Header;