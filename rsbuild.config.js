// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    assetsInclude: /\.glb$/,
  },
  html: {
    title: 'Hugo López Sanz · Desarrollador web',
    favicon: './public/favicon.png',
  },
});
