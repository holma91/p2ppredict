import type { NextPage } from 'next'
import styled from 'styled-components';

import { PrimaryButton, SecondaryButton, TertiaryButton } from '../components/Buttons';

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;

    > button {
        margin: 10px;
    }

    div {
        height: 93vh;
        overflow-y: scroll;
    }
`;

const Home: NextPage = () => {

    const filledArray = Array(100).fill(0);


    return (
        <Container>
                <div className="left">
                    {filledArray.map(_ => {
                        return (
                            <p key={Math.random()}>left side</p>
                        )
                    })}
                </div>
                <div className="right">
                {filledArray.map(_ => {
                        return (
                            <p key={Math.random()}>right side</p>
                        )
                    })}
                </div>
        </Container>
    );
};


export default Home
