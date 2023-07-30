const typescript = require('rollup-plugin-typescript2');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');

module.exports = {
  input: 'src/extension.ts',
  output: [
    {
      file: 'dist/extension.js',
      format: 'cjs',
    }
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    resolve(),
    commonjs(),
    terser()
  ],
  external: ['vscode']
};
