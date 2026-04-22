// SUGGESTION Proforma App - Lightweight Express Server
// Replaces Next.js runtime for stability in K8s environment

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Prisma client
const db = new PrismaClient({ log: ['error'] });

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Auth constants
const SESSION_COOKIE = 'suggestion_session';
const SESSION_TOKEN = 'sugg_admin_token_2024';
const VALID_USERNAME = 'Administrador';
const VALID_PASSWORD = 'Sugg777';

function isValidSession(token) { return token === SESSION_TOKEN; }
function requireAuth(req, res, next) {
  const sessionCookie = req.cookies[SESSION_COOKIE];
  if (!isValidSession(sessionCookie)) return res.status(401).json({ error: 'No autorizado' });
  next();
}

// ==================== AUTH ====================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${SESSION_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Credenciales inválidas' });
});

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  return res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  const sessionCookie = req.cookies[SESSION_COOKIE];
  if (isValidSession(sessionCookie)) return res.json({ authenticated: true });
  return res.status(401).json({ authenticated: false });
});

// ==================== SERVICES ====================
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.service.findMany({
      include: { plans: { orderBy: { order: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ error: 'Error fetching services' });
  }
});

app.post('/api/services', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, icon, category, whatIncludes, methodology, plans } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Nombre y slug son requeridos' });
    const service = await db.service.create({
      data: {
        name, slug, description: description || '', icon: icon || '',
        category: category || 'principal', whatIncludes: whatIncludes || null,
        methodology: methodology || null,
        plans: plans?.length > 0 ? {
          create: plans.map((p, i) => ({
            name: p.name, price: p.price || 0, originalPrice: p.originalPrice || null,
            period: p.period || '/mes', description: p.description || '',
            features: p.features || '[]', badge: p.badge || null,
            isRecommended: p.isRecommended || false, order: p.order ?? i,
          }))
        } : undefined,
      },
      include: { plans: { orderBy: { order: 'asc' } } },
    });
    return res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ error: 'Error creating service' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await db.service.findUnique({
      where: { id: req.params.id },
      include: { plans: { orderBy: { order: 'asc' } } },
    });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    return res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ error: 'Error fetching service' });
  }
});

app.put('/api/services/:id', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, icon, category, whatIncludes, methodology, plans } = req.body;
    await db.plan.deleteMany({ where: { serviceId: req.params.id } });
    const service = await db.service.update({
      where: { id: req.params.id },
      data: {
        name, slug, description: description || '', icon: icon || '',
        category: category || 'principal', whatIncludes: whatIncludes || null,
        methodology: methodology || null,
        plans: plans?.length > 0 ? {
          create: plans.map((p, i) => ({
            name: p.name, price: p.price || 0, originalPrice: p.originalPrice || null,
            period: p.period || '/mes', description: p.description || '',
            features: p.features || '[]', badge: p.badge || null,
            isRecommended: p.isRecommended || false, order: p.order ?? i,
          }))
        } : undefined,
      },
      include: { plans: { orderBy: { order: 'asc' } } },
    });
    return res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ error: 'Error updating service' });
  }
});

app.delete('/api/services/:id', requireAuth, async (req, res) => {
  try {
    await db.plan.deleteMany({ where: { serviceId: req.params.id } });
    await db.service.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ error: 'Error deleting service' });
  }
});

// ==================== CLIENTS ====================
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.client.findMany({
      include: {
        services: {
          include: {
            service: { include: { plans: { orderBy: { order: 'asc' } } } },
            selectedPlan: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: 'Error fetching clients' });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  try {
    const { name, activity, startDate, location, phone, email, serviceIds } = req.body;
    if (!name || !activity) return res.status(400).json({ error: 'Nombre y actividad son requeridos' });
    const client = await db.client.create({
      data: {
        name, activity, startDate: startDate || '', location: location || '',
        phone: phone || '', email: email || '',
        services: serviceIds?.length > 0 ? {
          create: serviceIds.map((serviceId) => ({ serviceId }))
        } : undefined,
      },
      include: {
        services: {
          include: {
            service: { include: { plans: { orderBy: { order: 'asc' } } } },
            selectedPlan: true,
          }
        }
      },
    });
    return res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ error: 'Error creating client' });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await db.client.findUnique({
      where: { id: req.params.id },
      include: {
        services: {
          include: {
            service: { include: { plans: { orderBy: { order: 'asc' } } } },
            selectedPlan: true,
          }
        }
      },
    });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ error: 'Error fetching client' });
  }
});

app.put('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, activity, startDate, location, phone, email, serviceIds,
            status, anticipoPagado, descuento, fechaAceptacion, planSelections } = req.body;

    const existingClient = await db.client.findUnique({ where: { id } });
    if (!existingClient) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Acceptance update
    if (status === 'aceptado' && planSelections && Array.isArray(planSelections)) {
      await db.client.update({
        where: { id },
        data: {
          status: 'aceptado',
          anticipoPagado: anticipoPagado ?? false,
          descuento: descuento ?? 0,
          fechaAceptacion: fechaAceptacion || new Date().toISOString().split('T')[0],
          startDate: startDate || undefined,
        },
      });

      for (const selection of planSelections) {
        try {
          const cs = await db.clientService.findFirst({ where: { clientId: id, serviceId: selection.serviceId } });
          if (cs) {
            await db.clientService.update({ where: { id: cs.id }, data: { selectedPlanId: selection.selectedPlanId || null } });
          }
        } catch (e) { console.error(`Error updating plan for ${selection.serviceId}:`, e); }
      }

      const refreshed = await db.client.findUnique({
        where: { id },
        include: { services: { include: { service: { include: { plans: { orderBy: { order: 'asc' } } } }, selectedPlan: true } } },
      });
      return res.json(refreshed);
    }

    // Standard update
    await db.clientService.deleteMany({ where: { clientId: id } });
    const client = await db.client.update({
      where: { id },
      data: {
        name: name || existingClient.name,
        activity: activity || existingClient.activity,
        startDate: startDate !== undefined ? startDate : existingClient.startDate,
        location: location !== undefined ? location : existingClient.location,
        phone: phone !== undefined ? phone : existingClient.phone,
        email: email !== undefined ? email : existingClient.email,
        services: serviceIds?.length > 0 ? { create: serviceIds.map((sid) => ({ serviceId: sid })) } : undefined,
      },
      include: { services: { include: { service: { include: { plans: { orderBy: { order: 'asc' } } } }, selectedPlan: true } } },
    });
    return res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Error updating client', details: String(error) });
  }
});

app.delete('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    await db.clientService.deleteMany({ where: { clientId: req.params.id } });
    await db.client.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Error deleting client' });
  }
});

// ==================== PROFORMA ====================
app.get('/api/proforma/:clientId', async (req, res) => {
  try {
    const { generateProformaHtml } = require('./src/lib/proforma-template');
    const client = await db.client.findUnique({
      where: { id: req.params.clientId },
      include: { services: { include: { service: { include: { plans: { orderBy: { order: 'asc' } } } } } } },
    });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    if (!client.services.length) return res.status(400).json({ error: 'El cliente no tiene servicios asignados' });

    const cd = { name: client.name, activity: client.activity, startDate: client.startDate, location: client.location, phone: client.phone, email: client.email };
    const sd = client.services.map(cs => ({
      name: cs.service.name, slug: cs.service.slug, description: cs.service.description,
      icon: cs.service.icon, category: cs.service.category, methodology: cs.service.methodology,
      plans: cs.service.plans.map(p => ({ name: p.name, price: p.price, originalPrice: p.originalPrice, period: p.period, description: p.description, features: p.features, badge: p.badge, isRecommended: p.isRecommended, order: p.order }))
    }));

    const html = generateProformaHtml(cd, sd);
    const isDownload = req.query.download === 'true';
    if (isDownload) {
      const slug = sd.length === 1 ? sd[0].slug : 'servicios';
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent('Proforma-SUGGESTION-' + slug + '-' + cd.name.replace(/\s+/g, '-') + '.html')}"`);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    console.error('Error generating proforma:', error);
    return res.status(500).json({ error: 'Error generating proforma' });
  }
});

app.get('/api/proforma/:clientId/pdf', async (req, res) => {
  try {
    const { generateProformaHtml } = require('./src/lib/proforma-template');
    const client = await db.client.findUnique({
      where: { id: req.params.clientId },
      include: { services: { include: { service: { include: { plans: { orderBy: { order: 'asc' } } } } } } },
    });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    if (!client.services.length) return res.status(400).json({ error: 'El cliente no tiene servicios asignados' });

    const cd = { name: client.name, activity: client.activity, startDate: client.startDate, location: client.location, phone: client.phone, email: client.email };
    const sd = client.services.map(cs => ({
      name: cs.service.name, slug: cs.service.slug, description: cs.service.description,
      icon: cs.service.icon, category: cs.service.category, methodology: cs.service.methodology,
      plans: cs.service.plans.map(p => ({ name: p.name, price: p.price, originalPrice: p.originalPrice, period: p.period, description: p.description, features: p.features, badge: p.badge, isRecommended: p.isRecommended, order: p.order }))
    }));

    const html = generateProformaHtml(cd, sd);
    const printHtml = html.replace('</body>', '<script>window.onload=function(){window.print();}</script></body>');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(printHtml);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Error generating PDF' });
  }
});

// ==================== STATIC FILES (Next.js build output) ====================

// Serve Next.js static chunks
const staticDir = path.join(__dirname, '.next', 'static');
if (fs.existsSync(staticDir)) {
  app.use('/_next/static', express.static(staticDir, { immutable: true, maxAge: '365d' }));
}

// Serve public directory
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// ==================== SPA FALLBACK ====================
// Serve the pre-rendered Next.js HTML page for all non-API routes
const indexHtmlPath = path.join(__dirname, '.next', 'server', 'app', 'index.html');
let indexHtml = '';

if (fs.existsSync(indexHtmlPath)) {
  indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  console.log('Loaded pre-rendered index.html');
} else {
  console.warn('WARNING: No pre-rendered index.html found. Run "npx next build" first.');
}

app.get('{*path}', (req, res) => {
  if (indexHtml) {
    return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(indexHtml);
  }
  return res.status(404).send('Not found');
});

// ==================== START ====================
async function startServer() {
  try {
    const serviceCount = await db.service.count();
    const clientCount = await db.client.count();
    console.log(`Database connected: ${serviceCount} services, ${clientCount} clients`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`> SUGGESTION Server ready on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => { console.log('SIGTERM received'); await db.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { console.log('SIGINT received'); await db.$disconnect(); process.exit(0); });
process.on('uncaughtException', (err) => { console.error('Uncaught exception:', err.message); });
process.on('unhandledRejection', (reason) => { console.error('Unhandled rejection:', reason); });

startServer();
