import node from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export const { minify } = process.env

export const output = (target, format) => ({
    format,
    extend: true,
    name: 'dp.deviceAcceess',
    file: `dist/${target}.bundles/device-access.${format}${minify ? '.min' : ''}.js`,
    globals: {
      '@digitalpersona/access-management': 'dp.accessManagement',
      'WebSdk': 'WebSdk'
    },
    sourcemap: minify ? false : true
})

export const config = {
    plugins: [
        node(),
    ]
    .concat(minify ? terser() : []),
    external: ['@digitalpersona/access-management', 'WebSdk'],
}
