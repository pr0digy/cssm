const path = require('path')
const webpack = require('webpack')
const HappyPack = require('happypack')
const _ = require('lodash')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const VersionPlugin = require('./webpack.version.js')
const pckg = require('./package.json')
const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

var plugins = [

	new HappyPack({
		id: 'js',
		loaders: ['babel-loader'],
		// verbose: false,
		threads: 4
	}),


	// new HappyPack({
	// 	id: 'styles',
	// 	loaders: [
	// 		'style-loader',
	// 		{
	// 			loader: 'css-loader',
	// 			// options: {
	// 			//   importLoaders: 1 
	// 			// }
	// 		},
	// 		'postcss-loader', 
	// 		'sass-loader'
	// 	],
	// 	// verbose: false
	// }),

	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoEmitOnErrorsPlugin(),
	new webpack.DefinePlugin({
		'process.env': {
			'NODE_ENV': JSON.stringify(nodeEnv)
		}
	}),

	new webpack.optimize.CommonsChunkPlugin({
		name: 'vendor',
		minChunks: Infinity,
		filename: 'vendor.bundle.js'
	}),

	// new webpack.optimize.CommonsChunkPlugin({name: 'meta', chunks: ['vendor'], filename: 'meta.[hash].js'}),
	new webpack.NamedModulesPlugin(),
	new VersionPlugin({ ver: pckg.version }),
	new ProgressBarPlugin()
	// new webpack.optimize.ModuleConcatenationPlugin()
]

if( isProd ) plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}))
// const entry = isProd ? ['./src/index.js'] : ['webpack-hot-middleware/client', './src/index.js']

const entry = isProd ? ['babel-polyfill', './src/index.js'] : [
	'react-hot-loader/patch', 
	'webpack-hot-middleware/client',
	'webpack/hot/only-dev-server',
	'babel-polyfill',
	'./src/index.js'
]

const modulePaths = {
	components: 'src/components',
	configs: 'src/configs',
	containers: 'src/containers',
	helpers: 'src/helpers',
	modules: 'src/modules',
	selectors: 'src/selectors',
	routes: 'src/routes',
	store: 'src/store',
	styles: 'src/styles',
}

module.exports = {

	devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',

	entry: {
		entry: entry,

		vendor: [
			'axios',
			'classnames',
			'history',
			'moment',
			'react',
			'react-dom',
			'react-loader-advanced',
			'react-redux',
			'react-router',
			'react-router-redux',
			'redux',
			'redux-form',
			'redux-persist',
			'redux-thunk',
			'reselect'
		]
	},

	output: {
		path: path.join(__dirname, 'static'),
		filename: 'bundle.js',
		publicPath: '/'
	},

	resolve: {
		extensions: ['.js', '.scss', '.less'],
		alias: _.mapValues(modulePaths, (str) => path.join(process.cwd(), ...str.split('/')))
	},

	plugins: plugins,

	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				include: __dirname,
				exclude: /node_modules/,
				use: ['happypack/loader?id=js']
				// use: ['babel-loader']
			}, {
				test: /\.(css|scss)$/,
				include: __dirname,
				// use: ['happypack/loader?id=styles']
				// use: ['style-loader', 'raw-loader', 'sass-loader'],
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1 // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
						}
					},
					'postcss-loader',
					'sass-loader'
				]
			}
		]
	}
}
