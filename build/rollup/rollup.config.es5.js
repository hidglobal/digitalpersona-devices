// Transforms ES5 transpilation output (after TS) to ES5 bundle

//import babel from 'rollup-plugin-babel';
import { config, output } from './rollup.config.base';

export default {
    ...config,
    input: 'dist/es5/index.js',
    output: {
        ...output("es5", "umd"),
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
    ]
}
