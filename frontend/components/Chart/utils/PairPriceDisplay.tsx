import { Flex, Skeleton, Text } from '@pancakeswap/uikit';
import { FC } from 'react';
import styled from 'styled-components';
import { FlexGap, FlexGapProps } from './Flex';

interface TokenDisplayProps extends FlexGapProps {
  value?: number | string;
  inputSymbol?: string;
  outputSymbol?: string;
  format?: boolean;
}

const TextLabel = styled(Text)`
  font-size: 32px;
  line-height: 1.1;
  font-size: 40px;
`;
// ${({ theme }) => theme.mediaQueries.lg} {

const PairPriceDisplay: FC<TokenDisplayProps> = ({
  value,
  inputSymbol,
  outputSymbol,
  children,
  format = true,
  ...props
}) => {
  const formattedPrice = 72.01;

  return value ? (
    <FlexGap alignItems="baseline" {...props}>
      <Flex alignItems="inherit">
        <TextLabel mr="8px" bold>
          {formattedPrice}
        </TextLabel>
        {inputSymbol && outputSymbol && (
          <Text color="textSubtle" fontSize="20px" bold lineHeight={1.1}>
            {`${inputSymbol}/${outputSymbol}`}
          </Text>
        )}
      </Flex>
      {children}
    </FlexGap>
  ) : (
    <Skeleton height="36px" width="128px" {...props} />
  );
};

export default PairPriceDisplay;
