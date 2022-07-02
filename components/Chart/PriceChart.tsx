import styled from 'styled-components';
import BasicChart from './BasicChart';
import { assetToImage } from '../../utils/misc';

const StyledPriceChart = styled.div`
  border-radius: 0.2rem;
  padding-top: 0.5rem;
  background-color: ${({ theme }) => `${theme.colors.gray[10]}`};
`;

type PriceChartProps = {
  inputCurrency: any;
  outputCurrency: any;
  token0Address: any;
  token1Address: any;
  currentSwapPrice: any;
};

const PriceChart = ({
  inputCurrency,
  outputCurrency,
  token0Address,
  token1Address,
  currentSwapPrice,
}: PriceChartProps) => {
  return (
    <StyledPriceChart>
      <StyledFlex>
        <div className="styledFlex-inner">
          <img src={assetToImage['bnb']} alt="logo" />
          <img src={assetToImage['btc']} alt="logo" />
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

const StyledFlex = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;

  .styledFlex-inner {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    .chosen-assets {
      font-size: ${({ theme }) => theme.typeScale.header4};
      font-weight: 600;
    }

    img {
      height: 27px;
      width: 27px;
    }
  }
`;

export default PriceChart;
