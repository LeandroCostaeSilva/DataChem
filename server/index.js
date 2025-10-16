// Simple Express proxy to call Perplexity API server-side
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Node 18+ possui fetch global; sem dependência externa

const app = express();
const PORT = process.env.PORT || 5050;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
dotenv.config();
const API_KEY = process.env.PERPLEXITY_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY não definido. Configure no .env ou variável de ambiente.');
}

app.use(cors({ origin: true }));
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

app.listen(PORT, () => {
  console.log(`🛡️ Proxy de Perplexity rodando em http://localhost:${PORT}/api/perplexity`);
});