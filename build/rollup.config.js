import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: isProduction ? 'dist/emoji-picker.min.js' : 'dist/emoji-picker.js',
    format: 'cjs',
    name: 'VueEmojiPicker',
  },
  plugins: [
    resolve({
      extensions: ['.js', '.vue'],
    }),
    json(),
    postcss({ extract: true }),
    vue({
      template: {},
      css: false,
    }),
    babel({
      runtimeHelpers: true,
      externalHelpers: false,
    }),
    (isProduction && terser())
  ],
};