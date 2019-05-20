// This configuration expects environment parameters passed to the rollup:
// (e.g. "rollup -c rollup.config.js --environment target:es5,format:umd,minify",
const {
    minify,     // true: minify the bundle, false|undefined: do not minify the bundle (default)
    target,     // target syntax (es5, es6, ...). Default: es5
    format,      // bundle format (umd, cjs, ...). Default: umd
    npm_package_globalObject,
} = {
    target: "es5",
    format: "umd",
    ...process.env
}

import node from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
    input: `dist/${target}/index.js`,
    external: ['@digitalpersona/core', '@digitalpersona/services', 'WebSdk'],
    output: {
        format,
        extend: true,
        name: npm_package_globalObject,
        globals: {
            '@digitalpersona/core': 'dp.core',
            '@digitalpersona/services': 'dp.services',
            'WebSdk': 'WebSdk',
          },
        file: `dist/${target}.bundles/index.${format}${minify ? '.min' : ''}.js`,
        sourcemap: true
    },
    plugins: [
        node(),
        (minify ? terser() : [])
    ]
}
