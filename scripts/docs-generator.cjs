// Bootstrap ts-node in CommonJS mode and run the TypeScript generator
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', moduleResolution: 'node' },
})

require('./docs-generator.ts')


