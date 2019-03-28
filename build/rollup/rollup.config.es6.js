// Transforms ES6 output transpiled from Typescript to ES5 UMD bundle using Babel

//import babel from 'rollup-plugin-babel';
import { config, output } from './rollup.config.base';

const target = "es6";

export default {
    ...config,
    input: 'dist/es6/index.js',
    output: {
        ...output(target, "umd"),
    },
    plugins: [
        ...config.plugins,
        // babel({
        //     "presets": [
        //         [ "@babel/env", {
        //             "modules": false
        //         }]
        //     ],
        //     exclude: 'node_modules/**' // only transpile our source code
        // })
    ],
//    external: ['crypto', 'Promise'],
}
