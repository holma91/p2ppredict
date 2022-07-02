import styled from 'styled-components';
import BasicChart from './BasicChart';

const StyledPriceChart = styled.div<{
  $isDark: boolean;
  $isExpanded: boolean;
  $isFullWidthContainer?: boolean;
}>`
  border: none;
  border-radius: 0.2rem;
  padding-top: 36px;

  padding-top: 8px;
  background: ${({ $isDark }) =>
    $isDark ? 'rgba(39, 38, 44, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
  border: ${({ theme }) => `1px solid ${theme.colors.cardBorder}`};
  width: '70%';
  height: '516px';
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

const StyledFlex = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;

  .styledFlex-inner {
    display: flex;
    align-items: center;

    .chosen-assets {
      font-size: ${({ theme }) => theme.typeScale.paragraph};
      font-weight: 600;
    }
  }
`;

const PriceChart = ({
  inputCurrency,
  outputCurrency,
  isDark,
  isFullWidthContainer,
  token0Address,
  token1Address,
  currentSwapPrice,
}: PriceChartProps) => {
  return (
    <StyledPriceChart
      $isDark={isDark}
      $isExpanded={false}
      $isFullWidthContainer={isFullWidthContainer}
    >
      <StyledFlex>
        <div className="styledFlex-inner">
          <div className="chosen-assets">BNB/CAKE</div>
        </div>
      </StyledFlex>
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
