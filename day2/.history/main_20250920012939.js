import http from 'http';
import * as repo from './usersRepo.js';

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return send(res, 204);

  try {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET' && url.pathname === '/users') {
      return send(res, 200, await repo.getAll());
    }

    if (req.method === 'GET' && parts[0] === 'users' && parts[1]) {
      const user = await repo.getOne(Number(parts[1]));
      return user ? send(res, 200, user) : send(res, 404, { error: 'not found' });
    }

    if (req.method === 'POST' && url.pathname === '/users') {
      const { name } = await readJson(req);
      if (!name) return send(res, 400, { error: 'name required' });
      const user = await repo.create(name);
      return send(res, 201, user);
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && parts[0] === 'users' && parts[1]) {
      const { name } = await readJson(req);
      if (!name) return send(res, 400, { error: 'name required' });
      const user = await repo.update(Number(parts[1]), name);
      return user ? send(res, 200, user) : send(res, 404, { error: 'not found' });
    }

    if (req.method === 'DELETE' && parts[0] === 'users' && parts[1]) {
      const ok = await repo.removeOne(Number(parts[1]));
      return ok ? send(res, 204) : send(res, 404, { error: 'not found' });
    }

    return send(res, 404, { error: 'route not found' });
  } catch (err) {
    return send(res, 500, { error: err.message || 'server error' });
  }
});

server.listen(3000, () => console.log('Server → http://localhost:3000'));
