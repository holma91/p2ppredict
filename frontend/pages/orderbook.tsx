import styled from 'styled-components';
import OrderBook from '../components/OrderBook';

export default function ComponentDesignPage() {
	return (
		<Container>
			<OrderBook></OrderBook>
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: ${({ theme }) => theme.background.primary};
	color: ${({ theme }) => theme.text.primary};
`;
