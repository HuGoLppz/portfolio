// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.jsx',
    },
    assetsInclude: /\.glb$/,
  },
  html: {
    template: './src/index.html',
    title: 'Hugo López Sanz · Desarrollador web',
    favicon: './public/favicon.png',
  },
});
