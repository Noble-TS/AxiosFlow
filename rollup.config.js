import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'; // Add json plugin
import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';


export default defineConfig({
  input: 'src/index.ts', 
  output: [
    {
      dir: 'dist',
      banner: '#!/usr/bin/env node',
      format: 'cjs',  // CommonJS
      sourcemap: true,
      entryFileNames: 'index.cjs', // Output file name
      chunkFileNames: '[name]-[hash].js'
    },
    {
      dir: 'dist',
      format: 'es',  // ES Module output
      sourcemap: true,
      entryFileNames: 'index.js', // Output file name for ES Module
      chunkFileNames: '[name]-[hash].js'
    },
  ],
  plugins: [
    json({
      preferConst: true,
      compact: false,
      namedExports: true
    }), 
    resolve({
      extensions: ['.ts', '.js', '.json'],
      preferBuiltins: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'esnext',
        moduleResolution: 'node'
      }
    }),
     // Minification
     terser({
      compress: {
        drop_console: true,
        dead_code: true
      },
      format: {
        comments: false
      }
    })
  ],
  
  external: [
    'commander',
    'axios',
    'fs',
    'path',
    'dotenv'
  ]
});