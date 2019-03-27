import node from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export const { minify } = process.env

export const output = (target, format) => ({
    format,
    extend: true,
    name: 'dp.accessManagement',
    file: `dist/${target}.bundles/access-management.${format}${minify ? '.min' : ''}.js`,
    globals: {
      'crypto': 'crypto'
    },
    sourcemap: minify ? false : true
})

export const config = {
    plugins: [
        node(),
    ]
    .concat(minify ? terser() : []),
//    external: ['crypto'],
//   onwarn: (warning) => {
//     const ignoreWarnings = ['CIRCULAR_DEPENDENCY', 'CIRCULAR', 'THIS_IS_UNDEFINED']
//     if (ignoreWarnings.some(w => w === warning.code))
//       return
//     if (warning.missing === 'alea')
//       return

//     console.warn(warning.message)
//   }
}
