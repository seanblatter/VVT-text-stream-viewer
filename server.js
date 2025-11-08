import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
};

const publicFiles = new Set(['/', '/index.html', '/app.js']);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

    if (!publicFiles.has(pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not Found');
      return;
    }

    const filePath = join(process.cwd(), pathname.slice(1));
    const body = await readFile(filePath);
    const contentType = mimeTypes[extname(filePath)] ?? 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Internal Server Error');
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
