/**
 * Serviço para integração com a API do openFDA
 * Documentação: https://open.fda.gov/apis/authentication/
 * Endpoint: https://open.fda.gov/apis/drug/event/how-to-use-the-endpoint/
 */

// API Key fornecida pelo usuário
const FDA_API_KEY = 'rwHpTEBwnc5YZe3Yzb5nwNND4ylut3UmZMIAyx36';
const FDA_BASE_URL = 'https://api.fda.gov';

/**
 * Mapeamento de sinonímias entre nomes genéricos e comerciais de medicamentos
 * Inclui variações em português, inglês e nomes científicos
 */
const DRUG_SYNONYMS = {
  // Ácido Acetilsalicílico / Aspirina
  'acido acetilsalicilico': ['aspirin', 'acetylsalicylic acid', 'asa', 'aspirina', 'salicylate'],
  'aspirina': ['aspirin', 'acetylsalicylic acid', 'asa', 'acido acetilsalicilico', 'salicylate'],
  'aspirin': ['aspirina', 'acetylsalicylic acid', 'asa', 'acido acetilsalicilico', 'salicylate'],
  'acetylsalicylic acid': ['aspirin', 'aspirina', 'asa', 'acido acetilsalicilico', 'salicylate'],
  
  // Paracetamol / Acetaminofeno
  'paracetamol': ['acetaminophen', 'acetaminofeno', 'tylenol', 'n-acetyl-p-aminophenol'],
  'acetaminophen': ['paracetamol', 'acetaminofeno', 'tylenol', 'n-acetyl-p-aminophenol'],
  'acetaminofeno': ['paracetamol', 'acetaminophen', 'tylenol', 'n-acetyl-p-aminophenol'],
  
  // Ibuprofeno
  'ibuprofeno': ['ibuprofen', 'advil', 'motrin', 'brufen'],
  'ibuprofen': ['ibuprofeno', 'advil', 'motrin', 'brufen'],
  
  // Dipirona / Metamizol
  'dipirona': ['metamizole', 'metamizol', 'novalgina', 'novalgin'],
  'metamizole': ['dipirona', 'metamizol', 'novalgina', 'novalgin'],
  'metamizol': ['dipirona', 'metamizole', 'novalgina', 'novalgin'],
  
  // Diclofenaco
  'diclofenaco': ['diclofenac', 'voltaren', 'cataflam'],
  'diclofenac': ['diclofenaco', 'voltaren', 'cataflam'],
  
  // Omeprazol
  'omeprazol': ['omeprazole', 'prilosec', 'losec'],
  'omeprazole': ['omeprazol', 'prilosec', 'losec'],
  
  // Metformina
  'metformina': ['metformin', 'glucophage', 'glifage'],
  'metformin': ['metformina', 'glucophage', 'glifage'],
  
  // Sinvastatina
  'sinvastatina': ['simvastatin', 'zocor'],
  'simvastatin': ['sinvastatina', 'zocor'],
  
  // Losartana
  'losartana': ['losartan', 'cozaar'],
  'losartan': ['losartana', 'cozaar'],
  
  // Atenolol
  'atenolol': ['tenormin'],
  
  // Captopril
  'captopril': ['capoten'],
  
  // Enalapril
  'enalapril': ['vasotec', 'renitec'],
  
  // Furosemida
  'furosemida': ['furosemide', 'lasix'],
  'furosemide': ['furosemida', 'lasix'],
  
  // Hidroclorotiazida
  'hidroclorotiazida': ['hydrochlorothiazide', 'hctz', 'microzide'],
  'hydrochlorothiazide': ['hidroclorotiazida', 'hctz', 'microzide'],
  
  // Warfarina
  'varfarina': ['warfarin', 'coumadin', 'marevan'],
  'warfarin': ['varfarina', 'coumadin', 'marevan'],
  'warfarina': ['warfarin', 'coumadin', 'marevan'],
  
  // Insulina
  'insulina': ['insulin', 'humulin', 'novolin'],
  'insulin': ['insulina', 'humulin', 'novolin'],
  
  // Prednisona
  'prednisona': ['prednisone', 'deltasone'],
  'prednisone': ['prednisona', 'deltasone'],
  
  // Amoxicilina
  'amoxicilina': ['amoxicillin', 'amoxil', 'trimox'],
  'amoxicillin': ['amoxicilina', 'amoxil', 'trimox'],
  // Semaglutide e marcas comerciais
  'semaglutide': ['ozempic', 'wegovy', 'rybelsus', 'semaglutida'],
  'semaglutida': ['semaglutide', 'ozempic', 'wegovy', 'rybelsus'],
  'ozempic': ['semaglutide', 'semaglutida', 'wegovy', 'rybelsus'],
  'wegovy': ['semaglutide', 'semaglutida', 'ozempic', 'rybelsus'],
  'rybelsus': ['semaglutide', 'semaglutida', 'ozempic', 'wegovy']
};

/**
 * Normaliza o nome de um medicamento removendo acentos, espaços extras e convertendo para minúsculas
 * @param {string} drugName - Nome do medicamento
 * @returns {string} - Nome normalizado
 */
const normalizeDrugName = (drugName) => {
  if (!drugName || typeof drugName !== 'string') return '';
  
  return drugName
    .toLowerCase()
    .trim()
    // Remove acentos e caracteres especiais
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove caracteres especiais exceto letras, números e espaços
    .replace(/[^a-z0-9\s-]/g, '')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Expande um nome de medicamento para incluir todos os seus sinônimos
 * @param {string} drugName - Nome do medicamento original
 * @returns {Array<string>} - Array com o nome original e todos os sinônimos
 */
// Detecta padrão de número CAS (ex.: 2305040-16-6)
const isCasLike = (text) => {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();
  const casPattern = /^\d{2,7}-\d{2}-\d$/;
  return casPattern.test(clean);
};

const expandDrugSynonyms = (drugName, externalSynonyms = []) => {
  const normalizedName = normalizeDrugName(drugName);
  const synonyms = new Set([normalizedName]);

  // Adiciona sinônimos diretos do mapa interno
  if (DRUG_SYNONYMS[normalizedName]) {
    DRUG_SYNONYMS[normalizedName].forEach(synonym => {
      const n = normalizeDrugName(synonym);
      if (n && n.length > 1) synonyms.add(n);
    });
  }

  // Busca por sinônimos reversos (quando o nome está na lista de sinônimos de outro)
  Object.entries(DRUG_SYNONYMS).forEach(([key, synonymList]) => {
    if (synonymList.some(synonym => normalizeDrugName(synonym) === normalizedName)) {
      synonyms.add(key);
      synonymList.forEach(synonym => {
        const n = normalizeDrugName(synonym);
        if (n && n.length > 1) synonyms.add(n);
      });
    }
  });

  // Adiciona variações comuns do nome base
  const variations = generateNameVariations(normalizedName);
  variations.forEach(variation => {
    if (variation && variation.length > 1) synonyms.add(variation);
  });

  // Integra sinônimos externos (ex.: retornados pelo PubChem), filtrando números CAS
  if (Array.isArray(externalSynonyms)) {
    externalSynonyms.forEach(syn => {
      const normalized = normalizeDrugName(String(syn));
      // Ignora entradas vazias, muito curtas, sem letras ou que pareçam CAS
      const hasLetters = /[a-z]/.test(normalized);
      if (normalized && normalized.length > 1 && hasLetters && !isCasLike(normalized)) {
        synonyms.add(normalized);
        // Adiciona variações também para sinônimos externos
        generateNameVariations(normalized).forEach(v => {
          if (v && v.length > 1) synonyms.add(v);
        });
      }
    });
  }

  // Saída final deduplicada
  return Array.from(synonyms).filter(name => name.length > 1).slice(0, 100);
};

/**
 * Gera variações comuns de um nome de medicamento
 * @param {string} drugName - Nome normalizado do medicamento
 * @returns {Array<string>} - Array com variações do nome
 */
const generateNameVariations = (drugName) => {
  const variations = new Set();
  
  // Variações com e sem espaços
  variations.add(drugName.replace(/\s/g, ''));
  variations.add(drugName.replace(/\s/g, '-'));
  
  // Variações de palavras compostas
  if (drugName.includes(' ')) {
    const words = drugName.split(' ');
    
    // Primeira palavra apenas
    if (words[0].length > 3) {
      variations.add(words[0]);
    }
    
    // Última palavra apenas
    if (words[words.length - 1].length > 3) {
      variations.add(words[words.length - 1]);
    }
    
    // Combinações de palavras
    for (let i = 0; i < words.length - 1; i++) {
      variations.add(words.slice(i, i + 2).join(' '));
    }
  }
  
  // Variações com sufixos comuns removidos
  const suffixesToRemove = ['sodium', 'potassium', 'hydrochloride', 'sulfate', 'citrate', 'maleate'];
  suffixesToRemove.forEach(suffix => {
    if (drugName.endsWith(` ${suffix}`)) {
      variations.add(drugName.replace(` ${suffix}`, ''));
    }
  });
  
  return Array.from(variations).filter(name => name.length > 1);
};

/**
 * Cria uma query de busca expandida incluindo sinônimos e múltiplos campos
 * @param {string} drugName - Nome do medicamento original
 * @returns {string} - Query expandida para a API FDA
 */
const createExpandedSearchQuery = (drugName, externalSynonyms = []) => {
  const synonyms = expandDrugSynonyms(drugName, externalSynonyms);
  
  console.log(`🔍 Expandindo busca para "${drugName}":`, synonyms);
  
  // Criar queries para diferentes campos da API FDA com priorização
  const allQueries = [];
  
  // PRIORIDADE ALTA: Campos openFDA harmonizados (mais confiáveis)
  synonyms.forEach(synonym => {
    // Nome genérico (campo mais importante)
    allQueries.push(`patient.drug.openfda.generic_name:"${synonym}"`);
    
    // Nome comercial/marca
    allQueries.push(`patient.drug.openfda.brand_name:"${synonym}"`);
    
    // Substância ativa
    allQueries.push(`patient.drug.openfda.substance_name:"${synonym}"`);
    
    // Ingrediente ativo
    if (synonym.length > 3) { // Evitar termos muito curtos
      allQueries.push(`patient.drug.openfda.active_ingredient:"${synonym}"`);
    }
  });
  
  // PRIORIDADE MÉDIA: Campos originais do FAERS (maior cobertura)
  synonyms.forEach(synonym => {
    // Produto medicinal (campo principal do FAERS)
    allQueries.push(`patient.drug.medicinalproduct:"${synonym}"`);
    
    // Nome da substância ativa
    allQueries.push(`patient.drug.activesubstancename:"${synonym}"`);
    
    // Nome do medicamento
    allQueries.push(`patient.drug.drugname:"${synonym}"`);
  });
  
  // PRIORIDADE BAIXA: Campos adicionais para cobertura máxima
  synonyms.forEach(synonym => {
    if (synonym.length > 4) { // Apenas para termos mais específicos
      // Indicação terapêutica
      allQueries.push(`patient.drug.drugindication:"${synonym}"`);
      
      // Fabricante
      allQueries.push(`patient.drug.openfda.manufacturer_name:"${synonym}"`);
      
      // Código de produto
      allQueries.push(`patient.drug.openfda.product_ndc:"${synonym}"`);
      
      // Número de aplicação
      allQueries.push(`patient.drug.openfda.application_number:"${synonym}"`);
      
      // Rota de administração
      allQueries.push(`patient.drug.openfda.route:"${synonym}"`);
      
      // Forma farmacêutica
      allQueries.push(`patient.drug.openfda.dosage_form:"${synonym}"`);
    }
  });
  
  // Adicionar buscas parciais para termos compostos
  synonyms.forEach(synonym => {
    if (synonym.includes(' ') || synonym.includes('-')) {
      const parts = synonym.split(/[\s-]+/);
      parts.forEach(part => {
        if (part.length > 3) {
          allQueries.push(`patient.drug.openfda.generic_name:*${part}*`);
          allQueries.push(`patient.drug.medicinalproduct:*${part}*`);
        }
      });
    }
  });
  
  // Remover duplicatas e limitar o número de queries para evitar URLs muito longas
  const uniqueQueries = [...new Set(allQueries)];
  const limitedQueries = uniqueQueries.slice(0, 100); // Limitar para evitar URLs muito longas
  
  const expandedQuery = `(${limitedQueries.join(' OR ')})`;
  
  console.log(`📊 Query expandida gerada com ${limitedQueries.length} termos únicos de busca`);
  
  return expandedQuery;
};

/**
 * Função para buscar reações adversas de um medicamento/composto no FDA com cobertura ampliada
 * @param {string} drugName - Nome do medicamento/composto (nome genérico/químico)
 * @param {number} maxResults - Número máximo de resultados desejados (padrão: 500)
 * @returns {Promise<Object>} - Dados das reações adversas com cobertura ampliada
 */
// Suporta estilo antigo (segundo parâmetro number) e novo com options
// Novo: getAdverseReactions(drugName, { maxResults, synonyms })
export const getAdverseReactions = async (drugName, options = 500) => {
  try {
    const isNumber = typeof options === 'number';
    const isArray = Array.isArray(options);
    const isObject = typeof options === 'object' && options !== null && !isArray;
    const maxResults = isNumber ? options : (isObject && typeof options.maxResults === 'number' ? options.maxResults : 500);
    const externalSynonyms = isArray ? options : (isObject && Array.isArray(options.synonyms) ? options.synonyms : []);

    console.log('🔍 FDA Service - Busca ampliada iniciada para:', drugName, 'timestamp:', new Date().toISOString());

    if (!isValidDrugName(drugName)) {
      return {
        success: false,
        error: 'Nome do medicamento inválido',
        results: [],
        meta: {
          total: 0,
          disclaimer: 'Nome do medicamento inválido'
        }
      };
    }

    // Executar múltiplas estratégias de busca para ampliar cobertura, usando sinônimos externos quando fornecidos
    const allResults = await executeMultipleSearchStrategies(drugName, maxResults, externalSynonyms);
    
    if (allResults.length === 0) {
      return {
        success: true,
        results: [],
        meta: {
          total: 0,
          disclaimer: `Nenhum evento adverso encontrado para "${drugName}" usando múltiplas estratégias de busca`
        },
        stats: getAdverseReactionsStats([]),
        message: `Nenhum evento adverso encontrado para "${drugName}"`
      };
    }
    
    // Filtrar eventos que realmente contêm a substância pesquisada
    const filteredResults = filterEventsByGenericName(allResults, drugName, externalSynonyms);
    console.log(`✅ Filtrados ${filteredResults.length} de ${allResults.length} eventos que contêm "${drugName}"`);
    
    if (filteredResults.length === 0) {
      return {
        success: true,
        results: [],
        meta: {
          total: 0,
          disclaimer: `Nenhum medicamento encontrado contendo a substância "${drugName}"`
        },
        stats: getAdverseReactionsStats([]),
        message: `Nenhum medicamento encontrado contendo a substância "${drugName}"`
      };
    }
    
    // Processar eventos individuais para máxima cobertura
    const processedData = processIndividualAdverseReactions(filteredResults, drugName);
    
    return {
      success: true,
      results: processedData.reactions,
      meta: {
        total: filteredResults.length,
        disclaimer: 'Dados fornecidos pela API openFDA - Busca ampliada com múltiplas estratégias',
        searchStrategies: 'Busca expandida com sinônimos, paginação e múltiplos campos'
      },
      stats: processedData.stats,
      message: `Encontrados ${filteredResults.length} eventos adversos para medicamentos contendo "${drugName}" (busca ampliada)`
    };
    
  } catch (error) {
    console.error('Erro ao buscar reações adversas:', error);
    return {
      success: false,
      results: [],
      meta: {
        total: 0,
        error: error.message,
        disclaimer: 'Erro ao buscar dados da API openFDA'
      },
      error: error.message
    };
  }
};

/**
 * Executa múltiplas estratégias de busca para ampliar a cobertura de eventos adversos
 * @param {string} drugName - Nome do medicamento
 * @param {number} maxResults - Número máximo de resultados desejados
 * @returns {Promise<Array>} - Array combinado de todos os eventos encontrados
 */
const executeMultipleSearchStrategies = async (drugName, maxResults, externalSynonyms = []) => {
  const allEvents = new Map(); // Usar Map para evitar duplicatas por safetyreportid
  const synonyms = expandDrugSynonyms(drugName, externalSynonyms);
  
  console.log(`🔍 Executando múltiplas estratégias de busca para "${drugName}" com ${synonyms.length} sinônimos`);
  
  // Estratégia 1: Busca expandida com todos os sinônimos (principal)
  try {
    const expandedResults = await searchWithExpandedQuery(drugName, Math.min(maxResults, 1000), synonyms);
    expandedResults.forEach(event => {
      if (event.safetyreportid) {
        allEvents.set(event.safetyreportid, event);
      }
    });
    console.log(`✅ Estratégia 1 (expandida): ${expandedResults.length} eventos únicos`);
  } catch (error) {
    console.warn('⚠️ Estratégia 1 falhou:', error.message);
  }
  
  // Estratégia 2: Busca individual por sinônimo (para casos específicos)
  for (const synonym of synonyms.slice(0, 5)) { // Limitar a 5 sinônimos principais
    try {
      const individualResults = await searchBySingleTerm(synonym, 200);
      individualResults.forEach(event => {
        if (event.safetyreportid && !allEvents.has(event.safetyreportid)) {
          allEvents.set(event.safetyreportid, event);
        }
      });
      console.log(`✅ Estratégia 2 (${synonym}): ${individualResults.length} novos eventos`);
      
      // Parar se já temos resultados suficientes
      if (allEvents.size >= maxResults) break;
    } catch (error) {
      console.warn(`⚠️ Estratégia 2 falhou para "${synonym}":`, error.message);
    }
  }
  
  // Estratégia 3: Busca por campos específicos (medicinalproduct, activesubstancename)
  try {
    const specificFieldResults = await searchBySpecificFields(drugName, 300, synonyms);
    specificFieldResults.forEach(event => {
      if (event.safetyreportid && !allEvents.has(event.safetyreportid)) {
        allEvents.set(event.safetyreportid, event);
      }
    });
    console.log(`✅ Estratégia 3 (campos específicos): ${specificFieldResults.length} novos eventos`);
  } catch (error) {
    console.warn('⚠️ Estratégia 3 falhou:', error.message);
  }
  
  const finalResults = Array.from(allEvents.values());
  console.log(`🎯 Total de eventos únicos coletados: ${finalResults.length}`);
  
  return finalResults.slice(0, maxResults);
};

/**
 * Busca com query expandida incluindo todos os sinônimos
 */
const searchWithExpandedQuery = async (drugName, limit, externalSynonyms = []) => {
  const expandedQuery = createExpandedSearchQuery(drugName, externalSynonyms);
  return await performPaginatedSearch(expandedQuery, limit);
};

/**
 * Busca por um termo individual
 */
const searchBySingleTerm = async (term, limit) => {
  const query = `(patient.drug.openfda.generic_name:"${term}" OR patient.drug.openfda.brand_name:"${term}" OR patient.drug.medicinalproduct:"${term}")`;
  return await performPaginatedSearch(query, limit);
};

/**
 * Busca por campos específicos do FAERS
 */
const searchBySpecificFields = async (drugName, limit, externalSynonyms = []) => {
  const synonyms = expandDrugSynonyms(drugName, externalSynonyms);
  const queries = [];
  
  // Busca específica por medicinalproduct
  synonyms.forEach(synonym => {
    queries.push(`patient.drug.medicinalproduct:"${synonym}"`);
  });
  
  // Busca específica por activesubstancename
  synonyms.forEach(synonym => {
    queries.push(`patient.drug.activesubstancename:"${synonym}"`);
  });
  
  const query = `(${queries.join(' OR ')})`;
  return await performPaginatedSearch(query, limit);
};

/**
 * Executa busca paginada para obter mais resultados
 * @param {string} query - Query de busca
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} - Array de eventos
 */
const performPaginatedSearch = async (query, maxResults) => {
  const allResults = [];
  const limitPerPage = 1000; // Máximo permitido pela API FDA
  let skip = 0;
  let hasMoreResults = true;
  
  while (hasMoreResults && allResults.length < maxResults) {
    try {
      const remainingResults = maxResults - allResults.length;
      const currentLimit = Math.min(limitPerPage, remainingResults);
      
      const apiKeyParam = FDA_API_KEY ? `&api_key=${FDA_API_KEY}` : '';
      const url = `${FDA_BASE_URL}/drug/event.json?search=${encodeURIComponent(query)}&limit=${currentLimit}&skip=${skip}${apiKeyParam}`;
      
      console.log(`📄 Buscando página ${Math.floor(skip / limitPerPage) + 1} (skip: ${skip}, limit: ${currentLimit})`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📄 Fim dos resultados (404)');
          break;
        }
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log('📄 Fim dos resultados (sem dados)');
        break;
      }
      
      allResults.push(...data.results);
      skip += data.results.length;
      
      // Se retornou menos que o limite, não há mais páginas
      if (data.results.length < currentLimit) {
        hasMoreResults = false;
      }
      
      console.log(`📄 Coletados ${data.results.length} eventos (total: ${allResults.length})`);
      
      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn(`⚠️ Erro na paginação (skip: ${skip}):`, error.message);
      break;
    }
  }
  
  return allResults;
};

/**
 * Função para processar e formatar os dados de reações adversas
 * @param {Array} results - Resultados brutos da API do FDA
 * @returns {Object} - Objeto com reactions e stats processados
 */
const processAdverseReactions = (results) => {
  if (!Array.isArray(results)) {
    return {
      reactions: [],
      stats: { results: [], total: 0 }
    };
  }

  const processedReactions = results.map((event, index) => {
    // Extrair informações relevantes do evento adverso
    const reactions = event.patient?.reaction || [];
    const drugs = event.patient?.drug || [];
    
    // Encontrar o medicamento principal relacionado
    const primaryDrug = drugs.find(drug => 
      drug.drugcharacterization === '1' || // Medicamento suspeito
      drug.drugcharacterization === '2'    // Medicamento concomitante
    ) || drugs[0];

    // Extrair reações adversas
    const adverseReactions = reactions.map(reaction => ({
      term: reaction.reactionmeddrapt || 'Reação não especificada',
      outcome: getOutcomeDescription(reaction.reactionoutcome),
      severity: reaction.reactionseriousness || 'Não especificado'
    }));

    return {
      id: `fda_${index}`,
      safetyReportId: event.safetyreportid || 'N/A',
      drugName: primaryDrug?.medicinalproduct || primaryDrug?.openfda?.brand_name?.[0] || 'Medicamento não identificado',
      genericName: primaryDrug?.openfda?.generic_name?.[0] || 'N/A',
      reactions: adverseReactions,
      patientAge: event.patient?.patientonsetage || 'N/A',
      patientAgeUnit: event.patient?.patientonsetageunit || '',
      patientSex: getGenderDescription(event.patient?.patientsex),
      reportDate: event.receiptdate || 'N/A',
      country: event.occurcountry || 'N/A',
      serious: event.serious === '1' ? 'Sim' : 'Não',
      seriousnessReasons: getSeriousnessReasons(event)
    };
  });

  return {
    reactions: processedReactions,
    stats: getAdverseReactionsStats(results)
  };
};

/**
 * Função para obter descrição do resultado da reação
 * @param {string} outcome - Código do resultado
 * @returns {string} - Descrição do resultado
 */
const getOutcomeDescription = (outcome) => {
  const outcomes = {
    '1': 'Recuperado/Resolvido',
    '2': 'Recuperando/Resolvendo',
    '3': 'Não recuperado/Não resolvido',
    '4': 'Recuperado/Resolvido com sequelas',
    '5': 'Morte',
    '6': 'Desconhecido'
  };
  return outcomes[outcome] || 'Não especificado';
};

/**
 * Função para obter descrição do gênero
 * @param {string} sex - Código do gênero
 * @returns {string} - Descrição do gênero
 */
const getGenderDescription = (sex) => {
  const genders = {
    '1': 'Masculino',
    '2': 'Feminino',
    '0': 'Desconhecido'
  };
  return genders[sex] || 'Não especificado';
};

/**
 * Função para obter razões de seriedade
 * @param {Object} event - Evento adverso
 * @returns {Array} - Lista de razões de seriedade
 */
const getSeriousnessReasons = (event) => {
  const reasons = [];
  if (event.seriousnessdeath === '1') reasons.push('Morte');
  if (event.seriousnesslifethreatening === '1') reasons.push('Risco de vida');
  if (event.seriousnesshospitalization === '1') reasons.push('Hospitalização');
  if (event.seriousnessdisabling === '1') reasons.push('Incapacitação');
  if (event.seriousnesscongenitalanomali === '1') reasons.push('Anomalia congênita');
  if (event.seriousnessother === '1') reasons.push('Outro motivo grave');
  
  return reasons.length > 0 ? reasons : ['N/A'];
};

/**
 * Função para calcular estatísticas de reações adversas a partir dos dados locais
 * @param {Array} events - Array de eventos adversos
 * @returns {Object} - Estatísticas das reações
 */
const getAdverseReactionsStats = (events) => {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return { results: [], total: 0 };
  }

  const reactionCounts = {};
  let totalReactions = 0;

  // Contar todas as reações adversas
  events.forEach(event => {
    const reactions = event.patient?.reaction || [];
    reactions.forEach(reaction => {
      const term = reaction.reactionmeddrapt || 'Reação não especificada';
      reactionCounts[term] = (reactionCounts[term] || 0) + 1;
      totalReactions++;
    });
  });

  // Converter para array e ordenar por frequência
  const results = Object.entries(reactionCounts)
    .map(([term, count]) => ({
      term,
      count,
      percentage: ((count / totalReactions) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Limitar aos 10 mais frequentes

  return {
    results,
    total: events.length,
    totalReactions
  };
};

/**
 * Função para validar se um nome de medicamento é válido para busca
 * @param {string} drugName - Nome do medicamento
 * @returns {boolean} - Se o nome é válido
 */
export const isValidDrugName = (drugName) => {
  return drugName && 
         typeof drugName === 'string' && 
         drugName.trim().length >= 2 &&
         drugName.trim().length <= 100;
};

/**
 * Função para verificar se o resultado é relevante para o medicamento pesquisado
 * @param {Object} result - Resultado da API do FDA
 * @param {string} drugName - Nome do medicamento pesquisado
 * @returns {boolean} - Se o resultado é relevante
 */
const isRelevantResult = (result, drugName) => {
  if (!result || !drugName) return false;
  
  const searchTerm = drugName.toLowerCase().trim();
  
  // Função auxiliar para verificar correspondência flexível
  const isMatch = (text, searchTerm) => {
    if (!text) return false;
    const textLower = text.toLowerCase();
    
    // Correspondência exata
    if (textLower === searchTerm) return true;
    
    // Correspondência parcial (contém o termo)
    if (textLower.includes(searchTerm)) return true;
    
    // Correspondência de palavras individuais
    const searchWords = searchTerm.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    return searchWords.some(searchWord => 
      textWords.some(textWord => 
        textWord.includes(searchWord) || searchWord.includes(textWord)
      )
    );
  };
  
  // Para testes iniciais, aceitar qualquer resultado que tenha dados de medicamento
  // Isso nos ajudará a ver se a API está retornando dados
  if (result.patient && result.patient.drug) {
    const drugs = Array.isArray(result.patient.drug) ? result.patient.drug : [result.patient.drug];
    
    // Se não conseguirmos encontrar correspondência específica, aceitar qualquer resultado
    // para verificar se a API está funcionando
    let hasAnyDrugData = false;
    
    for (const drug of drugs) {
      // Verificar se há dados de medicamento
      if (drug.medicinalproduct || drug.activesubstancename || drug.openfda) {
        hasAnyDrugData = true;
        
        // Verificar correspondências específicas
        if (drug.medicinalproduct && isMatch(drug.medicinalproduct, searchTerm)) {
          return true;
        }
        
        if (drug.activesubstancename && isMatch(drug.activesubstancename, searchTerm)) {
          return true;
        }
        
        // Verificar campos harmonizados do openFDA
        if (drug.openfda) {
          // Nome genérico
          if (drug.openfda.generic_name && Array.isArray(drug.openfda.generic_name)) {
            if (drug.openfda.generic_name.some(name => isMatch(name, searchTerm))) {
              return true;
            }
          }
          
          // Nome da marca
          if (drug.openfda.brand_name && Array.isArray(drug.openfda.brand_name)) {
            if (drug.openfda.brand_name.some(name => isMatch(name, searchTerm))) {
              return true;
            }
          }
          
          // Substância
          if (drug.openfda.substance_name && Array.isArray(drug.openfda.substance_name)) {
            if (drug.openfda.substance_name.some(name => isMatch(name, searchTerm))) {
              return true;
            }
          }
        }
      }
    }
    
    // Para debug: aceitar qualquer resultado com dados de medicamento
    // Isso nos ajudará a ver se a API está retornando dados
    return hasAnyDrugData;
  }
  
  return false;
};

/**
 * Filtra eventos adversos que contêm a substância pesquisada com algoritmo otimizado
 * @param {Array} events - Lista de eventos adversos da FDA
 * @param {string} drugName - Nome da substância pesquisada
 * @returns {Array} - Eventos filtrados com maior cobertura
 */
const filterEventsByGenericName = (events, drugName, externalSynonyms = []) => {
  const normalizedTarget = normalizeDrugName(drugName);
  const synonyms = expandDrugSynonyms(drugName, externalSynonyms);
  const allVariations = synonyms.concat(synonyms.flatMap(synonym => generateNameVariations(synonym)));
  
  console.log(`🔍 Filtrando ${events.length} eventos com ${allVariations.length} variações:`, allVariations.slice(0, 10));
  
  const filteredEvents = events.filter(event => {
    if (!event.patient || !event.patient.drug || !Array.isArray(event.patient.drug)) {
      return false;
    }
    
    // Verificar se algum medicamento no evento contém a substância
    return event.patient.drug.some(drug => {
      // Função auxiliar para verificar correspondência flexível
      const checkFlexibleMatch = (value) => {
        if (!value || typeof value !== 'string') return false;
        const normalizedValue = normalizeDrugName(value);
        
        // Correspondência exata
        if (allVariations.some(variation => normalizedValue === variation)) {
          return true;
        }
        
        // Correspondência parcial (contém)
        if (allVariations.some(variation => 
          normalizedValue.includes(variation) || variation.includes(normalizedValue)
        )) {
          return true;
        }
        
        // Correspondência por palavras individuais
        const valueWords = normalizedValue.split(/\s+/);
        const hasWordMatch = allVariations.some(variation => {
          const variationWords = variation.split(/\s+/);
          return variationWords.some(varWord => 
            valueWords.some(valWord => 
              (varWord.length > 3 && valWord.includes(varWord)) ||
              (valWord.length > 3 && varWord.includes(valWord))
            )
          );
        });
        
        return hasWordMatch;
      };
      
      // Função auxiliar para verificar arrays com scoring
      const checkArrayMatch = (array) => {
        if (!Array.isArray(array)) return false;
        return array.some(item => checkFlexibleMatch(item));
      };
      
      let matchScore = 0;
      
      // PRIORIDADE ALTA: Campos openFDA harmonizados
      if (drug.openfda) {
        // Nome genérico (peso 10)
        if (checkArrayMatch(drug.openfda.generic_name)) {
          matchScore += 10;
        }
        
        // Nome comercial (peso 8)
        if (checkArrayMatch(drug.openfda.brand_name)) {
          matchScore += 8;
        }
        
        // Substância ativa (peso 9)
        if (checkArrayMatch(drug.openfda.substance_name)) {
          matchScore += 9;
        }
        
        // Ingrediente ativo (peso 7)
        if (checkArrayMatch(drug.openfda.active_ingredient)) {
          matchScore += 7;
        }
        
        // Fabricante (peso 2)
        if (checkArrayMatch(drug.openfda.manufacturer_name)) {
          matchScore += 2;
        }
        
        // Outros campos openFDA (peso 1 cada)
        if (checkArrayMatch(drug.openfda.product_ndc)) matchScore += 1;
        if (checkArrayMatch(drug.openfda.route)) matchScore += 1;
        if (checkArrayMatch(drug.openfda.dosage_form)) matchScore += 1;
      }
      
      // PRIORIDADE MÉDIA: Campos originais do FAERS
      // Produto medicinal (peso 8)
      if (checkFlexibleMatch(drug.medicinalproduct)) {
        matchScore += 8;
      }
      
      // Nome da substância ativa (peso 9)
      if (checkFlexibleMatch(drug.activesubstancename)) {
        matchScore += 9;
      }
      
      // Nome do medicamento (peso 6)
      if (checkFlexibleMatch(drug.drugname)) {
        matchScore += 6;
      }
      
      // PRIORIDADE BAIXA: Campos contextuais
      // Indicação terapêutica (peso 3)
      if (checkFlexibleMatch(drug.drugindication)) {
        matchScore += 3;
      }
      
      // Considerar relevante se score >= 3 (mais permissivo)
      return matchScore >= 3;
    });
  });
  
  console.log(`✅ Filtrados ${filteredEvents.length} de ${events.length} eventos relevantes`);
  
  // Se muito poucos resultados, tentar filtro mais permissivo
  if (filteredEvents.length < 5 && events.length > 10) {
    console.log('🔄 Aplicando filtro mais permissivo...');
    
    const permissiveEvents = events.filter(event => {
      if (!event.patient || !event.patient.drug || !Array.isArray(event.patient.drug)) {
        return false;
      }
      
      return event.patient.drug.some(drug => {
        // Busca mais simples - qualquer correspondência parcial
        const simpleMatch = (value) => {
          if (!value || typeof value !== 'string') return false;
          const normalizedValue = normalizeDrugName(value);
          return allVariations.some(variation => 
            normalizedValue.includes(variation) || variation.includes(normalizedValue)
          );
        };
        
        // Verificar campos principais apenas
        return simpleMatch(drug.medicinalproduct) ||
               simpleMatch(drug.activesubstancename) ||
               simpleMatch(drug.drugname) ||
               (drug.openfda && (
                 (drug.openfda.generic_name && drug.openfda.generic_name.some(simpleMatch)) ||
                 (drug.openfda.brand_name && drug.openfda.brand_name.some(simpleMatch)) ||
                 (drug.openfda.substance_name && drug.openfda.substance_name.some(simpleMatch))
               ));
      });
    });
    
    if (permissiveEvents.length > filteredEvents.length) {
      console.log(`🎯 Filtro permissivo encontrou ${permissiveEvents.length} eventos adicionais`);
      return permissiveEvents;
    }
  }
  
  return filteredEvents;
};

/**
 * Processa eventos adversos que contêm a substância genérica
 * @param {Array} events - Lista de eventos adversos filtrados
 * @param {string} genericName - Nome genérico da substância pesquisada
 * @returns {Object} - Dados processados agrupados por medicamento
 */
/**
 * Processa eventos adversos individuais sem agrupamento
 * @param {Array} events - Eventos da API FDA
 * @param {string} genericName - Nome genérico do medicamento
 * @returns {Object} - Objeto com eventos individuais processados
 */
const processIndividualAdverseReactions = (events, genericName) => {
  const individualReactions = [];
  const normalizedGenericName = genericName.toLowerCase().trim();
  
  events.forEach((event, index) => {
    if (!event.patient || !event.patient.drug || !Array.isArray(event.patient.drug)) {
      return;
    }
    
    // Encontrar medicamentos que contêm a substância genérica
    const relevantDrugs = event.patient.drug.filter(drug => {
      if (!drug.openfda) return false;
      
      const hasGenericName = drug.openfda.generic_name && 
        Array.isArray(drug.openfda.generic_name) &&
        drug.openfda.generic_name.some(name => 
          name.toLowerCase().includes(normalizedGenericName)
        );
        
      const hasSubstanceName = drug.openfda.substance_name && 
        Array.isArray(drug.openfda.substance_name) &&
        drug.openfda.substance_name.some(name => 
          name.toLowerCase().includes(normalizedGenericName)
        );
        
      return hasGenericName || hasSubstanceName;
    });
    
    relevantDrugs.forEach((drug, drugIndex) => {
      const brandName = drug.openfda?.brand_name?.[0] || 
                       drug.medicinalproduct || 
                       'Medicamento não identificado';
      
      // Processar reações adversas do evento
      const reactions = [];
      if (event.patient.reaction && Array.isArray(event.patient.reaction)) {
        event.patient.reaction.forEach(reaction => {
          reactions.push({
            term: reaction.reactionmeddrapt || 'Reação não especificada',
            outcome: getOutcomeDescription(reaction.reactionoutcome),
            severity: reaction.reactionseriousness || 'Não especificado'
          });
        });
      }
      
      individualReactions.push({
        id: `individual_${index}_${drugIndex}`,
        medicationName: brandName,
        genericName: drug.openfda?.generic_name?.[0] || genericName,
        manufacturer: drug.openfda?.manufacturer_name?.[0] || 'N/A',
        totalReports: 1, // Cada evento individual conta como 1 relato
        reactions: reactions,
        safetyReportId: event.safetyreportid || 'N/A',
        patientAge: event.patient?.patientonsetage || 'N/A',
        patientAgeUnit: event.patient?.patientonsetageunit || '',
        patientSex: getGenderDescription(event.patient?.patientsex),
        reportDate: event.receiptdate || 'N/A',
        country: event.occurcountry || 'N/A',
        serious: event.serious === '1' ? 'Sim' : 'Não'
      });
    });
  });
  
  return {
    reactions: individualReactions,
    stats: getAdverseReactionsStats(events)
  };
};

const processAdverseReactionsByGeneric = (events, genericName) => {
  const medicationGroups = new Map();
  const normalizedGenericName = genericName.toLowerCase().trim();
  
  events.forEach((event, index) => {
    if (!event.patient || !event.patient.drug || !Array.isArray(event.patient.drug)) {
      return;
    }
    
    // Encontrar medicamentos que contêm a substância genérica
    const relevantDrugs = event.patient.drug.filter(drug => {
      if (!drug.openfda) return false;
      
      // Verificar se contém a substância genérica
      const hasGenericName = drug.openfda.generic_name && 
        Array.isArray(drug.openfda.generic_name) &&
        drug.openfda.generic_name.some(name => 
          name.toLowerCase().includes(normalizedGenericName)
        );
        
      const hasSubstanceName = drug.openfda.substance_name && 
        Array.isArray(drug.openfda.substance_name) &&
        drug.openfda.substance_name.some(name => 
          name.toLowerCase().includes(normalizedGenericName)
        );
        
      return hasGenericName || hasSubstanceName;
    });
    
    relevantDrugs.forEach(drug => {
      // Identificar o medicamento comercial
      const brandName = drug.openfda?.brand_name?.[0] || 
                       drug.medicinalproduct || 
                       'Medicamento não identificado';
      
      const medicationKey = brandName.toLowerCase();
      
      if (!medicationGroups.has(medicationKey)) {
        medicationGroups.set(medicationKey, {
          brandName: brandName,
          genericName: drug.openfda?.generic_name?.[0] || genericName,
          manufacturer: drug.openfda?.manufacturer_name?.[0] || 'N/A',
          events: [],
          totalReports: 0,
          reactions: new Map()
        });
      }
      
      const medication = medicationGroups.get(medicationKey);
      
      // Processar reações adversas do evento
      if (event.patient.reaction && Array.isArray(event.patient.reaction)) {
        event.patient.reaction.forEach(reaction => {
          const reactionTerm = reaction.reactionmeddrapt || 'Reação não especificada';
          const reactionKey = reactionTerm.toLowerCase();
          
          if (!medication.reactions.has(reactionKey)) {
            medication.reactions.set(reactionKey, {
              term: reactionTerm,
              count: 0,
              outcomes: new Map(),
              severity: reaction.reactionseriousness || 'Não especificado'
            });
          }
          
          const reactionData = medication.reactions.get(reactionKey);
          reactionData.count++;
          
          const outcome = getOutcomeDescription(reaction.reactionoutcome);
          const currentCount = reactionData.outcomes.get(outcome) || 0;
          reactionData.outcomes.set(outcome, currentCount + 1);
        });
      }
      
      // Adicionar informações do evento
      medication.events.push({
        id: `fda_${index}`,
        safetyReportId: event.safetyreportid || 'N/A',
        patientAge: event.patient?.patientonsetage || 'N/A',
        patientAgeUnit: event.patient?.patientonsetageunit || '',
        patientSex: getGenderDescription(event.patient?.patientsex),
        reportDate: event.receiptdate || 'N/A',
        country: event.occurcountry || 'N/A',
        serious: event.serious === '1' ? 'Sim' : 'Não'
      });
      
      medication.totalReports++;
    });
  });
  
  // Converter para formato final
  const processedReactions = Array.from(medicationGroups.values()).map(medication => {
    const topReactions = Array.from(medication.reactions.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 reações mais comuns
      .map(reaction => ({
        term: reaction.term,
        count: reaction.count,
        outcomes: Array.from(reaction.outcomes.entries()).map(([outcome, count]) => ({
          outcome,
          count
        })),
        severity: reaction.severity
      }));
    
    return {
      id: `med_${medication.brandName.replace(/\s+/g, '_').toLowerCase()}`,
      medicationName: medication.brandName,
      genericName: medication.genericName,
      manufacturer: medication.manufacturer,
      totalReports: medication.totalReports,
      reactions: topReactions,
      sampleEvents: medication.events.slice(0, 5) // Amostra de 5 eventos
    };
  });
  
  return {
    reactions: processedReactions,
    stats: getAdverseReactionsStats(events)
  };
};