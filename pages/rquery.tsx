import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';

const fetcher = async ({ queryKey }: any) => {
	console.log("aaaaahhhhh i'm fetchingggggg");

	const [_key, { repo }] = queryKey;
	const response = await fetch(`https://api.github.com/repos/tannerlinsley/${repo}`);
	return response.json();
};

export default function Rquery() {
	const [repo, setRepo] = useState('react-query');
	const { isLoading, isError, error, data } = useQuery(['repoData', { repo: repo }], fetcher, {
		staleTime: Infinity,
	});

	if (isLoading) return 'Loading...';

	if (isError) return 'An error has occurred: ' + error.message;

	return (
		<div>
			<label htmlFor="repos">Choose repo:</label>
			<select value={repo} name="repos" onChange={e => setRepo(e.target.value)}>
				<option value="react-query">react-query</option>
				<option value="react-table">react-table</option>
				<option value="react-charts">react-charts</option>
			</select>
			<h1>{data.name}</h1>
			<p>{data.description}</p>
			<strong>👀 {data.subscribers_count}</strong> <strong>✨ {data.stargazers_count}</strong>{' '}
			<strong>🍴 {data.forks_count}</strong>
		</div>
	);
}
