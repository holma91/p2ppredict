import type { NextPage } from 'next';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import PriceChartContainer from '../components/Chart/PriceChartContainer';
import { prices } from '../data/mockPrices';

const data = [
  { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 450, pv: 2460, amt: 2470 },
  { name: 'Page C', uv: 698, pv: 2560, amt: 2770 },
  { name: 'Page D', uv: 1698, pv: 2560, amt: 2770 },
  { name: 'Page E', uv: 900, pv: 2560, amt: 2770 },
];

const CustomLineChart = () => (
  <LineChart width={600} height={400} data={data}>
    <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
  </LineChart>
);

enum PairDataTimeWindowEnum {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

const dateFormattingByTimewindow: Record<
  PairDataTimeWindowEnum,
  Intl.DateTimeFormatOptions
> = {
  [PairDataTimeWindowEnum.DAY]: {
    hour: '2-digit',
    minute: '2-digit',
  },
  [PairDataTimeWindowEnum.WEEK]: {
    month: 'short',
    day: '2-digit',
  },
  [PairDataTimeWindowEnum.MONTH]: {
    month: 'short',
    day: '2-digit',
  },
  [PairDataTimeWindowEnum.YEAR]: {
    month: 'short',
    day: '2-digit',
  },
};

const CustomAreaChart = () => {
  const locale = 'en-US';
  const timeWindow = 0;
  const dateFormatting = dateFormattingByTimewindow[timeWindow];
  const getChartColors = (isChangePositive: boolean) => {
    return isChangePositive
      ? { gradient1: '#00E7B0', gradient2: '#0C8B6C', stroke: '#31D0AA' }
      : { gradient1: '#ED4B9E', gradient2: '#ED4B9E', stroke: '#ED4B9E ' };
  };

  const colors = getChartColors(true);

  return (
    <ResponsiveContainer>
      <AreaChart
        data={prices}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.34} />
            <stop offset="100%" stopColor={colors.gradient2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tickFormatter={(time) => time.toLocaleString(locale, dateFormatting)}
          minTickGap={8}
        />
        <YAxis
          dataKey="value"
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          hide
        />
        <Tooltip
          cursor={{ stroke: 'blue' }}
          contentStyle={{ display: 'none' }}
        />
        <Area
          dataKey="value"
          type="linear"
          stroke={colors.stroke}
          fill="url(#gradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Maker: NextPage = () => {
  return (
    <>
      <Container>
        <PriceChartContainer></PriceChartContainer>
      </Container>
    </>
  );
};

interface BoxProps {
  height: string;
  width: string;
}

const Box = styled.div<BoxProps>`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`;

export default Maker;
