// src/server.js
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { SodaAvatar } from './soda-avatar.js';

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, { origin: '*' });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Ruta principal para generar avatar
app.get('/avatar', async (req, reply) => {
  const { name = 'User', shape = 'circle', type = 'initials', size = 64 } = req.query;
  const svg = SodaAvatar.getSVGString(name, shape, type, Number(size));
  reply
    .code(200)
    .type('image/svg+xml')
    .send(svg);
});

// Iniciar el servidor
app.listen({ port: 3000, host: '0.0.0.0' });
