var webConfig = {
  entry: './MicrodropAsync.js',
  output: {
    filename: 'bundle.web.js',
    // use library + libraryTarget to expose module globally
    library: 'MicrodropAsync',
    libraryTarget: 'var'
  }
};

module.exports = webConfig;
