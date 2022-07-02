import { useState } from 'react';
import styled from 'styled-components';
import PriceChart from './PriceChart';

type PriceChartContainerProps = {
  height: number;
  width: number;
  chartHeight: number;
};

const PriceChartContainer = ({
  height,
  width,
  chartHeight,
}: PriceChartContainerProps) => {
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
    <ChartContainer height={height} width={width}>
      <PriceChart
        height={height}
        width={width}
        chartHeight={chartHeight}
        token0Address={isPairReversed ? token1Address : token0Address}
        token1Address={isPairReversed ? token0Address : token1Address}
        inputCurrency={isPairReversed ? outputCurrency : inputCurrency}
        outputCurrency={isPairReversed ? inputCurrency : outputCurrency}
        currentSwapPrice={currentSwapPrice}
      />
    </ChartContainer>
  );
};

const ChartContainer = styled.div<{ height: number; width: number }>`
  display: flex;
  height: ${({ height }) => height + 'px'};
  width: ${({ width }) => width + 'px'};
`;

export default PriceChartContainer;
