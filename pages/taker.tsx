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
        <Overview>
          <div className="header">
            <h4>Markets</h4>
          </div>
          <div className="expires">
            <h6>Expires: today</h6>
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
`;

const Right = styled.div`
  height: 90vh;
  overflow-y: scroll;
`;

const Overview = styled.div`
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

  .expires {
    padding: 0.65rem 1.4rem;
    display: flex;
    justify-content: space-between;
    background-color: ${({ theme }) => theme.colors.gray[100]};
    h6 {
      color: #f0f0f0;
      font-size: ${({ theme }) => theme.typeScale.header6};
      font-weight: 500;
    }
  }
`;

export default Taker;
