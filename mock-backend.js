// Simple mock backend for frontend development
// Provides /api/health and /api/projects endpoints

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors());
app.use(bodyParser.json());

const projects = new Map();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/projects', (req, res) => {
  const body = req.body || {};
  const id = randomUUID();
  const project = {
    id,
    name: body.name || `Untitled Project ${id.slice(0, 6)}`,
    templateId: body.templateId || null,
    workspaceId: body.workspaceId || null,
    startDate: body.startDate || new Date().toISOString(),
    teamMembers: body.teamMembers || [],
    customizations: body.customizations || {},
    createdAt: new Date().toISOString(),
  };
  projects.set(id, project);
  console.log('Created project', id, 'in workspace', project.workspaceId);
  res.status(201).json({ id, ...project });
});

app.get('/api/projects/:id', (req, res) => {
  const p = projects.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.get('/api/projects', (req, res) => {
  // simple list, optionally filter by workspaceId query param
  const ws = req.query.ws || req.query.workspaceId || null;
  const all = Array.from(projects.values());
  const list = ws ? all.filter(x => String(x.workspaceId) === String(ws)) : all;
  res.json(list);
});

app.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
