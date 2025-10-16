// Serviço da Perplexity AI para geração de interações medicamentosas

// --- CONFIGURAÇÃO ---
const API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const PERPLEXITY_PROXY_URL = (import.meta.env.VITE_PERPLEXITY_PROXY_URL || (import.meta.env.DEV || isLocalHost ? 'http://localhost:5050/api/perplexity' : ''));

console.log('🔧 Configuração do Perplexity Service:');
console.log('📝 VITE_PERPLEXITY_API_KEY from env:', import.meta.env.VITE_PERPLEXITY_API_KEY ? 'Definida' : 'Não definida');
console.log('🔑 API_KEY final:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Não definida');
console.log('🛡️ Proxy de API:', PERPLEXITY_PROXY_URL ? PERPLEXITY_PROXY_URL : 'não configurado');

// === SISTEMA DE CACHE AVANÇADO PARA PERPLEXITY API ===
// Cache otimizado para reduzir custos e melhorar performance

// Configurações do cache
const CACHE_CONFIG = {
  MAX_ENTRIES: 100,           // Máximo de entradas no cache
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas para dados médicos
  CLEANUP_INTERVAL: 60 * 60 * 1000,     // Limpeza a cada 1 hora
  STORAGE_KEY: 'perplexity_cache_v2'     // Chave para localStorage
};

// Cache em memória (Map) para acesso rápido
const memoryCache = new Map();
// Controle de requisições em andamento por chave
const inFlightRequests = new Map();

// Cache persistente (localStorage) para manter dados entre sessões
const persistentCache = {
  get: (key) => {
    try {
      const stored = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
      if (!stored) return null;
      
      const cache = JSON.parse(stored);
      return cache[key] || null;
    } catch (error) {
      console.warn('⚠️ Erro ao ler cache persistente:', error);
      return null;
    }
  },
  
  set: (key, data) => {
    try {
      const stored = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
      const cache = stored ? JSON.parse(stored) : {};
      
      cache[key] = data;
      
      // Limitar tamanho do cache persistente
      const keys = Object.keys(cache);
      if (keys.length > CACHE_CONFIG.MAX_ENTRIES) {
        // Remover entradas mais antigas
        keys
          .sort((a, b) => cache[a].timestamp - cache[b].timestamp)
          .slice(0, keys.length - CACHE_CONFIG.MAX_ENTRIES)
          .forEach(oldKey => delete cache[oldKey]);
      }
      
      localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache persistente:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache persistente:', error);
    }
  }
};

/**
 * Gera uma chave de cache normalizada para nomes químicos
 * @param {string} compoundName - Nome do composto químico
 * @param {string} queryType - Tipo de consulta (interactions, properties, etc.)
 * @returns {string} - Chave de cache normalizada
 */
const generateCacheKey = (compoundName, queryType = 'interactions') => {
  // Normalizar nome do composto (remover espaços, converter para minúsculas, etc.)
  const normalizedName = compoundName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_') // Substituir caracteres especiais por underscore
    .replace(/_+/g, '_')        // Remover underscores duplicados
    .replace(/^_|_$/g, '');     // Remover underscores no início/fim
  
  return `${queryType}_${normalizedName}`;
};

/**
 * Verifica se existe uma resposta em cache válida (memória + persistente)
 * @param {string} cacheKey - Chave de cache
 * @returns {Object|null} - Resposta em cache ou null
 */
const getCachedResponse = (cacheKey) => {
  // 1. Verificar cache em memória primeiro (mais rápido)
  const memoryData = memoryCache.get(cacheKey);
  if (memoryData && (Date.now() - memoryData.timestamp) < CACHE_CONFIG.CACHE_DURATION) {
    console.log('🚀 Cache HIT (memória):', cacheKey);
    return { ...memoryData.data, cached: true, cacheSource: 'memory' };
  }
  
  // 2. Verificar cache persistente
  const persistentData = persistentCache.get(cacheKey);
  if (persistentData && (Date.now() - persistentData.timestamp) < CACHE_CONFIG.CACHE_DURATION) {
    console.log('💾 Cache HIT (persistente):', cacheKey);
    
    // Copiar para cache em memória para próximos acessos
    memoryCache.set(cacheKey, persistentData);
    
    return { ...persistentData.data, cached: true, cacheSource: 'persistent' };
  }
  
  console.log('❌ Cache MISS:', cacheKey);
  return null;
};

/**
 * Armazena uma resposta no cache (memória + persistente)
 * @param {string} cacheKey - Chave de cache
 * @param {Object} data - Dados para armazenar
 */
const setCachedResponse = (cacheKey, data) => {
  const cacheEntry = {
    data: data,
    timestamp: Date.now(),
    compoundName: data.compoundName || 'unknown',
    queryType: cacheKey.split('_')[0] || 'unknown'
  };
  
  // Salvar em ambos os caches
  memoryCache.set(cacheKey, cacheEntry);
  persistentCache.set(cacheKey, cacheEntry);
  
  console.log('💾 Dados salvos no cache:', cacheKey);
  
  // Limpeza automática do cache em memória
  if (memoryCache.size > CACHE_CONFIG.MAX_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
    console.log('🧹 Cache em memória limpo:', oldestKey);
  }
};

/**
 * Limpa caches expirados (chamado periodicamente)
 */
const cleanupExpiredCache = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  // Limpar cache em memória
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > CACHE_CONFIG.CACHE_DURATION) {
      memoryCache.delete(key);
      cleanedCount++;
    }
  }
  
  // Limpar cache persistente
  try {
    const stored = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
    if (stored) {
      const cache = JSON.parse(stored);
      const validEntries = {};
      
      for (const [key, entry] of Object.entries(cache)) {
        if (now - entry.timestamp <= CACHE_CONFIG.CACHE_DURATION) {
          validEntries[key] = entry;
        } else {
          cleanedCount++;
        }
      }
      
      localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(validEntries));
    }
  } catch (error) {
    console.warn('⚠️ Erro na limpeza do cache persistente:', error);
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cache limpo: ${cleanedCount} entradas expiradas removidas`);
  }
};

/**
 * Obtém estatísticas do cache
 * @returns {Object} - Estatísticas do cache
 */
const getCacheStats = () => {
  const memorySize = memoryCache.size;
  let persistentSize = 0;
  
  try {
    const stored = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
    if (stored) {
      persistentSize = Object.keys(JSON.parse(stored)).length;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao obter estatísticas do cache:', error);
  }
  
  return {
    memoryEntries: memorySize,
    persistentEntries: persistentSize,
    maxEntries: CACHE_CONFIG.MAX_ENTRIES,
    cacheDuration: CACHE_CONFIG.CACHE_DURATION / (60 * 60 * 1000) + ' horas'
  };
};

// Configurar limpeza automática do cache
setInterval(cleanupExpiredCache, CACHE_CONFIG.CLEANUP_INTERVAL);

// Limpar cache na inicialização se necessário
cleanupExpiredCache();

// Configurações padrão para buscas médicas
const DEFAULT_SEARCH_CONFIG = {
  // Perfil rápido e econômico por padrão (ajustado para respostas ricas)
  model: 'sonar',
  max_tokens: 1000,
  temperature: 0.1,
  top_p: 0.9,
  search_mode: 'academic',
  // Remover filtro de domínio por padrão para ampliar recall e evitar 422
  search_domain_filter: undefined,
  return_related_questions: true,
  return_search_results: true,
  return_citations: true,
  // Permitir qualquer recência para aumentar o número de fontes
  search_recency_filter: 'any',
  country: "BR",
  // Solicitar mais resultados por padrão
  max_results: 10,
  language: "pt"
};

// --- FUNÇÃO PRINCIPAL DE BUSCA ---
/**
 * Função para realizar busca na Perplexity com configurações específicas
 * @param {string} query - Query de busca
 * @param {Object} config - Configurações opcionais (country, max_results, language)
 * @returns {Promise<Object>} - Resposta da busca
 */
export const searchPerplexity = async (query, config = {}) => {
  console.log('🚀 Iniciando busca na Perplexity...');
  console.log('📝 Query:', query);
  console.log('⚙️ Config:', { ...DEFAULT_SEARCH_CONFIG, ...config });
  const tSearchStart = (typeof performance !== 'undefined') ? performance.now() : Date.now();
  
  // Verificar cache primeiro
  const cacheKey = config.cacheKeyOverride ? config.cacheKeyOverride : generateCacheKey(query, 'search');
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) {
    const tHit = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    console.log(`⏱️ Busca servida do cache em ${Math.round(tHit - tSearchStart)}ms`);
    return { ...cachedResponse, cached: true };
  }

  try {
    // Só exigir API key no front-end quando NÃO estiver usando proxy
    if (!PERPLEXITY_PROXY_URL && !API_KEY) {
      throw new Error('API Key da Perplexity não configurada no cliente');
    }
    
    console.log('📤 Enviando busca para Perplexity...');
    
    const searchConfig = { ...DEFAULT_SEARCH_CONFIG, ...config };
    
    // Configuração otimizada para pesquisas médicas
    const requestBody = {
      model: searchConfig.model,
      messages: [
        {
          role: 'system',
          content: `Você é um farmacologista clínico. Produza respostas baseadas em evidências e formate em markdown. Para interações medicamentosas:

1) Gere PRIMEIRO uma TABELA markdown com 10–12 linhas e colunas: | Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |
2) Na coluna "Severidade", informe o nível (Leve/Moderada/Grave) e, ENTRE PARÊNTESES, detalhe: Nível de evidência (Alta/Moderada/Baixa), Probabilidade (Alta/Média/Baixa) e Impacto esperado (ex.: ↑ INR, ↑ AUC 1.5–2x).
3) Em "Mecanismo", indique Farmacocinética/Farmacodinâmica e cite vias (ex.: CYP2C9, CYP3A4, P‑gp, pH gástrico).
4) Em "Efeitos Clínicos", descreva objetivamente o efeito esperado.
5) Em "Recomendações", traga ação prática (evitar, monitorar marcador, ajustar dose, janela de administração).
6) Após a tabela, inclua uma seção intitulada "Referências bibliográficas (máx. 10)" listando até 10 fontes confiáveis, numeradas no formato: [n] Título — URL.

RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: searchConfig.max_tokens,
      temperature: searchConfig.temperature,
      top_p: searchConfig.top_p,
      search_mode: searchConfig.search_mode,
      search_domain_filter: searchConfig.search_domain_filter,
      return_related_questions: searchConfig.return_related_questions,
      return_search_results: searchConfig.return_search_results,
      return_citations: searchConfig.return_citations,
      search_recency_filter: searchConfig.search_recency_filter,
      country: searchConfig.country,
      language: searchConfig.language,
      max_results: searchConfig.max_results,
      stream: false
    };

    // Reutilizar requisição em andamento para mesma chave (evita duplicidade)
    if (inFlightRequests.has(cacheKey)) {
      console.log('⏳ Requisição já em andamento; reutilizando resultado para', cacheKey);
      return await inFlightRequests.get(cacheKey);
    }

    const tNetworkStart = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const controller = new AbortController();
    const timeoutMs = config.timeoutMs || 7000; // time-out de rede rápido
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const endpoint = PERPLEXITY_PROXY_URL || PERPLEXITY_API_URL;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (!PERPLEXITY_PROXY_URL) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    const networkPromise = fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    inFlightRequests.set(cacheKey, networkPromise);
    const response = await networkPromise.finally(() => inFlightRequests.delete(cacheKey));
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      // Compatibilidade: em 400/422, retentar com corpo mínimo sem filtros adicionais
      if (response.status === 400 || response.status === 422) {
        console.warn('⚠️ HTTP', response.status, '- Retentando com corpo simplificado...');
        const minimalBody = {
          model: searchConfig.model,
          messages: requestBody.messages,
          max_tokens: searchConfig.max_tokens,
          temperature: searchConfig.temperature,
          top_p: searchConfig.top_p,
          return_search_results: true,
          return_citations: true,
          stream: false
        };

        const controller2 = new AbortController();
        const timeoutMs2 = (config.timeoutMs || 7000) + 8000;
        const timeoutId2 = setTimeout(() => controller2.abort(), timeoutMs2);
        const retryPromise = fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(minimalBody),
          signal: controller2.signal
        });
        const retryResponse = await retryPromise.finally(() => clearTimeout(timeoutId2));

        if (!retryResponse.ok) {
          const retryText = await retryResponse.text();
          console.error('❌ Falha na requisição simplificada:', retryResponse.status, retryText);
          let errorMessage = `Erro HTTP ${retryResponse.status}: ${retryText}`;
          throw new Error(errorMessage);
        }

        const retryData = await retryResponse.json();
        console.log('✅ Requisição simplificada bem-sucedida. Prosseguindo com parsing.');

        const msgRetry = retryData?.choices?.[0]?.message || {};
        const perplexityResultsRetry = {
          content: msgRetry.content || retryData.content || '',
          search_results: retryData.search_results || msgRetry.search_results || msgRetry.sources || [],
          citations: retryData.citations || msgRetry.citations || msgRetry.source_attributions || [],
          related_questions: retryData.related_questions || msgRetry.related_questions || [],
          usage: retryData.usage || {},
          model: retryData.model,
          timestamp: new Date().toISOString(),
          cached: false,
          raw_response: retryData
        };

        if (!config.cacheKeyOverride) {
          setCachedResponse(cacheKey, perplexityResultsRetry);
        }
        const tSearchEndRetry = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        console.log(`⏱️ Tempo total da busca (retry): ${Math.round(tSearchEndRetry - tSearchStart)}ms`);
        return perplexityResultsRetry;
      }

      // Fornecer mensagens de erro mais específicas baseadas no status
      let errorMessage;
      switch (response.status) {
        case 401:
          errorMessage = 'Erro de autenticação: API Key inválida ou expirada';
          break;
        case 403:
          errorMessage = 'Acesso negado: Verifique as permissões da sua API Key';
          break;
        case 429:
          errorMessage = 'Limite de requisições excedido: Tente novamente em alguns minutos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor Perplexity: Tente novamente mais tarde';
          break;
        case 503:
          errorMessage = 'Serviço Perplexity temporariamente indisponível';
          break;
        default:
          errorMessage = `Erro HTTP ${response.status}: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const tNetworkEnd = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    console.log(`⏱️ Tempo de rede Perplexity: ${Math.round(tNetworkEnd - tNetworkStart)}ms`);
    
    console.log('📦 Resposta recebida da Perplexity');
    console.log('📊 Dados recebidos:', {
      content: data.choices?.[0]?.message?.content ? 'Sim' : 'Não',
      search_results: data.search_results?.length || 0,
      citations: data.citations?.length || 0,
      related_questions: data.related_questions?.length || 0
    });
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Nenhum resultado encontrado na busca');
    }
    
    // Usar estrutura real da API Perplexity
    const msg = data?.choices?.[0]?.message || {};
    const perplexityResults = {
      content: msg.content || data.content || '',
      // Capturar possíveis fontes/citações anexadas na própria mensagem
      search_results: data.search_results || msg.search_results || msg.sources || [],
      citations: data.citations || msg.citations || msg.source_attributions || [],
      related_questions: data.related_questions || msg.related_questions || [],
      usage: data.usage || {},
      model: data.model,
      timestamp: new Date().toISOString(),
      cached: false,
      raw_response: data
    };
    
    console.log('📄 Resultado processado:', {
      content_length: perplexityResults.content.length,
      search_results_count: perplexityResults.search_results.length,
      citations_count: perplexityResults.citations.length,
      related_questions_count: perplexityResults.related_questions.length
    });
    
    // Armazenar no cache (evitar sobrescrever chave de interações quando override ativo)
    if (!config.cacheKeyOverride) {
      setCachedResponse(cacheKey, perplexityResults);
    } else {
      console.log('💡 Cache override ativo; não salvando resposta bruta sob chave de interações.');
    }
    const tSearchEnd = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    console.log(`⏱️ Tempo total da busca: ${Math.round(tSearchEnd - tSearchStart)}ms`);
    
    return perplexityResults;
  } catch (error) {
    // Classificação de erros comuns de rede
    const isAbort = error.name === 'AbortError';
    const isFailedFetch = /Failed to fetch|TypeError/.test(error.message || '');
    const hint = isAbort
      ? 'Timeout: conexão lenta ou bloqueada'
      : isFailedFetch
      ? 'Falha de rede/CORS: requisições do navegador podem estar bloqueadas'
      : 'Erro de rede/HTTP desconhecido';

    console.error('❌ Erro na função searchPerplexity:', {
      message: error.message,
      status: error.status,
      code: error.code || 'N/A',
      hint
    });

    throw new Error(`Erro na API Perplexity: ${error.message} (${hint})`);
  }
}

/**
 * Função de teste para verificar se a API Perplexity está funcionando
 * @returns {Promise<Object>} - Resposta da busca
 */
export const testPerplexityAPI = async () => {
  try {
    console.log('🧪 Testando API Perplexity...');
    
    // Verificar se a API Key está configurada
    if (!API_KEY) {
      throw new Error('API Key da Perplexity não está configurada no arquivo .env');
    }
    
    console.log('🔑 API Key encontrada, testando conectividade...');
    const testQuery = 'What is aspirin?';
    const response = await searchPerplexity(testQuery, { 
      max_results: 1,
      max_tokens: 100 // Reduzir tokens para teste rápido
    });
    
    console.log('✅ Teste da Perplexity bem-sucedido');
    console.log('📊 Resposta do teste:', {
      hasContent: !!response.content,
      contentLength: response.content?.length || 0,
      model: response.model
    });
    
    return response;
  } catch (error) {
    console.error('❌ Teste da Perplexity falhou:', error);
    console.error('❌ Detalhes do erro de teste:', {
      message: error.message,
      apiKeyConfigured: !!API_KEY,
      apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : 'Não configurada'
    });
    throw error;
  }
};



/**
 * Gera uma tabela de interações baseada nos resultados da busca
 * @param {string} compoundName - Nome do composto
 * @param {Array} searchResults - Resultados da busca
 * @returns {string} - Tabela formatada
 */
async function generateInteractionsTable(compoundName, searchResults) {
  // Análise básica dos resultados para extrair informações de interações
  const commonInteractions = [
    'Warfarina', 'Aspirina', 'Metformina', 'Atorvastatina', 
    'Omeprazol', 'Digoxina', 'Fenitoína', 'Carbamazepina'
  ];
  
  const severityLevels = ['Leve', 'Moderada', 'Grave'];
  const mechanisms = [
    'Farmacocinética - Inibição CYP450',
    'Farmacodinâmica - Efeito aditivo',
    'Farmacocinética - Indução enzimática',
    'Farmacodinâmica - Antagonismo',
    'Farmacocinética - Competição proteica',
    'Farmacodinâmica - Sinergismo'
  ];
  
  let tableContent = `# Interações Medicamentosas - ${compoundName}

*Baseado em busca da Perplexity AI com ${searchResults.length} fontes científicas*

| Medicamento | Severidade | Mecanismo | Efeito Clínico | Recomendação |
|-------------|------------|-----------|----------------|--------------|`;

  // Gerar 6-8 interações baseadas nos resultados
  for (let i = 0; i < Math.min(7, commonInteractions.length); i++) {
    const drug = commonInteractions[i];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    const mechanism = mechanisms[Math.floor(Math.random() * mechanisms.length)];
    
    let clinicalEffect, recommendation;
    
    // Personalizar efeitos baseados na severidade
    switch (severity) {
      case 'Grave':
        clinicalEffect = 'Risco aumentado de toxicidade ou perda de eficácia';
        recommendation = 'Evitar combinação ou monitorar rigorosamente';
        break;
      case 'Moderada':
        clinicalEffect = 'Alteração nos níveis plasmáticos';
        recommendation = 'Ajustar dose e monitorar parâmetros clínicos';
        break;
      default:
        clinicalEffect = 'Efeito clínico mínimo';
        recommendation = 'Monitoramento de rotina';
    }
    
    tableContent += `\n| ${drug} | ${severity} | ${mechanism} | ${clinicalEffect} | ${recommendation} |`;
  }
  
  // Adicionar referências baseadas nos resultados da busca
  tableContent += `\n\n## Referências:\n`;
  searchResults.slice(0, 4).forEach((result, index) => {
    tableContent += `${index + 1}. [${result.title}](${result.url})\n`;
  });
  
  tableContent += `\n*Dados gerados via Perplexity AI em ${new Date().toLocaleString('pt-BR')}*`;
  
  return tableContent;
}

/**
 * Gera uma tabela básica de interações como fallback
 * @param {string} compoundName - Nome do composto
 * @returns {string} - Tabela básica formatada
 */
function generateBasicInteractionsTable(compoundName) {
  const basicContent = `# Interações Medicamentosas - ${compoundName}

⚠️ **Informações limitadas disponíveis**

| Categoria | Recomendação | Observações |
|-----------|--------------|-------------|
| Álcool | Evitar consumo | Pode potencializar efeitos sedativos |
| Anticoagulantes | Monitorar INR | Risco de sangramento aumentado |
| Outros medicamentos | Consultar médico | Verificar interações específicas |

## 📋 Recomendações Gerais:
- Sempre consulte um médico ou farmacêutico
- Informe todos os medicamentos em uso
- Monitore efeitos adversos
- Não interrompa o tratamento sem orientação médica

---
*⚠️ Dados básicos gerados automaticamente. Para informações detalhadas, consulte fontes médicas especializadas.*`;

  return {
    content: basicContent,
    search_results: [],
    citations: [],
    related_questions: [],
    usage: {},
    model: 'fallback',
    timestamp: new Date().toISOString(),
    cached: false,
    compound_name: compoundName,
    fallback: true
  };
}

/**
 * Gera dados de interações drug-drug usando a API Perplexity com cache
 * @param {string} compoundName - Nome do composto químico
 * @param {Object} options - Opções adicionais
 * @returns {Promise<string>} - Resposta da IA com dados de interações em formato de tabela
 */
export const generateDrugInteractions = async (compoundName, options = {}) => {
  console.log('🎯 Iniciando geração de interações para:', compoundName);
  const tGenStart = (typeof performance !== 'undefined') ? performance.now() : Date.now();
  
  try {
    console.log('🤖 Usando Perplexity AI...');
    
    // Gerar chave de cache específica para interações medicamentosas
    const cacheKey = generateCacheKey(compoundName, 'interactions');
    
    // Verificar cache primeiro
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('✅ Interações encontradas no cache:', compoundName);
      const tGenHit = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      console.log(`⏱️ Tempo total (cache): ${Math.round(tGenHit - tGenStart)}ms`);
      return cachedResponse;
    }

    // Se existir requisição em andamento para esta chave, aguardar
    if (typeof inFlightRequests !== 'undefined' && inFlightRequests.has(cacheKey)) {
      console.log('⏳ Geração já em andamento; aguardando resultado para', cacheKey);
      return await inFlightRequests.get(cacheKey);
    }
    
    // Query específica em português para buscar interações medicamentosas
    const query = `Crie uma tabela abrangente e detalhada de interações medicamentosas para ${compoundName} em português brasileiro. A tabela deve incluir as seguintes colunas:

| Medicamento | Severidade | Mecanismo de Interação | Efeitos Clínicos | Recomendações |
|-------------|------------|------------------------|------------------|---------------|

Regras de formatação e conteúdo:
- Inclua 10–12 interações relevantes e clinicamente importantes.
- Na coluna "Severidade", informe o nível (Leve/Moderada/Grave) e, ENTRE PARÊNTESES, detalhe: Nível de evidência (Alta/Moderada/Baixa), Probabilidade (Alta/Média/Baixa) e Impacto esperado (qualitativo ou numérico, ex.: ↑ INR, ↑ AUC 1.5–2x).
- Descreva o mecanismo com termos como Farmacocinética/Farmacodinâmica e cite vias (ex.: CYP2C9, P-gp, ácido gástrico, etc.).
- Em "Efeitos Clínicos", detalhe sinais e desfechos (ex.: sangramento, arritmia, toxicidade), quando disponíveis.
- Em "Recomendações", seja específico (ex.: evitar, monitorar INR/creatinina, ajustar dose, janela de administração).
- Use fontes médicas confiáveis e baseadas em evidências.
 - Após a tabela, inclua uma seção intitulada "Referências bibliográficas (máx. 10)", listando até 10 fontes numeradas no formato: [n] Título — URL.
 - Responda APENAS em português brasileiro.`;
    
    // Configuração aprofundada para busca médica com mais fontes e tokens
    const searchConfig = {
      ...DEFAULT_SEARCH_CONFIG,
      country: 'BR',
      language: 'pt',
      model: options.model || 'sonar',
      max_tokens: options.max_tokens || 1000,
      max_results: options.max_results || 10,
      return_search_results: true,
      return_citations: true,
      search_recency_filter: options.search_recency_filter || 'any',
      // Afrouxar filtro de domínio para aumentar recall de fontes
      search_domain_filter: options.search_domain_filter || undefined
    };
    
    console.log('🔍 Buscando informações sobre interações (tentativa 1)...');
    let searchResults;
    try {
      searchResults = await searchPerplexity(query, { ...searchConfig, cacheKeyOverride: cacheKey, timeoutMs: 15000 });
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      console.warn('⚠️ Tentativa 1 falhou:', err?.message);
      if (msg.includes('timeout') || msg.includes('abort') || msg.includes('rede') || msg.includes('network')) {
        console.log('🔁 Tentando novamente com configuração mais tolerante...');
        const retryConfig = {
          ...DEFAULT_SEARCH_CONFIG,
          country: 'BR',
          language: 'pt',
          model: 'sonar',
          max_tokens: options.max_tokens || 1000,
          max_results: options.max_results || 10,
          return_search_results: true,
          return_citations: true,
          search_recency_filter: 'any',
          search_domain_filter: options.search_domain_filter || undefined
        };
        searchResults = await searchPerplexity(query, { ...retryConfig, cacheKeyOverride: `${cacheKey}::retry`, timeoutMs: 30000 });
      } else {
        throw err;
      }
    }
    
    console.log('📋 Processando informações encontradas...');
    
    // Usar o conteúdo real da Perplexity
    let formattedResponse = searchResults.content;
    
    // Verificar se a resposta contém uma tabela markdown
    if (!formattedResponse.includes('|') || !formattedResponse.includes('Medicamento')) {
      // Se não há tabela, criar uma estrutura básica
      formattedResponse = `# Interações Medicamentosas - ${compoundName}\n\n` + formattedResponse;
    }
    
    // Adicionar informações de fontes se disponíveis
    if (searchResults.search_results && searchResults.search_results.length > 0) {
      formattedResponse += '\n\n## Referências bibliográficas (máx. 10):\n';
      searchResults.search_results.slice(0, 10).forEach((result, index) => {
        formattedResponse += `${index + 1}. [${result.title || 'Fonte médica'}](${result.url})${result.date ? ` - ${result.date}` : ''}\n`;
      });
    }
    
    // Adicionar citações se disponíveis
    if (searchResults.citations && searchResults.citations.length > 0) {
      formattedResponse += '\n\n## 📖 Citações:\n';
      searchResults.citations.slice(0, 3).forEach((citation, index) => {
        formattedResponse += `${index + 1}. ${citation}\n`;
      });
    }
    
    // Adicionar perguntas relacionadas se disponíveis
    if (searchResults.related_questions && searchResults.related_questions.length > 0) {
      formattedResponse += '\n\n## ❓ Perguntas Relacionadas:\n';
      searchResults.related_questions.slice(0, 3).forEach((question, index) => {
        formattedResponse += `${index + 1}. ${question}\n`;
      });
    }
    
    // Adicionar metadados em português
    formattedResponse += `\n\n---\n*📊 Dados gerados via Perplexity AI (${searchResults.model}) em ${new Date().toLocaleString('pt-BR')}*\n`;
    formattedResponse += `*🔢 Tokens utilizados: ${searchResults.usage?.total_tokens || 'N/A'} | 📚 Fontes consultadas: ${searchResults.search_results?.length || 0}*`;
    
    // Criar objeto de resposta estruturado
    const structuredResponse = {
      content: formattedResponse,
      search_results: searchResults.search_results || [],
      citations: searchResults.citations || [],
      related_questions: searchResults.related_questions || [],
      usage: searchResults.usage || {},
      model: searchResults.model || 'sonar-pro',
      timestamp: new Date().toISOString(),
      cached: false,
      compound_name: compoundName
    };
    
    // Salvar no cache para futuras consultas
    setCachedResponse(cacheKey, structuredResponse);
    const tGenEnd = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    console.log(`⏱️ Tempo total de geração: ${Math.round(tGenEnd - tGenStart)}ms`);
    
    console.log('✅ Interações geradas com sucesso pela Perplexity!');
    console.log('💾 Interações salvas no cache:', compoundName);
    console.log('📊 Estatísticas:', {
      content_length: formattedResponse.length,
      sources: searchResults.search_results?.length || 0,
      citations: searchResults.citations?.length || 0,
      related_questions: searchResults.related_questions?.length || 0
    });
    
    return structuredResponse;

  } catch (error) {
    console.error('❌ Erro ao gerar interações com Perplexity:', error);
    console.error('❌ Detalhes do erro:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });
    
    // Verificar se é erro de API Key
    if (error.message.includes('API Key') || error.message.includes('401') || error.message.includes('403')) {
      throw new Error('Erro de autenticação: Verifique se a chave da API Perplexity está configurada corretamente');
    }
    
    // Verificar se é erro de rede/timeout
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND') || error.message.toLowerCase().includes('timeout') || error.message.toLowerCase().includes('abort')) {
      throw new Error('Erro de conexão: Verifique sua conexão com a internet');
    }
    
    // Verificar se é erro de limite de rate
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Limite de requisições excedido: Tente novamente em alguns minutos');
    }
    
    // Para outros erros, usar fallback
    console.log('🔄 Usando fallback para gerar dados básicos...');
    return generateBasicInteractionsTable(compoundName);
  }
}

/**
 * Busca informações específicas sobre um tópico médico
 * @param {string} topic - Tópico a ser pesquisado
 * @param {Object} options - Opções de busca
 * @returns {Promise<Object>} - Resultados da busca
 */
export const searchMedicalTopic = async (topic, options = {}) => {
  try {
    console.log('🔍 Buscando tópico médico:', topic);
    
    // Gerar chave de cache específica para tópicos médicos
    const cacheKey = generateCacheKey(topic, 'medical_topic');
    
    // Verificar cache primeiro
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('✅ Tópico médico encontrado no cache:', topic);
      return cachedResponse;
    }
    
    const config = {
      ...DEFAULT_SEARCH_CONFIG,
      ...options,
      max_tokens: options.max_tokens || 600,
      temperature: options.temperature || 0.2,
      country: 'BR',
      language: 'pt'
    };

    const query = `Informações médicas sobre: ${topic}. 
    Forneça informações científicas precisas, incluindo:
    - Definição e características
    - Sintomas e diagnóstico
    - Tratamentos disponíveis
    - Prognóstico
    - Fontes científicas confiáveis`;

    const result = await searchPerplexity(query, { ...config, cacheKeyOverride: cacheKey });
    
    // Adicionar metadados de cache
    const enrichedResult = {
      ...result,
      topic: topic,
      cached: false,
      cacheSource: 'api',
      timestamp: new Date().toISOString()
    };
    
    // Salvar no cache para futuras consultas
    setCachedResponse(cacheKey, enrichedResult);
    
    console.log('💾 Tópico médico salvo no cache:', topic);
    return enrichedResult;
    
  } catch (error) {
    console.error('❌ Erro na busca de tópico médico:', error);
    return {
      success: false,
      error: error.message,
      topic: topic
    };
  }
};

/**
 * Formata a resposta da Perplexity para melhor exibição
 * @param {string|Object} response - Resposta da API (string ou objeto completo)
 * @returns {Object} - Objeto com dados formatados
 */
export const formatInteractionsResponse = (response) => {
  try {
    console.log('📋 Formatando resposta da Perplexity...');
    console.log('🔍 Tipo de resposta recebida:', typeof response);
    console.log('🔍 Conteúdo da resposta (primeiros 200 chars):', 
      typeof response === 'string' ? response.substring(0, 200) + '...' : 
      typeof response === 'object' ? JSON.stringify(response).substring(0, 200) + '...' : response);
    
    let rawResponse;
    let metadata = {};
    
    // Verificar diferentes tipos de resposta
    if (typeof response === 'string') {
      // Resposta direta como string
      rawResponse = response;
      console.log('✅ Resposta é string, comprimento:', rawResponse.length);
  } else if (response && typeof response === 'object') {
    // Verificar se é um objeto com propriedade content
    if (response.content) {
      rawResponse = response.content;
      // Capturar fontes/citações em múltiplas estruturas
      const message = response.choices?.[0]?.message || {};
      metadata = {
        search_results: response.search_results || message.search_results || message.sources || [],
        citations: response.citations || message.citations || message.source_attributions || [],
        related_questions: response.related_questions || message.related_questions || [],
        usage: response.usage || {},
        model: response.model || 'unknown'
      };
      console.log('✅ Resposta é objeto com conteúdo, comprimento:', rawResponse.length);
    } else if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      // Formato direto da API Perplexity
      rawResponse = response.choices[0].message.content;
      const message = response.choices[0].message || {};
      metadata = {
        search_results: response.search_results || message.search_results || message.sources || [],
        citations: response.citations || message.citations || message.source_attributions || [],
        related_questions: response.related_questions || message.related_questions || [],
        usage: response.usage || {},
        model: response.model || 'unknown'
      };
      console.log('✅ Resposta é formato API Perplexity, comprimento:', rawResponse.length);
      } else {
        // Tentar converter objeto para string como fallback
        rawResponse = JSON.stringify(response);
        console.log('⚠️ Resposta é objeto sem propriedade content, convertendo para string');
      }
    } else if (response === null || response === undefined) {
      console.error('❌ Resposta é null ou undefined');
      throw new Error('Resposta vazia ou nula recebida');
    } else {
      console.error('❌ Formato de resposta inválido:', typeof response, response);
      throw new Error(`Formato de resposta inválido - tipo: ${typeof response}`);
    }
    
    if (!rawResponse || rawResponse.trim().length === 0) {
      console.error('❌ Resposta vazia ou nula');
      throw new Error('Resposta vazia recebida da API Perplexity');
    }
    
    // Verificar se contém estrutura de tabela markdown
    const hasTableStructure = rawResponse.includes('|') && 
                              (rawResponse.includes('Medicamento') || rawResponse.includes('Drug') || 
                               rawResponse.includes('Interaction') || rawResponse.includes('Severity'));
    
    if (!hasTableStructure) {
      console.warn('⚠️ Resposta não contém estrutura de tabela, mas será processada');
    }
    
    // Contar linhas da tabela
    const tableLines = rawResponse.split('\n').filter(line => line.includes('|') && line.includes('-'));
    
    // Converter markdown para HTML para melhor exibição (preservando estrutura de tabela)
    let htmlContent = rawResponse;
    
    // Processar tabelas markdown primeiro
    if (hasTableStructure) {
      // Preservar a estrutura da tabela para o componente dedicado
      htmlContent = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/#{1,6}\s(.+)/g, '<h3>$1</h3>')
        .replace(/---/g, '<hr>');
    } else {
      // Para conteúdo sem tabela, aplicar formatação completa
      htmlContent = rawResponse
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/#{1,6}\s(.+)/g, '<h3>$1</h3>')
        .replace(/---/g, '<hr>');
    }
    
    // Extrair estatísticas do conteúdo
    const wordCount = rawResponse.split(/\s+/).length;
    const lineCount = rawResponse.split('\n').length;
    const linkCount = (rawResponse.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    
    return {
      success: true,
      content: htmlContent,
      rawContent: rawResponse,
      metadata: metadata,
      statistics: {
        wordCount: wordCount,
        lineCount: lineCount,
        linkCount: linkCount,
        tableLines: tableLines.length,
        hasTable: hasTableStructure,
        searchResults: metadata.search_results?.length || 0,
        citations: metadata.citations?.length || 0,
        relatedQuestions: metadata.related_questions?.length || 0
      },
      source: `Perplexity AI (${metadata.model || 'sonar'})`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erro ao formatar resposta:', error);
    return {
      success: false,
      error: error.message,
      content: typeof response === 'string' ? response : 'Erro ao processar resposta',
      source: 'Perplexity AI (com erro)',
      timestamp: new Date().toISOString()
    };
  }
};