import {
  Button,
  ExpandIcon,
  Flex,
  IconButton,
  ShrinkIcon,
  SyncAltIcon,
  Text,
  LineGraphIcon,
} from '@pancakeswap/uikit';
import styled from 'styled-components';
import BasicChart from './BasicChart';
const StyledPriceChart = styled.div<{
  $isDark: boolean;
  $isExpanded: boolean;
  $isFullWidthContainer?: boolean;
}>`
  border: none;
  border-radius: 0.2rem;
  width: 100%;
  padding-top: 36px;

  padding-top: 8px;
  background: ${({ $isDark }) =>
    $isDark ? 'rgba(39, 38, 44, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
  border: ${({ theme }) => `1px solid ${theme.colors.cardBorder}`};
  width: ${({ $isExpanded, $isFullWidthContainer }) =>
    $isFullWidthContainer || $isExpanded ? '100%' : '50%'};
  height: ${({ $isExpanded }) =>
    $isExpanded ? 'calc(100vh - 100px)' : '516px'};
`;
// ${({ theme }) => theme.mediaQueries.sm} {

const ChartButton = styled(Button)`
  background-color: ${({ $active, theme }) =>
    $active && `${theme.colors.primary}0f`};
  padding: 4px 8px;
  border-radius: 6px;
`;

type PriceChartProps = {
  inputCurrency: any;
  outputCurrency: any;
  isDark: any;
  isFullWidthContainer: any;
  token0Address: any;
  token1Address: any;
  currentSwapPrice: any;
};

const PriceChart = ({
  inputCurrency,
  outputCurrency,
  isDark,
  isFullWidthContainer,
  token0Address,
  token1Address,
  currentSwapPrice,
}: PriceChartProps) => {
  const isDesktop = true;

  return (
    <StyledPriceChart
      $isDark={isDark}
      $isExpanded={false}
      $isFullWidthContainer={isFullWidthContainer}
    >
      <Flex justifyContent="space-between" px="24px">
        <Flex alignItems="center">
          {inputCurrency && (
            <Text color="text" bold>
              {outputCurrency
                ? `${inputCurrency.symbol}/${outputCurrency.symbol}`
                : inputCurrency.symbol}
            </Text>
          )}
          <IconButton variant="text">
            <SyncAltIcon ml="6px" color="primary" />
          </IconButton>
          <Flex>
            <ChartButton
              aria-label="Basic"
              title="Basic"
              $active={true}
              scale="sm"
              variant="text"
              color="primary"
              mr="8px"
            >
              {isDesktop ? 'Basic' : <LineGraphIcon color="primary" />}
            </ChartButton>
          </Flex>
        </Flex>
        <Flex>
          <IconButton variant="text">
            <ExpandIcon color="text" />
          </IconButton>
        </Flex>
      </Flex>
      <BasicChart
        token0Address={token0Address}
        token1Address={token1Address}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        currentSwapPrice={currentSwapPrice}
      />
    </StyledPriceChart>
  );
};

export default PriceChart;
