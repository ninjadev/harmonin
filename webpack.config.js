module.exports = {
  entry: "./harmonin.js",
  output: {
    path: __dirname,
    filename: "compiled.js"
  },
  module: {
    loaders: [
    { test: /\.css$/, loader: "style!css" }
    ]
  }
};
