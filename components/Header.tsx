import Link from 'next/link';
import styled from 'styled-components';

const Header = () => {
  return (
    <HeaderContainer>
      <Title>
        <Link href="/">
          <a>Speculate</a>
        </Link>
      </Title>
      <ButtonContainer>
        <Link href="/positions">
          <Button>
            <a>Positions</a>
          </Button>
        </Link>
      </ButtonContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  /* position: fixed; */
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

const Button = styled.button`
  background-color: #0e76fd;
  color: white;
  padding: 10px 20px;
  font-size: 100%;
  font-weight: 700;
  border-radius: 12px;
  min-width: 100px;
  border: none;
  outline: none;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  :hover {
    transform: scale(1.03) perspective(1px);
  }
`;

export default Header;