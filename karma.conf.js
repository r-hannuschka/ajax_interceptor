// Karma configuration
// Generated on Wed Nov 09 2016 10:22:26 GMT+0100 (CET)
var testfiles = process.env.TESTFILES || '{"pattern": "./tests/**/*.spec.js", "included": true}';
var serveFiles = [
  'helper.js',
  'bower_components/jquery/jquery.js',
  './bin/*.js',
];

testfiles = testfiles.split('|').map(function(pattern) {
    return JSON.parse(pattern);
});

serveFiles = serveFiles.concat(testfiles);

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon'],

    // list of files / patterns to load in the browser
    files: serveFiles,

    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],

    plugins: [
        'karma-chai',
        'karma-mocha',
        'karma-sinon',
        'karma-phantomjs-launcher',
        'karma-mocha-reporter'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
