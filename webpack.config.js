'use strict';

const config = require('config');
const webpack = require('webpack');
const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
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
	//new webpack.optimize.DedupePlugin(),
	new webpack.optimize.UglifyJsPlugin({
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
	template: path.join(__dirname, 'common', 'templates', 'base.jade'),
	inject: 'body',
	minify: {
		minifyJS: true
	}
};

if (piwikEnable) {
	htmlWebpackPluginOptions.piwik = {
		siteUrl: piwikSiteUrl,
		siteId: piwikSiteId
	};
}

module.exports = {
	devtool: mode === 'prod' ? 'source-map' : 'cheap-module-inline-source-map',
	debug: true,
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
		extensions: ['', '.js', '.json', '.css', '.html', '.sass', '.scss'],
		alias: {
			'nscommon': path.join(__dirname, 'common'),
			'nsclient': path.join(__dirname, 'client', 'scripts'),
			'nsimages': path.join(__dirname, 'client', 'img'),
			'crypto': require.resolve('crypto-browserify')
		},
		root: [
			path.resolve(path.join(__dirname, 'node_modules')),
			path.resolve(path.join(__dirname, 'bower_components'))
		],
		modulesDirectories: ['node_modules', 'bower_components']
	},
	postcss: function () {
		return [autoprefixer];
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components|externals)/,
				cacheable: true,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
					plugins: ['transform-decorators-legacy'],
					presets: ['es2015-loose', 'stage-1']
				}
			},
			{test: /\.ejs$/, loader: 'ejs', cacheable: true},
			{test: /\.jade/, loader: 'jade', cacheable: true},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: ['url?limit=100000&name=img/[name].[ext]', 'img?optimizationLevel=5&progressive=true'],
				cacheable: true
			},
			{test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss'), cacheable: true},
			{
				test: /\.(scss|sass)$/,
				loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass?sourceMap'),
				include: [/client/]
			},
			{test: /\.(woff2?|eot|ttf|svg)$/, loader: 'url?name=fonts/[hash].[ext]&prefix=font/&limit=5000'},
			{test: /\.html$/, loader: 'html?interpolate&-minimize', cacheable: true},
			{test: /\.yml$/, loader: 'json!yaml', cacheable: true},
			{test: /\.json$/, loader: 'json', cacheable: true}
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
		new webpack.ResolverPlugin([
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('package.json', ['browser', 'main']),
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
		]),
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
