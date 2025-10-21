import { tool, createSdkMcpServer, query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import dotenv from 'dotenv';
import { getCompoundData } from '../../src/services/pubchemService.js';
import { getAdverseReactions } from '../../src/services/fdaService.js';

dotenv.config();

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PPLX_API_KEY = process.env.PERPLEXITY_API_KEY || '';

function mapSeverityToPt(value) {
  const v = String(value || '').toLowerCase();
  if (/^severe/.test(v)) return 'Grave';
  if (/^moderate/.test(v)) return 'Moderada';
  if (/^(mild|light)/.test(v)) return 'Leve';
  if (/^grave/.test(v)) return 'Grave';
  if (/^moderada/.test(v)) return 'Moderada';
  if (/^leve/.test(v)) return 'Leve';
  return value;
}

function normalizeSeverityColumn(markdown) {
  try {
    const lines = String(markdown || '').split('\n');
    const headerIdx = lines.findIndex(l => l.includes('|') && l.toLowerCase().includes('severidade'));
    if (headerIdx < 0) return markdown;
    const headerCells = lines[headerIdx].split('|').map(s => s.trim());
    const severityIdx = headerCells.findIndex(c => c.toLowerCase().includes('severidade'));
    if (severityIdx < 0) return markdown;

    const newLines = lines.map((line, idx) => {
      if (idx <= headerIdx) return line;
      if (!line.includes('|')) return line;
      const cells = line.split('|');
      if (cells.length <= severityIdx) return line;
      let cell = cells[severityIdx].trim();
      // Map English terms to PT
      cell = cell
        .replace(/\bSevere\b/gi, 'Grave')
        .replace(/\bModerate\b/gi, 'Moderada')
        .replace(/\bMild\b/gi, 'Leve')
        .replace(/\bLight\b/gi, 'Leve');
      // Remove details in parentheses after severity value
      cell = cell.replace(/^(Leve|Moderada|Grave)\s*\([^)]*\)/, '$1');
      // Fallback mapping at start if needed
      const mapped = mapSeverityToPt(cell);
      cells[severityIdx] = ` ${mapped} `;
      return cells.join('|');
    });
    return newLines.join('\n');
  } catch {
    return markdown;
  }
}

function generateBasicInteractions(compoundName) {
  const content = `# Interações Medicamentosas - ${compoundName}\n\n` +
    `| Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |\n` +
    `|-------------|------------|------------------------|------------------|---------------|\n` +
    `| — | — | — | — | — |\n\n` +
    `*⚠️ Sem dados retornados pela API da Perplexity no momento. Tente novamente mais tarde ou verifique a configuração da chave de API.*`;
  return {
    content,
    citations: [],
    search_results: [],
    related_questions: [],
    usage: {},
    model: 'fallback',
    timestamp: new Date().toISOString(),
    compound_name: compoundName
  };
}

async function generateDrugInteractionsServer(compoundName, options = {}) {
  if (!PPLX_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY não configurada no servidor');
  }

  const searchConfig = {
    model: 'sonar-pro',
    max_tokens: 1400,
    temperature: 0.2,
    top_p: 0.95,
  };

  const systemPrompt = `Você é um farmacologista clínico especialista em interações medicamentosas. Responda SEMPRE em português brasileiro.\n\nRegras para a TABELA:\n- Crie primeiro uma tabela Markdown com as colunas: | Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |\n- "Severidade": usar somente Leve, Moderada ou Grave. Não inclua detalhes entre parênteses.\n- "Mecanismo": indique se é Farmacocinética/Farmacodinâmica e cite vias (ex.: CYP3A4, P-gp).\n- "Efeitos Clínicos": descreva objetivamente o efeito esperado.\n- "Recomendações": ação prática (evitar, monitorar marcador, ajustar dose).\n\nApós a tabela:\n- Inclua seção "Referências bibliográficas (máx. 10)" com fontes confiáveis no formato [n] Título — URL.`;

  const userQuery = `Gerar a tabela de interações medicamentosas abrangente para ${compoundName} seguindo as regras.`;

  const body = {
    model: searchConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ],
    max_tokens: searchConfig.max_tokens,
    temperature: searchConfig.temperature,
    top_p: searchConfig.top_p,
    stream: false,
  };

  const resp = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PPLX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const rawText = await resp.text();
  let json;
  try {
    json = JSON.parse(rawText);
  } catch (e) {
    console.error('❌ JSON inválido da Perplexity:', rawText.slice(0, 300));
    throw new Error(`Resposta inválida da Perplexity (status ${resp.status})`);
  }

  if (!resp.ok) {
    const errMsg = json?.error?.message || json?.error || rawText;
    throw new Error(`Erro Perplexity ${resp.status}: ${errMsg}`);
  }

  const message = json?.choices?.[0]?.message || {};
  const content = message?.content || json?.content || '';
  const citations = json?.citations || message?.citations || [];
  const search_results = json?.search_results || message?.search_results || [];

  if (!content || String(content).trim().length === 0) {
    console.warn('⚠️ Conteúdo vazio retornado pela Perplexity. Aplicando fallback.');
    return generateBasicInteractions(compoundName);
  }

  const normalizedContent = normalizeSeverityColumn(content);
  const previewSnippet = String(normalizedContent).slice(0, 300);
  console.log('🧪 Interactions content (snippet):', previewSnippet);

  return {
    content: normalizedContent,
    citations,
    search_results,
    related_questions: json?.related_questions || [],
    usage: json?.usage || {},
    model: json?.model || searchConfig.model,
    timestamp: new Date().toISOString(),
    compound_name: compoundName
  };
}

// MCP Tools
const pubchemTool = tool(
  'pubchem_compound_data',
  'Busca dados completos do composto no PubChem e openFDA',
  z.object({ name: z.string() }),
  async ({ name }) => {
    const compound = await getCompoundData(name);
    return { content: JSON.stringify(compound) };
  }
);

const fdaTool = tool(
  'openfda_adverse_events',
  'Busca reações adversas do openFDA para um medicamento',
  z.object({ drugName: z.string(), maxResults: z.number().optional() }),
  async ({ drugName, maxResults }) => {
    const events = await getAdverseReactions(drugName, maxResults || 500);
    return { content: JSON.stringify(events) };
  }
);

const interactionsTool = tool(
  'perplexity_interactions',
  'Gera tabela de interações medicamentosas via Perplexity',
  z.object({ compoundName: z.string(), maxResults: z.number().optional() }),
  async ({ compoundName, maxResults }) => {
    const result = await generateDrugInteractionsServer(compoundName, { maxResults });
    return { content: JSON.stringify(result) };
  }
);

const mcpServer = createSdkMcpServer({
  name: 'datachem-mcp',
  tools: [pubchemTool, fdaTool, interactionsTool]
});

export async function runAgentOrchestration(compoundName) {
  try {
    const name = (compoundName || '').trim();
    const allowedTools = ['pubchem_compound_data','openfda_adverse_events','perplexity_interactions'];
    const prompt = `Para o composto "${name}", use as ferramentas disponíveis (pubchem_compound_data, openfda_adverse_events, perplexity_interactions) para obter e consolidar dados do PubChem, OpenFDA e Perplexity, retornando APENAS JSON no formato { compound, adverseEvents, interactions }.`;

    const result = await query({
      prompt,
      options: {
        model: 'claude-3-7-sonnet',
        mcpServers: { datachem: mcpServer },
        allowedTools,
        toolChoice: 'auto',
        strictMcpConfig: true
      }
    });

    const text = result?.output_text || result?.final_response_text || result?.text || result?.response_text || '';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && (parsed.interactions || parsed.compound || parsed.adverseEvents)) {
          return parsed;
        }
      } catch {/* não-JSON; cair no fallback */}
    }
  } catch (err) {
    console.warn('⚠️ Falha na orquestração via Agent SDK, usando fallback direto:', err?.message);
  }

  // Fallback direto
  const compound = await getCompoundData(compoundName);
  const adverseEvents = await getAdverseReactions(compoundName, 500);
  let interactions;
  try {
    interactions = await generateDrugInteractionsServer(compoundName);
  } catch (e) {
    console.warn('⚠️ Falha ao gerar interações via Perplexity. Usando fallback básico.', e?.message);
    interactions = generateBasicInteractions(compoundName);
  }
  return { compound, adverseEvents, interactions };
}

// Utilitário de teste para validação de normalização de severidade
export function _testNormalizeSeverityColumn(markdown) {
  return normalizeSeverityColumn(markdown);
}