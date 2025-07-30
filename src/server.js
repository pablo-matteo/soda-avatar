// src/server.js
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { SodaAvatar } from './soda-avatar.js';

const app = Fastify({ logger: true });

// 🔁 Cache en memoria (muy simple)
const avatarCache = new Map();

// Plugins
await app.register(cors, { origin: '*' });
await app.register(rateLimit, {
  max: 2000, // más alto para entornos de prueba o backend interno
  timeWindow: '1 minute',
  keyGenerator: (req) => req.headers['x-real-ip'] || req.ip,
});

// Ruta principal para generar avatar
app.get('/avatar', async (req, reply) => {
  const { name = 'User', shape = 'circle', type = 'initials', size = 64 } = req.query;

  const key = `${name}_${shape}_${type}_${size}`;
  if (avatarCache.has(key)) {
    // 🎯 Respuesta rápida desde cache
    return reply
      .code(200)
      .type('image/svg+xml')
      .send(avatarCache.get(key));
  }

  // 🧠 Generación de nuevo SVG
  const svg = SodaAvatar.getSVGString(name, shape, type, Number(size));
  avatarCache.set(key, svg);

  reply
    .code(200)
    .type('image/svg+xml')
    .send(svg);
});

// Iniciar el servidor
app.listen({ port: 3000, host: '0.0.0.0' });
