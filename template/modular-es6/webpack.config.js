
const debug = process.env.NODE_ENV !== 'production';
// const mode = process.env.NODE_ENV || "development";
const webpack = require('webpack');
const slsw = require('serverless-webpack');

module.exports = {
  // mode,
  devtool: debug ? 'inline-sourcemap' : null,
  entry: slsw.lib.entries,
  target: 'node',
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};