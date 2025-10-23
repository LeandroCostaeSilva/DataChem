const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

// Resolve URL do agente considerando ambiente e disponibilidade de backend
const RESOLVED_AGENT_URL = (() => {
  const envUrl = import.meta.env.VITE_AGENT_URL && String(import.meta.env.VITE_AGENT_URL).trim();
  if (envUrl) return envUrl;
  if (import.meta.env.DEV || isLocalHost) return 'http://localhost:5050/api/agent/search';
  return null; // Produção sem backend disponível
})();

/**
 * Executa a orquestração via Claude Agent SDK no backend
 * @param {string} compoundName - Nome do composto selecionado
 * @returns {Promise<Object>} - Resultado consolidado com compound, adverseEvents, interactions
 */
export const runAgentSearch = async (compoundName) => {
  if (!compoundName || typeof compoundName !== 'string') {
    throw new Error('Nome de composto inválido');
  }

  const url = RESOLVED_AGENT_URL;
  // Em produção (Pages) sem backend remoto configurado, não faz fetch e retorna fallback
  if (!url) {
    if (typeof console !== 'undefined') {
      console.warn('⚠️ Agente indisponível em produção: defina VITE_AGENT_URL apontando para um backend público.');
    }
    return {
      content: '',
      citations: [],
      search_results: [],
      model: 'fallback',
      timestamp: new Date().toISOString(),
      compound_name: compoundName,
      note: 'Agente de interações indisponível no ambiente de produção (sem backend).'
    };
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compoundName })
  });
  const data = await resp.json().catch(() => ({ success: false, error: 'Resposta inválida do servidor' }));
  if (!resp.ok || data.success === false) {
    throw new Error(data.error || `Falha no agente (HTTP ${resp.status})`);
  }
  return data;
};

export const fetchInteractionsViaAgent = async (compoundName, options = {}) => {
  if (!compoundName || typeof compoundName !== 'string') {
    throw new Error('Nome de composto inválido');
  }

  let url = import.meta.env.VITE_AGENT_INTERACTIONS_URL && String(import.meta.env.VITE_AGENT_INTERACTIONS_URL).trim();
  if (!url) {
    if (import.meta.env.DEV || isLocalHost) {
      url = 'http://localhost:5050/api/agent/interactions';
    } else if (RESOLVED_AGENT_URL) {
      url = RESOLVED_AGENT_URL.replace('/search', '/interactions');
    }
  }

  if (!url) {
    if (typeof console !== 'undefined') {
      console.warn('⚠️ Agente de interações indisponível em produção: defina VITE_AGENT_INTERACTIONS_URL.');
    }
    return {
      content: '',
      citations: [],
      search_results: [],
      model: 'fallback',
      timestamp: new Date().toISOString(),
      compound_name: compoundName,
      note: 'Agente de interações indisponível no ambiente de produção (sem backend).'
    };
  }

  const payloadOptions = {
    maxResults: typeof options.maxResults === 'number' ? options.maxResults : 800,
    ...options,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compoundName, ...payloadOptions })
  });
  const data = await resp.json().catch(() => ({ success: false, error: 'Resposta inválida do servidor' }));
  if (!resp.ok || data.success === false) {
    throw new Error(data.error || `Falha no agente (HTTP ${resp.status})`);
  }
  return data.interactions ? data.interactions : data;
};