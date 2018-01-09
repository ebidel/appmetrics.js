module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {
      'src/appmetrics.js': ['babel'],
      'test/**/*.js': ['babel']
    },
    files: ['src/appmetrics.js', 'test/**/*.js'],
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity
  });
};
