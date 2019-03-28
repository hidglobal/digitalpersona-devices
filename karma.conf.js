let exclude = (
  process.env.UUT
        ? [ 'auth', 'policy', 'secrets', 'claims', 'admin', 'enroll']
        : [])
    .filter(ex => ex !== process.env.UUT)
    .map(ex => `src/${ex}/*.ts`)

module.exports = function(config) {
  const args = []

  config.set({
    files: [
        {pattern: '@types/WebSdk/*.js'},
        {pattern: 'src/**/*.ts' }
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    preprocessors: {
        'src/**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.test.json',
      bundlerOptions: {
        resolve: {
            alias: {
                'WebSdk': '@types/WebSdk/index.js'
            },
            extensions: ['.js']
        }
    }
    },
    browsers: ['Chrome'],
    customLaunchers: {
        IE_no_addons: {
          base:  'IE',
          flags: ['-extoff']
        }
    },
    mime: {
        'text/x-typescript': ['ts','tsx']
    },
    browserNoActivityTimeout: 120000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout : 120000,
    captureTimeout: 60000,
    client: {
      jasmine: {
        timeoutInterval: 60000,
        args
      }
    }
  })
}
