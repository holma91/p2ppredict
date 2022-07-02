/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	compiler: {
		styledComponents: true,
	},
	images: {
		domains: ['assets.vercel.com', 'cryptologos.cc'],
	},
};

module.exports = nextConfig;
