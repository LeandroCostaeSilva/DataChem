// Simple Express proxy to call Perplexity API server-side
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAgentOrchestration } from './agents/claudeOrchestrator.js'
// Node 18+ possui fetch global; sem dependência externa

const app = express();
const PORT = process.env.PORT || 5050;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
dotenv.config();
const API_KEY = process.env.PERPLEXITY_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY não definido. Configure no .env ou variável de ambiente.');
}

const DEFAULT_ALLOWED = ['https://datachem.com.br','https://www.datachem.com.br','http://localhost:5173','http://localhost:3000','http://localhost:3001'];
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.trim() !== '')
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : DEFAULT_ALLOWED;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // requests sem origin (curl) liberadas
    const allowed = ALLOWED_ORIGINS.includes(origin);
    callback(null, allowed);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.post('/api/perplexity', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY não configurada no servidor.' });
    }

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    res.status(response.status).type('application/json').send(text);
  } catch (err) {
    const hint = err.name === 'AbortError' ? 'Timeout' : 'Falha de rede';
    console.error('❌ Erro no proxy /api/perplexity:', err);
    res.status(500).json({ error: 'Erro no proxy', hint, message: err.message });
  }
});

app.post('/api/agent/search', async (req, res) => {
  try {
    const { compoundName, term } = req.body || {};
    const name = (compoundName || term || '').trim();
    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Parâmetro compoundName/term inválido' });
    }
    const result = await runAgentOrchestration(name);
    res.json({ success: true, compoundName: name, ...result });
  } catch (err) {
    console.error('❌ Erro no endpoint /api/agent/search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint dedicado para interações via Agente Orquestrador
app.post('/api/agent/interactions', async (req, res) => {
  try {
    const { compoundName, term, maxResults } = req.body || {};
    const name = (compoundName || term || '').trim();
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Parâmetro compoundName/term inválido' });
    }

    const result = await runAgentOrchestration(name);
    const interactions = result?.interactions || null;

    res.json({
      success: true,
      compoundName: name,
      interactions: interactions ? { ...interactions, via: 'perplexity', orchestrator_model: 'claude-3-7-sonnet', maxResults: maxResults || null } : null
    });
  } catch (err) {
    console.error('❌ Erro no endpoint /api/agent/interactions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🛡️ Proxy de Perplexity rodando em http://localhost:${PORT}/api/perplexity`);
  console.log(`🤖 Agente Orquestrador disponível em http://localhost:${PORT}/api/agent/search e /api/agent/interactions`);
});