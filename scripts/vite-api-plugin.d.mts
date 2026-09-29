import type { Plugin } from 'vite';

/** Dev-only middleware that serves the functions in /api, mirroring Vercel. */
export default function apiPlugin(options?: { root?: string }): Plugin;
