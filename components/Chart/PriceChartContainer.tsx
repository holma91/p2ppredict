import { useState } from 'react';
import styled from 'styled-components';
import PriceChart from './PriceChart';

const PriceChartContainer: React.FC = () => {
  const inputCurrency = 'bnb';
  const outputCurrency = 'cake';
  const token0Address = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
  const token1Address = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82';
  const [isPairReversed, setIsPairReversed] = useState(false);

  const currentSwapPrice = {
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 72.2099,
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': 0.013848516616142661,
  };

  return (
    <Cont>
      <PriceChart
        token0Address={isPairReversed ? token1Address : token0Address}
        token1Address={isPairReversed ? token0Address : token1Address}
        inputCurrency={isPairReversed ? outputCurrency : inputCurrency}
        outputCurrency={isPairReversed ? inputCurrency : outputCurrency}
        currentSwapPrice={currentSwapPrice}
      />
    </Cont>
  );
};

const Cont = styled.div`
  height: 500px;
  width: 900px;
`;

export default PriceChartContainer;
