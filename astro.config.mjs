// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://biblioteca-cantaribena.es',
    integrations: [],
    output: 'static',
    build: {
        assetsPrefix: '/'
    }
});