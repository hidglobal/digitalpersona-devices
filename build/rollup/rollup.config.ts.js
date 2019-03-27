// 1. Transpiles TypeScript modules (./src) to ES5 modules (./dist/es5) using the rollup-plugin-typescript2
// 2. Bundles transpiled ES5 output (./dist/es5) to ES5 UMD and IIFE bundles (./dist/es5-bundled)

//import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { config, output } from './rollup.config.base';

const target = "es5";

const tsconfigOverride = {
    compilerOptions: {
        target,
        module: 'es6',
        declaration: false
    }
}

export default {
    ...config,
    input: 'src/index.ts',
    output: {
        ...output(target, "umd"),
    },
    plugins: [
        ...config.plugins,
        typescript({
            tsconfigOverride
        }),
        // commonjs({
        //     include: 'node_modules/**'
        // })
    ],
}
