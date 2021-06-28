import path from 'path'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const input = 'src/index.ts'
const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true
  }
}

const UMD_NAME = 'ReactHookWindow'
const UMD_GLOBALS = {
  react: 'React'
}

const isExternal = filePath => {
  return !filePath.startsWith('.') && !path.isAbsolute(filePath)
}

export default [
  // CommonJS
  {
    input,
    external: isExternal,
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      indent: false,
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.prod.json',
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true
          }
        }
      })
    ]
  },

  // ES
  {
    input,
    external: isExternal,
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      indent: false,
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.prod.json' })
    ]
  },

  // ES for Browsers
  {
    input,
    external: isExternal,
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      indent: false,
      entryFileNames: '[name].mjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.prod.json' }),
      terser({ module: true, ...terserOptions })
    ]
  },

  // UMD Development
  {
    input,
    external: Object.keys(UMD_GLOBALS),
    output: {
      file: 'dist/index-dev.umd.js',
      format: 'umd',
      indent: false,
      name: UMD_NAME,
      globals: UMD_GLOBALS
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.prod.json' }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input,
    external: Object.keys(UMD_GLOBALS),
    output: {
      file: 'dist/index-prod.umd.js',
      format: 'umd',
      indent: false,
      name: UMD_NAME,
      globals: UMD_GLOBALS
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.prod.json' }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser(terserOptions)
    ]
  }
]
