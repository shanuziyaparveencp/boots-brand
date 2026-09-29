import fs from 'node:fs';
import path from 'node:path';

/**
 * Serves the files in /api during `npm run dev`, mirroring how Vercel runs
 * them in production. Dev-only: on Vercel the real platform handles /api and
 * this plugin never loads.
 *
 * It adapts Node's req/res to the small slice of the Vercel signature the
 * handlers actually use (req.body/req.query, res.status().json()).
 */
export default function apiPlugin({ root = process.cwd() } = {}) {
  return {
    name: 'local-api-functions',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const routePath = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');

        // Underscore-prefixed files are shared helpers, not endpoints.
        if (!routePath || routePath.startsWith('_')) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        const file = path.join(root, 'api', `${routePath}.ts`);
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        try {
          const body = await readBody(req);
          const mod = await server.ssrLoadModule(`/api/${routePath}.ts`);
          const handler = mod.default;

          if (typeof handler !== 'function') {
            throw new Error(`api/${routePath}.ts has no default export`);
          }

          const vercelReq = Object.assign(req, {
            body,
            query: Object.fromEntries(url.searchParams),
            cookies: {},
          });

          const vercelRes = Object.assign(res, {
            status(code) {
              res.statusCode = code;
              return vercelRes;
            },
            json(payload) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
              return vercelRes;
            },
            send(payload) {
              res.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
              return vercelRes;
            },
          });

          await handler(vercelReq, vercelRes);
        } catch (error) {
          server.config.logger.error(`[api] ${routePath} failed: ${error?.stack ?? error}`);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Server error. Check the dev server logs.' }));
          }
        }
      });
    },
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD') return resolve(undefined);
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on('error', () => resolve(undefined));
  });
}
