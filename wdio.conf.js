exports.config = {

    /**
     * server configurations
     */
    host: '127.0.0.1',
    port: 4444,

    /**
     * specify test files
     */
    specs: [
        './test/*Test.js'
    ],
    exclude: [
        './test/DomTest.js'
    ],

    /**
     * capabilities
     */
    capabilities: [{
        browserName: 'phantomjs'
    }],

    /**
     * test configurations
     */
    logLevel: 'silent',
    coloredLogs: true,
    screenshotPath: '.screenshots',
    baseUrl: 'http://localhost:8000',
    waitforTimeout: 10000,
    framework: 'mocha',

    reporters: ['spec'],
    reporterOptions: {
        outputDir: './'
    },

    mochaOpts: {
        ui: 'bdd'
    }
}