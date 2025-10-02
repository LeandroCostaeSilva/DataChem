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
  'amoxicillin': ['amoxicilina', 'amoxil', 'trimox']
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
const expandDrugSynonyms = (drugName) => {
  const normalizedName = normalizeDrugName(drugName);
  const synonyms = new Set([normalizedName]);
  
  // Adiciona sinônimos diretos
  if (DRUG_SYNONYMS[normalizedName]) {
    DRUG_SYNONYMS[normalizedName].forEach(synonym => {
      synonyms.add(normalizeDrugName(synonym));
    });
  }
  
  // Busca por sinônimos reversos (quando o nome está na lista de sinônimos de outro)
  Object.entries(DRUG_SYNONYMS).forEach(([key, synonymList]) => {
    if (synonymList.some(synonym => normalizeDrugName(synonym) === normalizedName)) {
      synonyms.add(key);
      synonymList.forEach(synonym => {
        synonyms.add(normalizeDrugName(synonym));
      });
    }
  });
  
  // Adiciona variações comuns
  const variations = generateNameVariations(normalizedName);
  variations.forEach(variation => synonyms.add(variation));
  
  return Array.from(synonyms).filter(name => name.length > 1);
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
 * Cria uma query de busca expandida incluindo sinônimos
 * @param {string} drugName - Nome do medicamento original
 * @returns {string} - Query expandida para a API FDA
 */
const createExpandedSearchQuery = (drugName) => {
  const synonyms = expandDrugSynonyms(drugName);
  
  console.log(`🔍 Expandindo busca para "${drugName}":`, synonyms);
  
  // Cria queries para diferentes campos da API FDA
  // Campos openFDA harmonizados (mais confiáveis)
  const genericQueries = synonyms.map(synonym => 
    `patient.drug.openfda.generic_name:"${synonym}"`
  );
  
  const brandQueries = synonyms.map(synonym => 
    `patient.drug.openfda.brand_name:"${synonym}"`
  );
  
  const substanceQueries = synonyms.map(synonym => 
    `patient.drug.openfda.substance_name:"${synonym}"`
  );
  
  // Campos originais do FAERS (maior cobertura)
  const medicinalQueries = synonyms.map(synonym => 
    `patient.drug.medicinalproduct:"${synonym}"`
  );
  
  const activeSubstanceQueries = synonyms.map(synonym => 
    `patient.drug.activesubstancename:"${synonym}"`
  );
  
  // Campos adicionais para maior cobertura
  const drugNameQueries = synonyms.map(synonym => 
    `patient.drug.drugname:"${synonym}"`
  );
  
  // Busca por indicações (pode capturar medicamentos por uso terapêutico)
  const indicationQueries = synonyms.map(synonym => 
    `patient.drug.drugindication:"${synonym}"`
  );
  
  // Busca por fabricante (útil para nomes comerciais específicos)
  const manufacturerQueries = synonyms.map(synonym => 
    `patient.drug.openfda.manufacturer_name:"${synonym}"`
  );
  
  // Combina todas as queries com OR
  const allQueries = [
    ...genericQueries,
    ...brandQueries,
    ...substanceQueries,
    ...medicinalQueries,
    ...activeSubstanceQueries,
    ...drugNameQueries,
    ...indicationQueries,
    ...manufacturerQueries
  ];
  
  const expandedQuery = `(${allQueries.join(' OR ')})`;
  
  console.log(`📊 Query expandida gerada com ${allQueries.length} termos de busca`);
  
  return expandedQuery;
};

/**
 * Função para buscar reações adversas de um medicamento/composto no FDA
 * @param {string} drugName - Nome do medicamento/composto (nome genérico/químico)
 * @param {number} limit - Número máximo de resultados (padrão: 10, máximo: 100)
 * @returns {Promise<Object>} - Dados das reações adversas filtradas por nome genérico
 */
export const getAdverseReactions = async (drugName, limit = 10) => {
  try {
    console.log('🔍 FDA Service - Busca com sinônimos iniciada para:', drugName, 'timestamp:', new Date().toISOString());
    
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

    // Cria busca expandida incluindo sinônimos
    const expandedQuery = createExpandedSearchQuery(drugName);
    const url = `${FDA_BASE_URL}/drug/event.json?search=${encodeURIComponent(expandedQuery)}&limit=${Math.min(limit, 100)}`;
    
    console.log('🌐 Buscando eventos adversos com sinônimos para:', drugName);
    console.log('🌐 Query expandida:', expandedQuery);
    console.log('🌐 URL da busca:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Busca por nome genérico falhou. Status:', response.status, 'Erro:', errorText);
      console.error('❌ URL da busca:', url);
      
      if (response.status === 404) {
        return {
          success: true,
          results: [],
          meta: {
            total: 0,
            disclaimer: `Nenhum evento adverso encontrado para a substância genérica "${drugName}"`
          },
          stats: getAdverseReactionsStats([]),
          message: `Nenhum evento adverso encontrado para a substância genérica "${drugName}"`
        };
      }
      
      throw new Error(`Erro na API do FDA: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da FDA API para', drugName, ':', data);
    
    if (!data.results || data.results.length === 0) {
      return {
        success: true,
        results: [],
        meta: {
          total: 0,
          disclaimer: `Nenhum evento adverso encontrado para a substância genérica "${drugName}"`
        },
        stats: getAdverseReactionsStats([]),
        message: `Nenhum evento adverso encontrado para a substância genérica "${drugName}"`
      };
    }
    
    // Filtrar eventos que realmente contêm a substância genérica pesquisada
    const filteredResults = filterEventsByGenericName(data.results, drugName);
    console.log(`✅ Filtrados ${filteredResults.length} de ${data.results.length} eventos que contêm a substância "${drugName}"`);
    
    if (filteredResults.length === 0) {
      return {
        success: true,
        results: [],
        meta: {
          total: 0,
          disclaimer: `Nenhum medicamento encontrado contendo a substância genérica "${drugName}"`
        },
        stats: getAdverseReactionsStats([]),
        message: `Nenhum medicamento encontrado contendo a substância genérica "${drugName}"`
      };
    }
    
    // Usar processamento individual para mostrar cada evento separadamente
    const processedData = processIndividualAdverseReactions(filteredResults, drugName);
    
    return {
      success: true,
      results: processedData.reactions,
      meta: {
        total: filteredResults.length,
        disclaimer: 'Dados fornecidos pela API openFDA - Filtrados por substância genérica'
      },
      stats: processedData.stats,
      message: `Encontrados ${filteredResults.length} eventos adversos para medicamentos contendo "${drugName}"`
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
 * Filtra eventos adversos que realmente contêm a substância genérica pesquisada
 * @param {Array} events - Lista de eventos adversos da FDA
 * @param {string} genericName - Nome genérico da substância pesquisada
 * @returns {Array} - Eventos filtrados
 */
const filterEventsByGenericName = (events, genericName) => {
  const normalizedTarget = normalizeDrugName(genericName);
  const synonyms = expandDrugSynonyms(genericName);
  const allVariations = synonyms.concat(synonyms.flatMap(synonym => generateNameVariations(synonym)));
  
  console.log('🔍 Filtrando eventos com sinônimos:', allVariations);
  
  return events.filter(event => {
    if (!event.patient || !event.patient.drug || !Array.isArray(event.patient.drug)) {
      return false;
    }
    
    // Verificar se algum medicamento no evento contém a substância genérica
    return event.patient.drug.some(drug => {
      // Função auxiliar para verificar correspondência
      const checkMatch = (value) => {
        if (!value) return false;
        const normalizedValue = normalizeDrugName(value);
        return allVariations.some(variation => 
          normalizedValue.includes(variation) || 
          variation.includes(normalizedValue)
        );
      };
      
      // Função auxiliar para verificar arrays
      const checkArrayMatch = (array) => {
        if (!Array.isArray(array)) return false;
        return array.some(item => checkMatch(item));
      };
      
      // Verificar campos openFDA harmonizados (mais confiáveis)
      if (drug.openfda) {
        // Verificar nome genérico
        if (checkArrayMatch(drug.openfda.generic_name)) return true;
        
        // Verificar nome comercial
        if (checkArrayMatch(drug.openfda.brand_name)) return true;
        
        // Verificar substâncias ativas
        if (checkArrayMatch(drug.openfda.substance_name)) return true;
        
        // Verificar fabricante (pode conter nome do medicamento)
        if (checkArrayMatch(drug.openfda.manufacturer_name)) return true;
      }
      
      // Verificar campos originais do FAERS (maior cobertura)
      // Produto medicinal
      if (checkMatch(drug.medicinalproduct)) return true;
      
      // Nome da substância ativa
      if (checkMatch(drug.activesubstancename)) return true;
      
      // Nome do medicamento
      if (checkMatch(drug.drugname)) return true;
      
      // Indicação do medicamento (pode ajudar a identificar o medicamento)
      if (checkMatch(drug.drugindication)) return true;
      
      return false;
    });
  });
};

/**
 * Processa eventos adversos agrupando por medicamento comercial que contém a substância genérica
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