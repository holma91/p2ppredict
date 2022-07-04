import type { NextPage } from 'next';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Home: NextPage = () => {
  return <Container>hey man</Container>;
};

export default Home;
