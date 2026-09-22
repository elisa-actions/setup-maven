const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const isDependencyPath = (id) => /[\\/]node_modules[\\/]/.test(id || '');

module.exports = {
  input: 'src/setup-maven.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  onwarn(warning, warn) {
    if (
      warning.code === 'THIS_IS_UNDEFINED' &&
      isDependencyPath(warning.id)
    ) {
      return;
    }

    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      warning.ids &&
      warning.ids.every(isDependencyPath)
    ) {
      return;
    }

    warn(warning);
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
  ],
};
