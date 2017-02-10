const path = require('path');

const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTemplate = require('html-webpack-template');

const srcPath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'htdocs');

const isProduction = process.env.NODE_ENV === 'production';

const commonPlugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity,
    filename: '[name].[hash].js',
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
    },
  }),
  new HtmlWebpackPlugin({
    template: HtmlWebpackTemplate,
    title: 'Swagger UI',
    inject: false,
    minify: {
      collapseWhitespace: true,
    },
  }),
];

const productionPlugins = [
  ...commonPlugins,
  new ExtractTextPlugin({
    filename: '[name].[chunkhash].css',
    allChunks: true,
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    },
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 15 }),
  new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 10000 }),
  new CompressionPlugin({
    threshold: 1024,
  }),
];

const developmentPlugins = [
  ...commonPlugins,
  new webpack.HotModuleReplacementPlugin(),
];

module.exports = {
  context: srcPath,

  entry: {
    app: './index.js',
  },
  output: {
    path: distPath,
    filename: isProduction ? '[name].[chunkhash].js' : 'app.js',
  },

  devtool: isProduction ? 'hidden-source-map' : 'source-map',

  devServer: {
    contentBase: distPath,
    compress: true,
    hot: true,
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
        ],
      },
      {
        test: /node_modules\/swagger-ui\/dist\/.*\.js$/,
        loaders: [
          'script-loader',
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(gif|png)$/,
        loaders: [
          'url-loader?limit=100000',
        ],
      },
      {
        test: /\.handlebars$/,
        loader: 'handlebars-loader',
        query: {
          helperDirs: [
            path.resolve(srcPath, 'helpers'),
          ],
        },
      },
    ],
  },

  plugins: isProduction ? productionPlugins : developmentPlugins,

  resolve: {
    alias: {
      querystring: 'querystring-browser',
    },
  },
};