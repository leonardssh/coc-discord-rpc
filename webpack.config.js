const webpack = require('webpack');
const path = require('path');
const extensionPackage = require('./package.json');
const { execSync } = require('child_process');

const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).slice(0, 8);

module.exports = {
	entry: './src/index.ts',
	target: 'node',
	mode: 'production',
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.js', '.ts']
	},
	externals: {
		'coc.nvim': 'commonjs coc.nvim'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								sourceMap: true
							}
						}
					}
				]
			}
		]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'index.js',
		libraryTarget: 'commonjs'
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			EXTENSION_NAME: `${extensionPackage.publisher}.${extensionPackage.name}`,
			EXTENSION_VERSION: `${extensionPackage.version}-${commitHash}`
		})
	],
	node: {
		__dirname: false,
		__filename: false
	}
};
