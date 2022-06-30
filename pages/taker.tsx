import type { NextPage } from 'next';
import styled from 'styled-components';

import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from '../components/Buttons';

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.1rem;
`;

const Taker: NextPage = () => {
  const filledArray = Array(100).fill(0);

  return (
    <Container>
      <Left>
        <div className="header">
          <h4>Markets</h4>
        </div>
        <Overview>
          <div className="section-header">
            <h6>Expires: Today</h6>
            <div className="choice">
              <p>OVER</p>
              <p>UNDER</p>
            </div>
          </div>
          <div className="market-container">
            <div className="market">
              <p>BTC</p>
              <p>$20000</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <p>2.10</p>
              <p>1.90</p>
            </div>
          </div>
          <div className="market-container">
            <div className="market">
              <p>ETH</p>
              <p>$1000</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <p>2.00</p>
              <p>2.00</p>
            </div>
          </div>
          <div className="market-container">
            <div className="market">
              <p>AVAX</p>
              <p>$14</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <p>1.50</p>
              <p>3.00</p>
            </div>
          </div>
        </Overview>
      </Left>
      <Right>
        {filledArray.map((_) => {
          return <p key={Math.random()}>right side</p>;
        })}
      </Right>
    </Container>
  );
};

const Left = styled.div`
  height: 90vh;
  overflow-y: scroll;

  .header {
    padding: 0.65rem 1.4rem;
    display: flex;
    justify-content: space-between;
    background-color: ${({ theme }) => theme.colors.gray[300]};
    h4 {
      color: #f0f0f0;
      font-size: ${({ theme }) => theme.typeScale.header4};
      font-weight: 500;
    }
  }
`;

const Right = styled.div`
  height: 90vh;
  overflow-y: scroll;
`;

const Overview = styled.div`
  .section-header,
  .market-container {
    padding: 0.65rem 1.4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: #f0f0f0;
    h6 {
      font-size: ${({ theme }) => theme.typeScale.smallParagraph};
      font-weight: 500;
    }

    .choice {
      display: flex;
      justify-content: space-evenly;
    }
  }

  .market-container {
    background-color: ${({ theme }) => theme.colors.gray[200]};

    .market {
      display: flex;
      justify-content: space-between;
    }
  }
`;

export default Taker;
