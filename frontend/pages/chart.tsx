import type { NextPage } from 'next';
import styled from 'styled-components';
import PriceChartContainer from '../components/Chart/PriceChartContainer';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100vh;
`;

const Maker: NextPage = () => {
  return (
    <Container>
      <PriceChartContainer height={375} width={500} chartHeight={240} />
    </Container>
  );
};

export default Maker;
