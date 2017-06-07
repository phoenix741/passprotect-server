'use strict';

const config = require('config');
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const { graphqlPromise } = require('./common/services/graphql');

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
const mode = process.env.MODE || 'dev';

var piwikEnable = process.env.PIWIK_ENABLED;
if (piwikEnable === undefined) {
	piwikEnable = true;
}
const piwikSiteUrl = process.env.PIWIK_SITE_URL || '//stats.shadoware.org/';
const piwikSiteId = process.env.PIWIK_SITE_ID || 36;

const distFolder = path.join('dist', mode);

const pluginsProd = mode === 'prod' ? [
	new webpack.optimize.UglifyJsPlugin({
		sourceMap: true,
		minimize: true,
		comments: false
	})
] : [];

const htmlWebpackPluginOptions = {
	baseUrl: '/',
	template: path.join(__dirname, 'client', 'scripts', 'base.pug'),
	inject: 'body',
	minify: {
		minifyJS: true
	},
	hash: true
};

if (piwikEnable) {
	htmlWebpackPluginOptions.piwik = {
		siteUrl: piwikSiteUrl,
		siteId: piwikSiteId
	};
}

const webpackConfig = function(schema) {
	return {
		devtool: mode === 'prod' ? 'source-map' : 'cheap-module-inline-source-map',
		cache: true,
		context: path.join(__dirname, 'client', 'scripts'),
		entry: {
			'bundle': './main.js'
		},
		output: {
			path: path.resolve(distFolder),
			filename: '[name].js',
			sourceMapFilename: '[name].js.map',
			chunkFilename: '[name].chunk.js',
			publicPath: '/'
		},
		stats: {
			colors: true,
			reasons: true
		},
		resolve: {
			extensions: ['.js', '.json', '.css', '.html', '.sass', '.scss'],
			alias: {
				'nscommon': path.join(__dirname, 'common'),
				'nsclient': path.join(__dirname, 'client', 'scripts'),
				'nsimages': path.join(__dirname, 'client', 'img'),
				'crypto': require.resolve('crypto-browserify'),
				'vue$': 'vue/dist/vue.esm.js'
			},
			modules: [
				path.resolve(path.join(__dirname, 'node_modules')),
				path.resolve(path.join(__dirname, 'bower_components'))
			]
		},
		module: {
			rules: [
				{test: /\.jsx?$/, exclude: /(node_modules|bower_components|externals)/, loader: 'babel-loader'},
				{test: /\.ejs$/, loader: 'ejs-loader'},
				{test: /\.pug/, loader: 'pug-loader'},
				{
					test: /\.(jpe?g|png|gif|svg)$/i,
					use: [
						{loader: 'url-loader', options: {limit: 100000, name: 'img/[name].[ext]'}},
						{loader: 'img-loader', options: {optimizationLevel: 5, progressive: true} }
					]
				},
				{
					test: /\.css$/,
					loader: extractTextPluginLoader('style-loader')
				},
				{
					test: /\.(scss|sass)$/,
					loader: extractTextPluginLoader('style-loader', 'sass-loader'),
					include: [/client/]
				},
				{
					test: /\.(styl|stylus)$/,
					loader: extractTextPluginLoader('style-loader', 'stylus-loader'),
					include: [/client/]
				},
				{
					test: /\.(woff2?|eot|ttf|svg)$/,
					loader: 'url-loader',
					options: {
						name: 'fonts/[hash].[ext]',
						prefix: 'font/',
						limit: 5000
					}
				},
				{test: /\.html$/, loader: 'html-loader', options: {interpolate: true, minimize: false}},
				{test: /\.yml$/, use: [{loader: 'json-loader'}, {loader: 'yaml-loader'}]},
				{test: /\.vue$/, loader: 'vue-loader', options: {extractCSS: true, esModule: true}},
				{test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: 'graphql-tag/loader'}
			]
		},
		devServer: {
			historyApiFallback: true,
			hot: true,
			// Parse host and port from env so this is easy to customize.
			host: host,
			port: port
		},
		performance: {
			hints: false
		},
		plugins: [
			new LodashModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'__DEV__': mode === 'prod' ? JSON.stringify('production') : JSON.stringify('developpement'),
				'process.env': {
					'NODE_ENV': mode === 'prod' ? JSON.stringify('production') : JSON.stringify('developpement')
				},
				'__PIWIK_ENABLED__': piwikEnable,
				'__PASSPROTECT_CONFIG__': JSON.stringify(config.get('config.client')),
				'__GRAPHQL_SCHEMA__': JSON.stringify(schema)
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'vendors',
				filename: 'vendors.js',
				minChunks(module, count) {
					var context = module.context;
					if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
						return false;
					}
					return context && context.indexOf('node_modules') >= 0;
				}
			}),
			new ExtractTextPlugin('[name].css'),
			new HtmlwebpackPlugin(htmlWebpackPluginOptions),
			// copy other files
			new CopyWebpackPlugin([
				{from: 'index.!(html)'},
				{from: './**/resources/**/*.*'}
			])
		].concat(pluginsProd)
	};
};

function extractTextPluginLoader(fallbackLoader, loader) {
	const result = {
		fallback: fallbackLoader,
		use: [
			{loader: 'css-loader', options: {sourceMap: true, importLoaders: loader ? 2 : 1}},
			{loader: 'postcss-loader',
				options: {
					sourceMap: true,
					plugins: () => [autoprefixer({browsers: ['last 2 versions', 'android >= 4', 'not ie <= 11']})]
				}
			}
		]
	};
	if (loader) {
		result.use.push({loader, options: {sourceMap: true}});
	}

	return ExtractTextPlugin.extract(result);
}

module.exports = graphqlPromise.then(function(schema) {
	return webpackConfig(schema);
});
