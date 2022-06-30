import type { NextPage } from 'next'
import styled from 'styled-components';

import { PrimaryButton, SecondaryButton, TertiaryButton } from '../components/Buttons';

const Container = styled.div`
    display: flex;

    > button {
        margin: 10px;
    }
`;

const Home: NextPage = () => {
    return (
        <Container>
            <PrimaryButton>Hello world</PrimaryButton>
            <SecondaryButton>Hello world</SecondaryButton>
            <TertiaryButton>Hello world</TertiaryButton>
        </Container>
    );
};


export default Home
