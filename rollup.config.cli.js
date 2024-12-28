#!/usr/bin/env node
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'; // Add json plugin
import { defineConfig } from 'rollup';
import fs from 'fs';
import path from 'path';

// Dynamic package.json loading
const getPackageJson = () => {
  try {
    const packagePath = path.resolve(process.cwd(), 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (error) {
    console.error('Failed to load package.json:', error);
    return { version: '0.0.0', name: 'axiosflow' };
  }
};

export default defineConfig({
  input: 'src/cli/index.ts', 
  output: [
    {
      dir: 'dist',
       banner: '#!/usr/bin/env node',
      format: 'esm',
      sourcemap: true,
      entryFileNames: 'cli.js',
      chunkFileNames: 'cli-[hash].js'
    }
  ],
  plugins: [
    json({
      preferConst: true,
      compact: false,
      namedExports: true
    }), // Add json plugin here
    resolve({
      extensions: ['.ts', '.js', '.json'],
      preferBuiltins:true
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