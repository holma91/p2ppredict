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
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>BTC</p>
                <p className="live-price">$19003</p>
              </AssetDiv>
              <p>$20000</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <div>2.10</div>
              <div>1.90</div>
            </div>
          </MarketContainer>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>ETH</p>
                <p className="live-price">$990</p>
              </AssetDiv>
              <p>$1000</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <div>2.00</div>
              <div>2.00</div>
            </div>
          </MarketContainer>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>AVAX</p>
                <p className="live-price">$13</p>
              </AssetDiv>
              <p>$14</p>
              <p>07-01</p>
            </div>
            <div className="choice">
              <div>1.50</div>
              <div>3.00</div>
            </div>
          </MarketContainer>
          <div className="section-header">
            <h6>Expires: This Week</h6>
            <div className="choice">
              <p>OVER</p>
              <p>UNDER</p>
            </div>
          </div>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>SOL</p>
                <p className="live-price">$30</p>
              </AssetDiv>
              <p>$33</p>
              <p>07-03</p>
            </div>
            <div className="choice">
              <div>2.20</div>
              <div>1.75</div>
            </div>
          </MarketContainer>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>ETH</p>
                <p className="live-price">$990</p>
              </AssetDiv>
              <p>$1040</p>
              <p>07-02</p>
            </div>
            <div className="choice">
              <div>2.20</div>
              <div>1.77</div>
            </div>
          </MarketContainer>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>AVAX</p>
                <p className="live-price">$13</p>
              </AssetDiv>
              <p>$15</p>
              <p>07-04</p>
            </div>
            <div className="choice">
              <div>2.00</div>
              <div>2.00</div>
            </div>
          </MarketContainer>
          <MarketContainer>
            <div className="market">
              <AssetDiv>
                <p>LINK</p>
                <p className="live-price">$7.12</p>
              </AssetDiv>
              <div>$7.5</div>
              <div>07-05</div>
            </div>
            <div className="choice">
              <div>2.00</div>
              <div>2.00</div>
            </div>
          </MarketContainer>
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

const MarketContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  /* padding: 0.65rem 1.4rem; */
  display: grid;
  justify-items: stretch;
  align-items: stretch; //
  grid-template-columns: 1fr 1fr;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  color: #f0f0f0;
  h6 {
    font-size: ${({ theme }) => theme.typeScale.smallParagraph};
    font-weight: 500;
  }

  .choice {
    display: flex;
    justify-content: space-evenly;
    width: 100%;

    align-items: center;

    div,
    p {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: ${({ theme }) => theme.typeScale.helperText};

      :hover {
        background-color: #eccccc;
      }
    }

    :hover {
      cursor: pointer;
    }
  }

  .market {
    padding: 0.65rem 1.4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      font-size: ${({ theme }) => theme.typeScale.smallParagraph};
    }
  }
`;

const Overview = styled.div`
  .section-header {
    padding: 0.65rem 1.4rem;
    display: grid;
    /* align-items: stretch; */
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
      align-items: center;

      div,
      p {
        font-size: ${({ theme }) => theme.typeScale.helperText};
      }
    }
  }
`;

const AssetDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .live-price {
    font-size: 0.8rem;
  }
`;

export default Taker;
