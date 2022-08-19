import { useState } from 'react';
import styled from 'styled-components';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
// import { mumbai } from '../../contracts/scripts/addresses';

const mumbai = {
	predictionMarket: '0x73c349fb2247d24CE7661b788299aDF63Ff5756E',
	exchange: '0x5078E54E37C98BDF2624f671cbeC46dF62467EAB',
};

export default function Test() {
	const { config: setApprovalForAllConfigX } = usePrepareContractWrite({
		addressOrName: mumbai.predictionMarket,
		contractInterface: PredictionMarket.abi,
		functionName: 'setApprovalForAll',
		args: ['0x5078E54E37C98BDF2624f671cbeC46dF62467EAB', true],
	});

	const x = useContractWrite(setApprovalForAllConfigX);

	console.log('x', x.write);

	const { config: setApprovalForAllConfigY } = usePrepareContractWrite({
		addressOrName: mumbai.predictionMarket,
		contractInterface: PredictionMarket.abi,
		functionName: 'setApprovalForAll',
		args: ['0xdcb9048D6bb9C31e60af7595ef597ADC642B9cB6', true],
	});

	const y = useContractWrite(setApprovalForAllConfigY);

	console.log('y', y.write);

	return <Container></Container>;
}

// 375, 500, 240

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;

	gap: 1rem;

	height: 100vh;
`;
