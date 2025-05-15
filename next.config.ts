/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
				pathname: '/**',
			},
		],
	},
	// Configure webpack to properly handle WebAssembly modules
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	webpack: (config: any) => {
		// Allow importing wasm files
		config.experiments = { ...config.experiments, asyncWebAssembly: true };

		// Optimize WASM loading
		config.module.rules.push({
			test: /\.wasm$/,
			type: 'asset/resource',
		});

		// Ignore circular dependency warnings from @jsquash libraries
		config.ignoreWarnings = [
			// Ignore warnings about circular dependencies in @jsquash libraries
			/Circular dependency between chunks with runtime/,
			// Ignore critical dependency warnings from @jsquash libraries
			/Critical dependency: the request of a dependency is an expression/
		];

		return config;
	},
};

export default nextConfig;

// G-2GWJ1B98F3