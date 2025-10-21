const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const DEFAULT_AGENT_URL = (import.meta.env.DEV || isLocalHost) ? 'http://localhost:5050/api/agent/search' : '/api/agent/search';

/**
 * Executa a orquestração via Claude Agent SDK no backend
 * @param {string} compoundName - Nome do composto selecionado
 * @returns {Promise<Object>} - Resultado consolidado com compound, adverseEvents, interactions
 */
export const runAgentSearch = async (compoundName) => {
  if (!compoundName || typeof compoundName !== 'string') {
    throw new Error('Nome de composto inválido');
  }
  const url = import.meta.env.VITE_AGENT_URL || DEFAULT_AGENT_URL;
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