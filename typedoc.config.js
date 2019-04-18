const path = require('path')
const fs = require('fs')

const excludes = [
    // { dir: '', exceptions: [ ... ] }
]

const exclude = excludes.map(({ dir, exceptions }) => {
  const files = fs.readdirSync(path.resolve('src', dir))
    .filter(file => !exceptions.some(ex => ex === file))

  return files.map(file => `**/${dir}/${file}`)
}).reduce((flat, arr) => flat.concat(arr), [])

module.exports = {
  mode: 'file',
  out: 'dist/docs',
  module: 'commonjs',
  target: 'es5',
  theme: 'default',
  excludeExternals: true,
  includeDeclarations: true,
  excludePrivate: true,
  excludeNotExported: true,
  stripInternal: true,
  readme: "none",
//  externalPattern: 'node_modules/@tensorflow',
  exclude
}
