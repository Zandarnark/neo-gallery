const path = require('node:path')
const Module = require('node:module')

const rootDir = __dirname ? path.resolve(__dirname, '..') : process.cwd()
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(rootDir, 'src', request.slice(2))
  }

  return originalResolveFilename.call(this, request, parent, isMain, options)
}
