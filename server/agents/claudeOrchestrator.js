import { tool, createSdkMcpServer, query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import dotenv from 'dotenv';
import { getCompoundData } from '../../src/services/pubchemService.js';
import { getAdverseReactions } from '../../src/services/fdaService.js';

dotenv.config();

const LOGGER_PREFIX = '[Datachem-AgentSDK]';
const log = (...args) => console.log(LOGGER_PREFIX, ...args);
const warn = (...args) => console.warn(LOGGER_PREFIX, ...args);
const err = (...args) => console.error(LOGGER_PREFIX, ...args);

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PPLX_API_KEY = process.env.PERPLEXITY_API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
log('Env status', { anthropicKey: ANTHROPIC_KEY ? 'present' : 'missing', perplexityKey: PPLX_API_KEY ? 'present' : 'missing' });

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
  log('generateDrugInteractionsServer:start', { compoundName, options });
  if (!PPLX_API_KEY) {
    warn('PERPLEXITY_API_KEY não configurada; usando conteúdo básico.');
    return generateBasicInteractions(compoundName);
  }

  const searchConfig = {
    model: 'sonar-pro',
    max_tokens: 1400,
    temperature: 0.2,
    top_p: 0.95,
  };

  const systemPrompt = `Você é um farmacologista clínico especialista em interações medicamentosas. Responda SEMPRE em português brasileiro.\n\nRegras para a TABELA:\n- Crie primeiro uma tabela Markdown com as colunas: | Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |\n- Use Severidade como: Leve/Moderada/Grave\n- Mecanismo: Farmacocinética/Farmacodinâmica e vias (CYP3A4, P-gp, etc.)\n- Efeitos clínicos objetivos\n- Recomendações práticas (evitar, monitorar, ajustar dose)`;

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
    return_related_questions: true,
    return_search_results: true,
    return_citations: true,
    language: 'pt',
    country: 'BR'
  };

  const resp = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PPLX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  log('Perplexity response status', resp.status);

  const rawText = await resp.text();
  let json;
  try {
    json = JSON.parse(rawText);
  } catch (e) {
    err('JSON inválido da Perplexity', rawText.slice(0, 300));
    throw new Error(`Resposta inválida da Perplexity (status ${resp.status})`);
  }

  if (!resp.ok) {
    const errMsg = json?.error?.message || json?.error || rawText;
    err('Erro Perplexity', { status: resp.status, message: errMsg });
    throw new Error(`Erro Perplexity ${resp.status}: ${errMsg}`);
  }

  const message = json?.choices?.[0]?.message || {};
  // Extrair texto dos blocos de conteúdo (array) conforme Quickstart
  let contentText = '';
  const msgContent = message?.content;
  if (Array.isArray(msgContent)) {
    contentText = msgContent
      .map(block => typeof block === 'string' ? block : (block?.text || ''))
      .filter(Boolean)
      .join('\n')
      .trim();
  } else if (typeof msgContent === 'string') {
    contentText = msgContent;
  } else if (Array.isArray(json?.content)) {
    contentText = json.content.map(c => c?.text || '').join('\n').trim();
  } else if (typeof json?.content === 'string') {
    contentText = json.content;
  }

  const citations = json?.citations || message?.citations || [];
  const search_results = json?.search_results || message?.search_results || [];

  if (!contentText || String(contentText).trim().length === 0) {
    warn('Conteúdo vazio retornado pela Perplexity (message.content). Aplicando fallback.');
    return generateBasicInteractions(compoundName);
  }

  const normalizedContent = normalizeSeverityColumn(contentText);
  const previewSnippet = String(normalizedContent).slice(0, 300);
  log('Interações (snippet)', previewSnippet);

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

export async function generateInteractionsViaClaude(compoundName, compound, adverseEvents) {
  log('Claude interactions fallback:start', { compoundName, hasCompound: !!compound, adverseCount: Array.isArray(adverseEvents) ? adverseEvents.length : (adverseEvents?.results?.length ?? 0) });
  const contextPubchem = compound ? JSON.stringify({ cid: compound.cid, name: compound.name, iupacName: compound.iupacName, casNumber: compound.casNumber, synonyms: (compound.synonyms||[]).slice(0,10) }) : '{}';
  const contextFda = adverseEvents ? JSON.stringify({ count: Array.isArray(adverseEvents) ? adverseEvents.length : (adverseEvents?.results?.length ?? 0) }) : '{}';
  const prompt = `Você é um farmacologista clínico especialista em interações medicamentosas. Responda SEMPRE em português brasileiro.\n\nObjetivo: gerar uma TABELA Markdown de interações medicamentosas para "${compoundName}" com as colunas: | Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |.\n\nRegras:\n- "Severidade": usar somente Leve, Moderada ou Grave.\n- "Mecanismo": indicar se é Farmacocinética/Farmacodinâmica e citar vias (ex.: CYP3A4, P-gp).\n- "Efeitos Clínicos": objetivo e claro.\n- "Recomendações": ação prática (evitar, monitorar, ajustar dose).\n- Gerar 6–12 linhas, focando interações clinicamente relevantes no Brasil.\n\nContexto PubChem (resumo): ${contextPubchem}\nContexto openFDA (resumo): ${contextFda}\n\nRetorne APENAS JSON com o formato: { content, model, timestamp, compound_name }. O campo "content" deve conter SOMENTE a tabela Markdown sem texto adicional.`;
  try {
    const result = await query({ prompt, options: { model: 'claude-3-7-sonnet' } });
    const text = result?.output_text || result?.final_response_text || result?.text || result?.response_text || '';
    let content = '';
    try {
      const parsed = JSON.parse(text);
      content = parsed?.content || '';
    } catch {
      content = text; // se não vier JSON, considerar corpo diretamente
    }
    const normalizedContent = normalizeSeverityColumn(content);
    const interactions = {
      content: normalizedContent,
      citations: [],
      search_results: [],
      related_questions: [],
      usage: {},
      model: 'claude-3-7-sonnet',
      timestamp: new Date().toISOString(),
      compound_name: compoundName
    };
    log('Claude interactions fallback:success', { contentLen: interactions.content.length });
    return interactions;
  } catch (e) {
    err('Claude interactions fallback:error', e?.message);
    return generateBasicInteractions(compoundName);
  }
}

// MCP Tools
const pubchemTool = tool(
  'pubchem_compound_data',
  'Busca dados completos do composto no PubChem e openFDA',
  z.object({ name: z.string() }),
  async ({ name }) => {
    log('Tool pubchem_compound_data invoked', { name });
    try {
      const compound = await getCompoundData(name);
      log('Tool pubchem_compound_data success', { cid: compound?.cid, name: compound?.name });
      return { content: JSON.stringify(compound) };
    } catch (e) {
      err('Tool pubchem_compound_data error', e?.message);
      throw e;
    }
  }
);

const fdaTool = tool(
  'openfda_adverse_events',
  'Busca reações adversas do openFDA para um medicamento',
  z.object({ drugName: z.string(), maxResults: z.number().optional() }),
  async ({ drugName, maxResults }) => {
    log('Tool openfda_adverse_events invoked', { drugName, maxResults });
    try {
      const events = await getAdverseReactions(drugName, maxResults || 500);
      const total = Array.isArray(events) ? events.length : (events?.results?.length ?? 'unknown');
      log('Tool openfda_adverse_events success', { total });
      return { content: JSON.stringify(events) };
    } catch (e) {
      err('Tool openfda_adverse_events error', e?.message);
      throw e;
    }
  }
);

const interactionsTool = tool(
  'perplexity_interactions',
  'Gera tabela de interações medicamentosas via Perplexity',
  z.object({ compoundName: z.string(), maxResults: z.number().optional() }),
  async ({ compoundName, maxResults }) => {
    log('Tool perplexity_interactions invoked', { compoundName, maxResults });
    try {
      const result = await generateDrugInteractionsServer(compoundName, { maxResults });
      log('Tool perplexity_interactions success', { model: result?.model, contentLen: result?.content?.length });
      return { content: JSON.stringify(result) };
    } catch (e) {
      err('Tool perplexity_interactions error', e?.message);
      throw e;
    }
  }
);

// Habilita ferramentas condicionalmente conforme PERPLEXITY_API_KEY
const enabledTools = PPLX_API_KEY ? [pubchemTool, fdaTool, interactionsTool] : [pubchemTool, fdaTool];
log('MCP tools enabled', { tools: PPLX_API_KEY ? ['pubchem_compound_data','openfda_adverse_events','perplexity_interactions'] : ['pubchem_compound_data','openfda_adverse_events'] });

const mcpServer = createSdkMcpServer({
  name: 'datachem-mcp',
  tools: enabledTools
});

export async function runAgentOrchestration(compoundName) {
  try {
    const name = (compoundName || '').trim();
    const allowedTools = PPLX_API_KEY ? ['pubchem_compound_data','openfda_adverse_events','perplexity_interactions'] : ['pubchem_compound_data','openfda_adverse_events'];
    const toolsText = allowedTools.join(', ');
    const prompt = `Para o composto "${name}", use as ferramentas disponíveis (${toolsText}) para obter e consolidar dados do PubChem (pubchem_compound_data) e do OpenFDA (openfda_adverse_events), e gere a tabela de interações EXCLUSIVAMENTE via a ferramenta 'perplexity_interactions'. Não gere interações com base em conhecimento próprio. Retorne APENAS JSON no formato { compound, adverseEvents, interactions } onde interactions.content é uma tabela Markdown em pt-BR com as colunas solicitadas.`;

    log('Agent query:start', { name, allowedTools });

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
    log('Agent query:completed', { hasText: !!text });
    if (text) {
      try {
        const parsed = JSON.parse(text);
        log('Agent query:parsedJSON', { keys: Object.keys(parsed || {}) });
        if (parsed && (parsed.interactions || parsed.compound || parsed.adverseEvents)) {
          // Garantir que interactions exista
          if (!parsed.interactions && PPLX_API_KEY) {
            // Não usar Claude para gerar interações; recorrer ao Perplexity
            parsed.interactions = await generateDrugInteractionsServer(name);
          }
          return parsed;
        }
      } catch {/* não-JSON; cair no fallback */
        warn('Agent query:non-JSON response, falling back');
      }
    }
  } catch (err) {
    err('Falha na orquestração via Agent SDK', err?.message);
  }

  // Fallback direto
  log('Agent fallback:start', { compoundName });
  const compound = await getCompoundData(compoundName);
  const adverseEvents = await getAdverseReactions(compoundName, 500);
  let interactions;
  try {
    if (PPLX_API_KEY) {
      try {
        interactions = await generateDrugInteractionsServer(compoundName);
      } catch (e) {
        warn('Falha Perplexity; usando conteúdo básico.', e?.message);
        interactions = generateBasicInteractions(compoundName);
      }
    } else {
      warn('PERPLEXITY_API_KEY ausente; usando conteúdo básico.');
      interactions = generateBasicInteractions(compoundName);
    }
  } catch (e) {
    warn('Erro no fallback de interações; mantendo básico.', e?.message);
    interactions = generateBasicInteractions(compoundName);
  }
  const finalResult = { compound, adverseEvents, interactions };
  log('Agent fallback:complete', { compoundCid: compound?.cid, interactionsModel: interactions?.model });
  return finalResult;
}

// Utilitário de teste para validação de normalização de severidade
export function _testNormalizeSeverityColumn(markdown) {
  return normalizeSeverityColumn(markdown);
}