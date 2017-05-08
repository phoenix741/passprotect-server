'use strict';

const config = require('config');
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
const mode = process.env.MODE || 'dev';

var piwikEnable = process.env.PIWIK_ENABLED;
if (piwikEnable === undefined) {
	piwikEnable = true;
}
const piwikSiteUrl = process.env.PIWIK_SITE_URL || '//stats-demo.shadoware.org/';
const piwikSiteId = process.env.PIWIK_SITE_ID || 3;

const distFolder = path.join('dist', mode);

const pluginsProd = mode === 'prod' ? [
	new webpack.optimize.UglifyJsPlugin({
		sourceMap: true,
		minimize: true,
		//mangle: false,
		output: {
			comments: false
		},
		compress: {
			warnings: false
		}
	})
] : [];

const htmlWebpackPluginOptions = {
	baseUrl: '/',
	template: path.join(__dirname, 'common', 'templates', 'base.pug'),
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

module.exports = {
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
		publicPath: '/',
		devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]'
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
			'crypto': require.resolve('crypto-browserify')
		},
		modules: [
			path.resolve(path.join(__dirname, 'node_modules')),
			path.resolve(path.join(__dirname, 'bower_components'))
		]
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components|externals)/,
				loader: 'babel-loader',
				options: {
					cacheDirectory: true,
					plugins: ['transform-decorators-legacy'],
					presets: [
						['env', {
							targets: {
								'browsers': ['last 2 versions', 'android >= 4', 'not ie <= 11']
							},
							debug: true,
							modules: false,
							loose: true
						}],
						'stage-1'
					]
				}
			},
			{
				test: /\.ejs$/,
				loader: 'ejs-loader'
			},
			{
				test: /\.pug/,
				loader: 'pug-loader'
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 100000,
							name: 'img/[name].[ext]'
						}
					},
					{
						loader: 'img-loader',
						options: {
							optimizationLevel: 5,
							progressive: true
						}
					}
				]
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
						{loader: 'postcss-loader', options: {sourceMap: true, plugins: () => [autoprefixer({ browsers: ['last 2 versions', 'android >= 4', 'not ie <= 11'] })]}}
					]
				})
			},
			{
				test: /\.(scss|sass)$/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{loader: 'css-loader', options: {sourceMap: true, importLoaders: 2}},
						{loader: 'postcss-loader', options: {sourceMap: true, plugins: () => [autoprefixer({ browsers: ['last 2 versions', 'android >= 4', 'not ie <= 11'] })]}},
						{loader: 'sass-loader', options: {sourceMap: true}}
					]
				}),
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
			{
				test: /\.html$/,
				loader: 'html-loader',
				options: {
					interpolate: true,
					minimize: false
				}
			},
			{
				test: /\.yml$/,
				use: [
					{
						loader: 'json-loader'
					},
					{
						loader: 'yaml-loader'
					}
				]
			}
		]
	},
	devServer: {
		historyApiFallback: true,
		hot: true,
		inline: true,
		progress: true,
		// Display only errors to reduce the amount of output.
		stats: 'errors-only',
		// Parse host and port from env so this is easy to customize.
		host: host,
		port: port
	},
	plugins: [
		new webpack.NormalModuleReplacementPlugin(/jQuery/, 'jquery'),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			_: 'underscore',
			Promise: 'bluebird',
			i18n: 'i18next',
			Backbone: 'backbone',
			Marionette: 'backbone.marionette',
			Hammer: 'hammerjs/hammer'
		}),
		new webpack.DefinePlugin({
			'__DEV__': JSON.stringify('production'),
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			},
			'__PIWIK_ENABLED__': piwikEnable,
			'__PASSPROTECT_CONFIG__': JSON.stringify(config.get('config.client'))
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
