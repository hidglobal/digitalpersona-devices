const dataFiles = [
  'data/**/*'
].map(pattern => ({
  pattern,
  watched: false,
  included: false,
  served: true,
  nocache: false
}))

let exclude = (
  process.env.UUT
    ? [
      , 'private'
      , 'common'
      , 'auth'
      , 'policy'
      , 'secrets'
      , 'claims'
      , 'admin'
      , 'enroll'
      ]
    : []
  )
    .filter(ex => ex !== process.env.UUT)
    .map(ex => `src/${ex}/*.ts`)


exclude = exclude.concat(
  process.env.EXCLUDE_UNCOMPRESSED
    ? ['**/*.uncompressed.test.ts']
    : []
)

// exclude nodejs tests
exclude = exclude.concat(['**/*.node.test.ts'])

module.exports = function(config) {
  const args = []

  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      {pattern: 'src/**/*.ts' },
    ]
    .concat(dataFiles),
//    exclude,
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.test.json'
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
