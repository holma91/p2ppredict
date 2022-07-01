import {
  Box,
  ButtonMenu,
  ButtonMenuItem,
  Flex,
  Text,
} from '@pancakeswap/uikit';
import { useState, memo } from 'react';
import PairPriceDisplay from './utils/PairPriceDisplay';
import { getTimeWindowChange } from './utils/utils';
import { prices } from '../../data/mockPrices';
import SwapLineChart from './SwapLineChart';

type BasicChartProps = {
  token0Address: any;
  token1Address: any;
  inputCurrency: any;
  outputCurrency: any;
  currentSwapPrice: any;
};

const BasicChart = ({
  token0Address,
  token1Address,
  inputCurrency,
  outputCurrency,
  currentSwapPrice,
}: BasicChartProps) => {
  const timeWindow = 0;

  const pairPrices = prices;
  const pairId = '0x0ed7e52944161450477ee417de9cd3a859b14fd0';

  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverDate, setHoverDate] = useState<string | undefined>();
  const valueToDisplay = hoverValue || pairPrices[pairPrices.length - 1]?.value;
  const { changePercentage, changeValue } = getTimeWindowChange(pairPrices);
  const isChangePositive = changeValue >= 0;
  const chartHeight = '378px';

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
      <Flex
        flexDirection={['column', null, null, null, null, null, 'row']}
        alignItems={['flex-start', null, null, null, null, null, 'center']}
        justifyContent="space-between"
        px="24px"
      >
        <Flex flexDirection="column" pt="12px">
          <PairPriceDisplay
            value={valueToDisplay}
            inputSymbol={inputCurrency?.symbol}
            outputSymbol={outputCurrency?.symbol}
          >
            <Text
              color={isChangePositive ? 'success' : 'failure'}
              fontSize="20px"
              ml="4px"
              bold
            >
              {`${isChangePositive ? '+' : ''}${changeValue.toFixed(
                3
              )} (${changePercentage}%)`}
            </Text>
          </PairPriceDisplay>
          <Text small color="secondary">
            {hoverDate || currentDate}
          </Text>
        </Flex>
        <Box>
          <ButtonMenu activeIndex={timeWindow} scale="sm">
            <ButtonMenuItem>24H</ButtonMenuItem>
            <ButtonMenuItem>1W</ButtonMenuItem>
            <ButtonMenuItem>1M</ButtonMenuItem>
            <ButtonMenuItem>1Y</ButtonMenuItem>
          </ButtonMenu>
        </Box>
      </Flex>
      <Box height={chartHeight} p={'16px'} width="100%">
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
