import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/setup-openmodelica.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    typescript(),
    json(),
    nodeResolve({preferBuiltins: true}),
    commonjs()
  ],
  onwarn(warning, warn) {
    if (warning.id?.includes('node_modules')) return
    warn(warning)
  }
}

export default config
