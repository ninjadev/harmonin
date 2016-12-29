const path = require('path');


module.exports = {
  entry: "./harmonin.jsx",
  output: {
    path: __dirname,
    filename: "compiled.js"
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react']
      }
    }, {
      test: /\.css$/,
      loader: "style!css"
    }]
  }
};
