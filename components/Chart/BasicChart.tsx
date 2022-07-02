import { useState, memo } from 'react';
import styled from 'styled-components';
import { getTimeWindowChange } from './utils/utils';
import { getPrices } from '../../data/mockPrices';
import SwapLineChart from './SwapLineChart';

type BasicChartProps = {
  height: number;
  width: number;
  chartHeight: number;
  token0Address: string;
  token1Address: string;
  inputCurrency: string;
  outputCurrency: string;
  currentSwapPrice: any;
};

const BasicChart = ({
  height,
  width,
  chartHeight,
  token0Address,
  token1Address,
  inputCurrency,
  outputCurrency,
  currentSwapPrice,
}: BasicChartProps) => {
  const timeWindow = 0;

  const pairPrices = getPrices();
  console.log(pairPrices);

  const pairId = '0x0ed7e52944161450477ee417de9cd3a859b14fd0';

  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverDate, setHoverDate] = useState<string | undefined>();
  const valueToDisplay = hoverValue || pairPrices[pairPrices.length - 1]?.value;
  const { changePercentage, changeValue } = getTimeWindowChange(pairPrices);
  const isChangePositive = changeValue >= 0;

  const locale = 'en-US';
  const currentDate = new Date().toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <StyledFlex>
        <div className="inner">
          <div className="inner-inner">
            <span className="price">{valueToDisplay.toFixed(2)}</span>
            <span className="change">
              +{changeValue.toFixed(2)} ({changePercentage})
            </span>
          </div>
          <div className="date">{hoverDate || currentDate}</div>
        </div>
        <div>
          <ButtonMenu2>
            <Button active={timeWindow === 0}>24H</Button>
            <Button active={false}>1W</Button>
            <Button active={false}>1M</Button>
            <Button active={false}>1Y</Button>
          </ButtonMenu2>
        </div>
      </StyledFlex>
      <Box height={chartHeight}>
        <SwapLineChart
          data={pairPrices}
          setHoverValue={setHoverValue}
          setHoverDate={setHoverDate}
          isChangePositive={isChangePositive}
          timeWindow={timeWindow}
        />
      </Box>
    </>
  );
};

type BoxProps = {
  height: number;
};

const Box = styled.div<BoxProps>`
  height: ${({ height }) => height + 'px'};
  width: 100%;
  padding: 1rem;
`;

const StyledFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  width: 100%;

  .inner {
    display: flex;
    flex-direction: column;
    padding-top: 0.75rem;
  }

  .date {
    font-size: 0.9rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.primary};
  }

  .inner-inner {
    display: flex;
    align-items: end;
    gap: 0.5rem;

    .price {
      font-size: 2.5rem;
      font-weight: 600;
    }

    .change {
      font-size: 1.25rem;
      font-weight: 600;
      padding-bottom: 0.25rem;
    }
  }
`;

const ButtonMenu2 = styled.div`
  /* width: 100%; */
  display: flex;
  background-color: #47b5ff;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

type ButtonProps = {
  active: boolean;
};

const Button = styled.button<ButtonProps>`
  padding: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: 0;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : 'inherit'};
  color: ${({ theme, active }) => (active ? 'white' : 'inherit')};

  :hover {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export default memo(BasicChart, (prev, next) => {
  return (
    prev.token0Address === next.token0Address &&
    prev.token1Address === next.token1Address &&
    ((prev.currentSwapPrice !== null &&
      next.currentSwapPrice !== null &&
      prev.currentSwapPrice[prev.token0Address] ===
        next.currentSwapPrice[next.token0Address] &&
      prev.currentSwapPrice[prev.token1Address] ===
        next.currentSwapPrice[next.token1Address]) ||
      (prev.currentSwapPrice === null && next.currentSwapPrice === null))
  );
});
