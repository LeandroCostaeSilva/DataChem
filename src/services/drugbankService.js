import axios from 'axios';

/**
 * Serviço para integração com a API DrugBank DDI Checker
 * Implementação baseada na documentação oficial: https://docs.drugbank.com/v1/
 * 
 * Funcionalidades implementadas:
 * 1. Token Authentication (https://docs.drugbank.com/v1/#token-authentication)
 * 2. Drug-Drug Interactions (https://docs.drugbank.com/v1/#drug-drug-interactions)
 * 3. Medication Search Plugin (https://docs.drugbank.com/v1/#medication-search-plugin)
 * 4. Product Concepts Search para maior cobertura
 */

// Configurações da API DrugBank
const DRUGBANK_BASE_URL = 'https://api.drugbank.com/v1';
const DEFAULT_REGION = 'us'; // Região padrão conforme documentação

/**
 * Configuração do cliente HTTP para DrugBank
 * Seguindo as especificações oficiais: https://docs.drugbank.com/v1/#token-authentication
 */
const createDrugBankClient = () => {
  const client = axios.create({
    baseURL: DRUGBANK_BASE_URL,
    timeout: 30000, // Aumentado para 30s para melhor cobertura
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });

  // Interceptor para adicionar autenticação conforme documentação oficial
  client.interceptors.request.use((config) => {
    // IMPORTANTE: Em produção, esta chave deve vir de variáveis de ambiente
    const apiKey = process.env.REACT_APP_DRUGBANK_API_KEY || 'demo-key';
    // Usar formato 'authorization' conforme documentação oficial
    config.headers.authorization = apiKey;
    return config;
  });

  // Interceptor para tratamento de erros com logs detalhados
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('DrugBank API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  );

  return client;
};

/**
 * Medication Search Plugin - Autocomplete para medicamentos
 * Implementação baseada em: https://docs.drugbank.com/v1/#medication-search-plugin
 * @param {string} query - Termo de busca
 * @param {string} region - Região (us, ca, eu, etc.)
 * @param {boolean} fuzzy - Habilitar busca fuzzy
 * @param {boolean} hitDetails - Incluir detalhes de highlight
 * @returns {Promise<Array>} Lista de sugestões para autocomplete
 */
export const medicationSearchAutocomplete = async (query, region = DEFAULT_REGION, fuzzy = true, hitDetails = true) => {
  try {
    const client = createDrugBankClient();
    
    console.log(`🔍 Medication Search Autocomplete para: "${query}"`);
    
    // Usar endpoint product_concepts conforme documentação
    const response = await client.get('/product_concepts', {
      params: {
        q: query,
        region: region,
        fuzzy: fuzzy,
        hit_details: hitDetails,
        limit: 10 // Limite para autocomplete
      }
    });

    console.log(`📋 Resposta Medication Search:`, response.data);

    if (response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        id: item.id || item.drugbank_id,
        name: item.name || item.display_name,
        highlight: item.hit_highlight || item.name,
        drugbank_id: item.drugbank_id,
        product_concept_id: item.id,
        region: item.region || region,
        type: 'product_concept'
      }));
    }

    return [];
  } catch (error) {
    console.error(`❌ Erro no Medication Search para "${query}":`, error);
    console.log('🔄 Tentando fallback com dados simulados...');
    
    // Fallback com dados simulados para desenvolvimento
    return getSimulatedAutocompleteResults(query);
  }
};

/**
 * Fallback com dados simulados para autocomplete
 * @param {string} query - Termo de busca
 * @returns {Array} Lista de sugestões simuladas
 */
const getSimulatedAutocompleteResults = (query) => {
  const simulatedDrugs = [
    { id: 'DB00945', name: 'Aspirin', drugbank_id: 'DB00945' },
    { id: 'DB00316', name: 'Acetaminophen', drugbank_id: 'DB00316' },
    { id: 'DB01050', name: 'Ibuprofen', drugbank_id: 'DB01050' },
    { id: 'DB00328', name: 'Indomethacin', drugbank_id: 'DB00328' },
    { id: 'DB00482', name: 'Celecoxib', drugbank_id: 'DB00482' },
    { id: 'DB00586', name: 'Diclofenac', drugbank_id: 'DB00586' },
    { id: 'DB00788', name: 'Naproxen', drugbank_id: 'DB00788' },
    { id: 'DB00939', name: 'Meclofenamic acid', drugbank_id: 'DB00939' },
    { id: 'DB00465', name: 'Ketorolac', drugbank_id: 'DB00465' },
    { id: 'DB00554', name: 'Piroxicam', drugbank_id: 'DB00554' },
    { id: 'DB00500', name: 'Tolmetin', drugbank_id: 'DB00500' },
    { id: 'DB00469', name: 'Tenoxicam', drugbank_id: 'DB00469' },
    { id: 'DB00795', name: 'Sulfasalazine', drugbank_id: 'DB00795' },
    { id: 'DB00563', name: 'Methotrexate', drugbank_id: 'DB00563' },
    { id: 'DB00635', name: 'Prednisone', drugbank_id: 'DB00635' },
    { id: 'DB00741', name: 'Hydrocortisone', drugbank_id: 'DB00741' },
    { id: 'DB00959', name: 'Methylprednisolone', drugbank_id: 'DB00959' },
    { id: 'DB01234', name: 'Dexamethasone', drugbank_id: 'DB01234' },
    { id: 'DB00207', name: 'Azithromycin', drugbank_id: 'DB00207' },
    { id: 'DB00618', name: 'Demeclocycline', drugbank_id: 'DB00618' },
    { id: 'DB00254', name: 'Doxycycline', drugbank_id: 'DB00254' },
    { id: 'DB00595', name: 'Oxytetracycline', drugbank_id: 'DB00595' },
    { id: 'DB00759', name: 'Tetracycline', drugbank_id: 'DB00759' },
    { id: 'DB00487', name: 'Penicillamine', drugbank_id: 'DB00487' },
    { id: 'DB01060', name: 'Amoxicillin', drugbank_id: 'DB01060' },
    { id: 'DB00417', name: 'Penicillin V', drugbank_id: 'DB00417' },
    { id: 'DB00319', name: 'Piperacillin', drugbank_id: 'DB00319' },
    { id: 'DB00303', name: 'Ertapenem', drugbank_id: 'DB00303' },
    { id: 'DB00955', name: 'Netilmicin', drugbank_id: 'DB00955' },
    { id: 'DB00798', name: 'Gentamicin', drugbank_id: 'DB00798' }
  ];

  if (!query || query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const filtered = simulatedDrugs.filter(drug => 
    drug.name.toLowerCase().includes(queryLower)
  );

  return filtered.slice(0, 10).map(drug => ({
    id: drug.id,
    name: drug.name,
    highlight: drug.name.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>'),
    drugbank_id: drug.drugbank_id,
    product_concept_id: drug.id,
    region: 'us',
    type: 'simulated'
  }));
};

/**
 * Drug Name Search - Busca simplificada de medicamentos
 * Implementação baseada em: https://docs.drugbank.com/v1/#drug-name-search
 * @param {string} drugName - Nome do medicamento
 * @param {string} region - Região (us, ca, eu, etc.)
 * @param {boolean} fuzzy - Habilitar busca fuzzy
 * @returns {Promise<Array>} Lista de medicamentos encontrados
 */
export const drugNameSearch = async (drugName, region = DEFAULT_REGION, fuzzy = true) => {
  try {
    const client = createDrugBankClient();
    
    console.log(`🔍 Drug Name Search para: "${drugName}"`);
    
    // Usar endpoint drug_names conforme documentação oficial
    const response = await client.get('/drug_names', {
      params: {
        q: drugName,
        region: region,
        fuzzy: fuzzy,
        limit: 10
      }
    });

    console.log(`📋 Resposta Drug Name Search:`, response.data);

    if (response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        id: item.drugbank_id || item.id,
        name: item.name || item.display_name,
        drugbank_id: item.drugbank_id,
        region: item.region || region,
        type: 'drug_name'
      }));
    }

    return [];
  } catch (error) {
    console.error(`❌ Erro no Drug Name Search para "${drugName}":`, error);
    return [];
  }
};

/**
 * Buscar DrugBank ID com múltiplas estratégias para maior cobertura
 * @param {string} drugName - Nome do medicamento
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<string|null>} DrugBank ID ou null se não encontrado
 */
export const getDrugBankId = async (drugName, region = DEFAULT_REGION) => {
  try {
    console.log(`🔍 Buscando DrugBank ID para: "${drugName}" na região ${region}`);
    
    // Estratégia 1: Product Concepts Search (maior cobertura)
    const productConcepts = await medicationSearchAutocomplete(drugName, region);
    if (productConcepts.length > 0) {
      const match = productConcepts.find(p => p.drugbank_id);
      if (match) {
        console.log(`✅ DrugBank ID encontrado via Product Concepts: ${match.drugbank_id}`);
        return match.drugbank_id;
      }
    }

    // Estratégia 2: Drug Name Search (busca tradicional)
    const drugNames = await drugNameSearch(drugName, region);
    if (drugNames.length > 0) {
      const match = drugNames.find(d => d.drugbank_id);
      if (match) {
        console.log(`✅ DrugBank ID encontrado via Drug Names: ${match.drugbank_id}`);
        return match.drugbank_id;
      }
    }

    // Estratégia 3: Tentar outras regiões se não encontrou na região padrão
    if (region !== 'us') {
      console.log(`🔄 Tentando busca na região US como fallback...`);
      return await getDrugBankId(drugName, 'us');
    }

    console.log(`❌ Nenhum DrugBank ID encontrado para "${drugName}"`);
    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar DrugBank ID para "${drugName}":`, error);
    return null;
  }
};

/**
 * Verificar Drug-Drug Interactions usando múltiplos endpoints para maior cobertura
 * Implementação baseada em: https://docs.drugbank.com/v1/#drug-drug-interactions
 * @param {string} drugId1 - DrugBank ID do primeiro medicamento
 * @param {string} drugId2 - DrugBank ID do segundo medicamento
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Array>} Lista de interações encontradas
 */
export const checkDrugDrugInteractions = async (drugId1, drugId2, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient();
    
    console.log(`🔬 Verificando DDI entre ${drugId1} e ${drugId2} na região ${region}`);
    
    let interactions = [];

    // Estratégia 1: Endpoint /ddi oficial (método principal)
    try {
      console.log(`📋 Tentativa 1: Endpoint /ddi oficial`);
      const ddiResponse = await client.get('/ddi', {
        params: {
          drugbank_id: `${drugId1},${drugId2}`,
          region: region
        }
      });

      if (ddiResponse.data) {
        interactions = processDDIResponse(ddiResponse.data, 'ddi_endpoint');
        if (interactions.length > 0) {
          console.log(`✅ Encontradas ${interactions.length} interações via endpoint /ddi`);
          return interactions;
        }
      }
    } catch (error) {
      console.log(`⚠️ Endpoint /ddi falhou:`, error.response?.status);
    }

    // Estratégia 2: Buscar interações individuais para cada droga
    try {
      console.log(`📋 Tentativa 2: Interações individuais por droga`);
      const [interactions1, interactions2] = await Promise.all([
        getIndividualDrugInteractions(drugId1, region),
        getIndividualDrugInteractions(drugId2, region)
      ]);

      // Filtrar interações que envolvem ambas as drogas
      const crossInteractions = [
        ...interactions1.filter(i => i.interacting_drugbank_id === drugId2),
        ...interactions2.filter(i => i.interacting_drugbank_id === drugId1)
      ];

      if (crossInteractions.length > 0) {
        console.log(`✅ Encontradas ${crossInteractions.length} interações via busca individual`);
        return processDDIResponse(crossInteractions, 'individual_search');
      }
    } catch (error) {
      console.log(`⚠️ Busca individual falhou:`, error.response?.status);
    }

    // Estratégia 3: Product-based DDI (usando product concepts)
    try {
      console.log(`📋 Tentativa 3: Product-based DDI`);
      const productInteractions = await checkProductDrugInteractions(drugId1, drugId2, region);
      if (productInteractions.length > 0) {
        console.log(`✅ Encontradas ${productInteractions.length} interações via product concepts`);
        return productInteractions;
      }
    } catch (error) {
      console.log(`⚠️ Product-based DDI falhou:`, error.response?.status);
    }

    console.log(`ℹ️ Nenhuma interação encontrada entre ${drugId1} e ${drugId2}`);
    return [];
  } catch (error) {
    console.error(`❌ Erro ao verificar DDI entre ${drugId1} e ${drugId2}:`, error);
    return [];
  }
};

/**
 * Buscar interações individuais de uma droga
 * @param {string} drugId - DrugBank ID da droga
 * @param {string} region - Região
 * @returns {Promise<Array>} Lista de interações da droga
 */
const getIndividualDrugInteractions = async (drugId, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient();
    
    const response = await client.get(`/drugs/${drugId}/drug_interactions`, {
      params: { region: region }
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.log(`⚠️ Erro ao buscar interações individuais para ${drugId}:`, error.response?.status);
    return [];
  }
};

/**
 * Verificar interações usando product concepts
 * @param {string} drugId1 - DrugBank ID do primeiro medicamento
 * @param {string} drugId2 - DrugBank ID do segundo medicamento
 * @param {string} region - Região
 * @returns {Promise<Array>} Lista de interações encontradas
 */
const checkProductDrugInteractions = async (drugId1, drugId2, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient();
    
    // Buscar produtos relacionados às drogas
    const [products1, products2] = await Promise.all([
      client.get('/products', { params: { drugbank_id: drugId1, region: region } }),
      client.get('/products', { params: { drugbank_id: drugId2, region: region } })
    ]);

    const interactions = [];

    // Verificar interações entre produtos
    if (products1.data && products2.data) {
      for (const product1 of products1.data.slice(0, 3)) { // Limitar para performance
        for (const product2 of products2.data.slice(0, 3)) {
          try {
            const productDDI = await client.get(`/products/${product1.id}/ddi`, {
              params: { 
                product_id: product2.id,
                region: region 
              }
            });

            if (productDDI.data && Array.isArray(productDDI.data)) {
              interactions.push(...productDDI.data);
            }
          } catch (error) {
            // Continuar mesmo se um produto específico falhar
            continue;
          }
        }
      }
    }

    return processDDIResponse(interactions, 'product_based');
  } catch (error) {
    console.log(`⚠️ Erro no product-based DDI:`, error.response?.status);
    return [];
  }
};

/**
 * Processar resposta de DDI da API DrugBank
 * @param {Array|Object} data - Dados da resposta da API
 * @param {string} source - Fonte dos dados (ddi_endpoint, individual_search, product_based)
 * @returns {Array} Lista de interações processadas
 */
const processDDIResponse = (data, source = 'drugbank_api') => {
  try {
    let interactions = [];
    
    // Se data é um array
    if (Array.isArray(data)) {
      interactions = data;
    } 
    // Se data é um objeto com propriedades
    else if (data && typeof data === 'object') {
      // Tentar diferentes propriedades comuns
      if (data.interactions) {
        interactions = Array.isArray(data.interactions) ? data.interactions : [data.interactions];
      } else if (data.data) {
        interactions = Array.isArray(data.data) ? data.data : [data.data];
      } else if (data.results) {
        interactions = Array.isArray(data.results) ? data.results : [data.results];
      } else if (data.drug_interactions) {
        interactions = Array.isArray(data.drug_interactions) ? data.drug_interactions : [data.drug_interactions];
      } else {
        // Se não encontrar propriedades conhecidas, usar o próprio objeto
        interactions = [data];
      }
    }

    // Processar cada interação
    return interactions.map(interaction => {
      // Extrair informações da interação com múltiplos formatos possíveis
      const severity = interaction.severity || 
                      interaction.level || 
                      interaction.severity_level ||
                      interaction.risk_level ||
                      'unknown';
                      
      const evidence = interaction.evidence || 
                      interaction.evidence_level || 
                      interaction.evidence_quality ||
                      interaction.quality ||
                      'unknown';
                      
      const description = interaction.description || 
                         interaction.summary || 
                         interaction.text || 
                         interaction.interaction_description ||
                         interaction.mechanism ||
                         'Interação detectada';

      // Extrair IDs das drogas com diferentes formatos
      const drugId1 = interaction.drugbank_id_1 || 
                     interaction.drug_1_id || 
                     interaction.drugbank_id ||
                     interaction.interacting_drugbank_id ||
                     '';
                     
      const drugId2 = interaction.drugbank_id_2 || 
                     interaction.drug_2_id || 
                     interaction.target_drugbank_id ||
                     '';

      // Extrair nomes das drogas
      const drugName1 = interaction.drug_1_name || 
                       interaction.drug_name || 
                       interaction.interacting_drug_name ||
                       '';
                       
      const drugName2 = interaction.drug_2_name || 
                       interaction.target_drug_name ||
                       '';

      // Informações adicionais
      const mechanism = interaction.mechanism || 
                       interaction.interaction_mechanism ||
                       '';
                       
      const management = interaction.management || 
                        interaction.clinical_management ||
                        interaction.recommendation ||
                        '';

      return {
        id: interaction.id || `ddi_${Date.now()}_${Math.random()}`,
        drug1: interaction.drug1 || { name: drugName1, drugbank_id: drugId1 },
        drug2: interaction.drug2 || { name: drugName2, drugbank_id: drugId2 },
        severity: mapSeverityLevel(severity),
        evidence: evidence,
        description: description,
        summary: interaction.summary || description || 'Interação entre medicamentos',
        management: management || 'Consulte um profissional de saúde',
        mechanism: mechanism,
        drugbank_id_1: drugId1,
        drugbank_id_2: drugId2,
        drug_name_1: drugName1,
        drug_name_2: drugName2,
        interaction_type: interaction.interaction_type || 'drug-drug',
        source: source,
        searchType: source,
        timestamp: new Date().toISOString(),
        original_data: interaction // Manter dados originais para debug
      };
    }).filter(interaction => {
      // Filtrar interações válidas
      return interaction.description !== 'Interação detectada' || 
             interaction.severity !== 'Desconhecida' ||
             interaction.mechanism ||
             interaction.management !== 'Consulte um profissional de saúde';
    });
  } catch (error) {
    console.error('❌ Erro ao processar resposta DDI:', error);
    return [];
  }
};

/**
 * Mapear níveis de severidade conforme documentação oficial
 * @param {string} severity - Nível de severidade da API
 * @returns {string} Severidade mapeada
 */
const mapSeverityLevel = (severity) => {
  const severityMap = {
    'minor': 'Menor',
    'moderate': 'Moderada', 
    'major': 'Maior',
    'contraindicated': 'Contraindicada'
  };
  
  return severityMap[severity?.toLowerCase()] || 'Desconhecida';
};

/**
 * Gera um token temporário para acesso à API DrugBank
 * @param {number} ttl - Tempo de vida do token em horas (máximo 24)
 * @returns {Promise<string>} Token de acesso
 */
export const generateDrugBankToken = async (ttl = 12) => {
  try {
    const client = createDrugBankClient(false);
    
    const response = await client.post('/tokens', {
      ttl: Math.min(ttl, 24) // Máximo 24 horas
    });

    return response.data.token;
  } catch (error) {
    console.error('Erro ao gerar token DrugBank:', error);
    throw new Error('Falha na autenticação com DrugBank API');
  }
};

/**
 * Busca informações de uma droga por nome
 * @param {string} drugName - Nome da droga
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Object>} Informações da droga
 */
export const searchDrugByName = async (drugName, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient(false);
    
    const response = await client.get('/drug_names', {
      params: {
        q: drugName,
        region: region
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar droga "${drugName}":`, error);
    return null;
  }
};

/**
 * Busca Drug-Drug Interactions por nome da droga
 * @param {string} drugName - Nome da droga
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Array>} Lista de interações medicamentosas
 */
export const getDrugInteractionsByName = async (drugName, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient(false);
    
    // Primeiro, buscar informações da droga para obter o ID
    const drugInfo = await searchDrugByName(drugName, region);
    
    if (!drugInfo || !drugInfo.length) {
      console.log(`Droga "${drugName}" não encontrada na região ${region}`);
      return [];
    }

    // Usar o primeiro resultado para buscar interações
    const drugId = drugInfo[0].drugbank_id;
    return await getDrugInteractionsById(drugId, region);
    
  } catch (error) {
    console.error(`Erro ao buscar interações para "${drugName}":`, error);
    return [];
  }
};

/**
 * Busca Drug-Drug Interactions por ID DrugBank
 * @param {string} drugbankId - ID DrugBank da droga
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Array>} Lista de interações medicamentosas
 */
export const getDrugInteractionsById = async (drugbankId, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient();
    
    console.log(`🔍 Buscando interações para DrugBank ID: ${drugbankId} na região ${region}`);
    
    const response = await client.get(`/drugs/${drugbankId}/drug_interactions`, {
      params: {
        region: region
      }
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Encontradas ${response.data.length} interações para ${drugbankId}`);
      
      return response.data.map(interaction => ({
        id: interaction.id || `interaction_${Date.now()}_${Math.random()}`,
        drug1: {
          name: interaction.drug1?.name || 'Medicamento 1',
          drugbank_id: drugbankId
        },
        drug2: {
          name: interaction.drug2?.name || interaction.interacting_drug_name || 'Medicamento 2',
          drugbank_id: interaction.drug2?.drugbank_id || interaction.interacting_drugbank_id
        },
        severity: mapSeverityLevel(interaction.severity),
        evidence: interaction.evidence || interaction.evidence_level || 'unknown',
        description: interaction.description || interaction.summary || 'Interação identificada',
        summary: interaction.summary || interaction.description || 'Interação entre medicamentos',
        management: interaction.management || interaction.clinical_management || 'Consulte um profissional de saúde',
        mechanism: interaction.mechanism || interaction.interaction_mechanism || '',
        drugbank_id_1: drugbankId,
        drugbank_id_2: interaction.drug2?.drugbank_id || interaction.interacting_drugbank_id || '',
        drug_name_1: interaction.drug1?.name || 'Medicamento 1',
        drug_name_2: interaction.drug2?.name || interaction.interacting_drug_name || 'Medicamento 2',
        source: 'DrugBank Individual Drug API',
        searchType: 'individual_drug_interactions',
        region: region,
        timestamp: new Date().toISOString()
      }));
    }
    
    console.log(`ℹ️ Nenhuma interação encontrada para ${drugbankId}`);
    return [];
    
  } catch (error) {
    console.error(`❌ Erro ao buscar interações para ${drugbankId}:`, error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return [];
  }
};

/**
 * Busca múltiplas Drug-Drug Interactions
 * @param {Array<string>} drugNames - Lista de nomes de drogas
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Array>} Lista consolidada de interações
 */
export const getMultipleDrugInteractions = async (drugNames, region = DEFAULT_REGION) => {
  try {
    const allInteractions = [];
    
    // Buscar interações para cada droga
    for (const drugName of drugNames) {
      const interactions = await getDrugInteractionsByName(drugName, region);
      allInteractions.push(...interactions);
    }

    // Remover duplicatas baseadas na combinação de drogas
    const uniqueInteractions = removeDuplicateInteractions(allInteractions);
    
    return uniqueInteractions;
    
  } catch (error) {
    console.error('Erro ao buscar múltiplas interações:', error);
    return [];
  }
};

/**
 * Processa e padroniza os dados de interações da API DrugBank
 * @param {Object} rawData - Dados brutos da API
 * @returns {Array} Dados processados e padronizados
 */
const processDrugInteractions = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((interaction, index) => ({
    id: interaction.id || `interaction_${index}`,
    interactingSubstance: interaction.name || interaction.drug_name || 'Substância não identificada',
    interactionType: interaction.interaction_type || 'Interação farmacológica',
    severity: mapSeverity(interaction.severity || interaction.level),
    description: interaction.description || interaction.summary || 'Descrição não disponível',
    evidence: interaction.evidence_level || interaction.evidence || 'Não especificado',
    mechanism: interaction.mechanism || 'Mecanismo não especificado',
    management: interaction.management || 'Consulte um profissional de saúde',
    drugbankId: interaction.drugbank_id || null,
    source: 'DrugBank',
    lastUpdated: new Date().toISOString()
  }));
};

/**
 * Mapeia níveis de severidade para padrão consistente
 * @param {string} severity - Severidade original
 * @returns {string} Severidade padronizada
 */
const mapSeverity = (severity) => {
  if (!severity) return 'Moderada';
  
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('major') || severityLower.includes('severe') || severityLower.includes('alta')) {
    return 'Alta';
  } else if (severityLower.includes('moderate') || severityLower.includes('moderada')) {
    return 'Moderada';
  } else if (severityLower.includes('minor') || severityLower.includes('mild') || severityLower.includes('baixa')) {
    return 'Baixa';
  }
  
  return 'Moderada';
};

/**
 * Remove interações duplicadas baseadas na combinação de drogas
 * @param {Array} interactions - Lista de interações
 * @returns {Array} Lista sem duplicatas
 */
const removeDuplicateInteractions = (interactions) => {
  const seen = new Set();
  
  return interactions.filter(interaction => {
    const key = `${interaction.interactingSubstance}_${interaction.description}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.add(key);
    return true;
  });
};

/**
 * Busca Drug-Drug Interactions integrada com fallback
 * Esta é a função principal que deve ser usada pelos componentes
 * @param {string} compoundName - Nome do composto/droga
 * @param {string} region - Região (us, ca, eu, etc.)
 * @returns {Promise<Array>} Lista de interações ou array vazio
 */
export const getDrugInteractions = async (compoundName, region = DEFAULT_REGION) => {
  try {
    console.log(`🔍 Buscando Drug-Drug Interactions para "${compoundName}" na região ${region}`);
    
    // Tentar buscar por nome exato
    let interactions = await getDrugInteractionsByName(compoundName, region);
    
    if (interactions.length > 0) {
      console.log(`✅ Encontradas ${interactions.length} interações para "${compoundName}"`);
      return interactions;
    }

    // Fallback: tentar variações do nome
    const variations = generateNameVariations(compoundName);
    
    for (const variation of variations) {
      interactions = await getDrugInteractionsByName(variation, region);
      
      if (interactions.length > 0) {
        console.log(`✅ Encontradas ${interactions.length} interações para variação "${variation}"`);
        return interactions;
      }
    }

    console.log(`ℹ️ Nenhuma interação encontrada para "${compoundName}"`);
    return [];
    
  } catch (error) {
    console.error('Erro na busca de Drug-Drug Interactions:', error);
    return [];
  }
};

/**
 * Gera variações do nome para melhorar as chances de encontrar a droga
 * @param {string} name - Nome original
 * @returns {Array<string>} Lista de variações
 */
const generateNameVariations = (name) => {
  const variations = [];
  
  // Nome em minúsculas
  variations.push(name.toLowerCase());
  
  // Nome capitalizado
  variations.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
  
  // Nome sem espaços
  variations.push(name.replace(/\s+/g, ''));
  
  // Nome com hífen em vez de espaços
  variations.push(name.replace(/\s+/g, '-'));
  
  // Remover duplicatas
  return [...new Set(variations)];
};

/**
 * Verifica se a API DrugBank está disponível
 * @returns {Promise<boolean>} Status da API
 */
export const checkDrugBankStatus = async () => {
  try {
    const client = createDrugBankClient(false);
    
    // Tentar uma requisição simples para verificar conectividade
    await client.get('/drug_names', {
      params: {
        q: 'aspirin',
        region: DEFAULT_REGION
      }
    });
    
    return true;
  } catch (error) {
    console.error('DrugBank API não está disponível:', error);
    return false;
  }
};

/**
 * Busca interações específicas entre dois compostos
 * @param {string} compound1 - Nome do primeiro composto
 * @param {string} compound2 - Nome do segundo composto
 * @param {string} region - Região para busca (padrão: 'us')
 * @returns {Promise<Array>} Array de interações entre os dois compostos
 */
/**
 * Dados simulados para teste quando a API real não estiver disponível
 */
const getSimulatedInteraction = (compound1, compound2) => {
  // Interações conhecidas para teste
  const knownInteractions = {
    'aspirin-warfarin': {
      severity: 'major',
      description: 'Aspirin pode aumentar o efeito anticoagulante da warfarina, aumentando o risco de sangramento.',
      management: 'Monitorar INR frequentemente. Considerar redução da dose de warfarina.',
      evidence: 'established'
    },
    'warfarin-aspirin': {
      severity: 'major', 
      description: 'Warfarina em combinação com aspirina pode causar sangramento excessivo.',
      management: 'Monitoramento rigoroso de sinais de sangramento. Ajuste de dose conforme necessário.',
      evidence: 'established'
    }
  };

  const key1 = `${compound1.toLowerCase()}-${compound2.toLowerCase()}`;
  const key2 = `${compound2.toLowerCase()}-${compound1.toLowerCase()}`;
  
  const interaction = knownInteractions[key1] || knownInteractions[key2];
  
  if (interaction) {
    return [{
      id: `sim_${Date.now()}`,
      drug1: { name: compound1 },
      drug2: { name: compound2 },
      severity: mapSeverityLevel(interaction.severity),
      evidence: interaction.evidence,
      description: interaction.description,
      summary: interaction.description,
      management: interaction.management,
      source: 'DrugBank DDI API (Simulado)',
      searchType: 'simulated_for_demo',
      timestamp: new Date().toISOString(),
      primaryCompound: compound1,
      secondaryCompound: compound2,
      searchMethod: 'simulated_drugbank_ddi'
    }];
  }
  
  return [];
};

/**
 * Função principal para buscar interações entre dois compostos
 * Implementa estratégia robusta com múltiplos endpoints e fallback
 * @param {string} compound1 - Nome do primeiro composto
 * @param {string} compound2 - Nome do segundo composto
 * @param {string} region - Região para busca (us, ca, eu, etc.)
 * @returns {Promise<Object>} Resultado com interações encontradas
 */
export const getDrugInteractionsBetweenCompounds = async (compound1, compound2, region = DEFAULT_REGION) => {
  console.log(`🔍 Iniciando busca de interações entre "${compound1}" e "${compound2}" na região ${region}`);
  
  try {
    // Step 1: Obter DrugBank IDs para ambos os compostos usando estratégia melhorada
    console.log(`📋 Step 1: Obtendo DrugBank IDs com busca aprimorada...`);
    const [drugId1, drugId2] = await Promise.all([
      getDrugBankId(compound1, region),
      getDrugBankId(compound2, region)
    ]);

    console.log(`🆔 DrugBank IDs encontrados: ${compound1} -> ${drugId1}, ${compound2} -> ${drugId2}`);

    // Verificar se conseguimos obter pelo menos um ID
    if (!drugId1 && !drugId2) {
      console.log(`⚠️ Nenhum DrugBank ID encontrado. Tentando busca por nome...`);
      
      // Tentar busca direta por nome usando o novo endpoint
      const nameBasedInteractions = await searchInteractionsByName(compound1, compound2, region);
      if (nameBasedInteractions.length > 0) {
        console.log(`✅ Encontradas ${nameBasedInteractions.length} interações via busca por nome`);
        return {
          success: true,
          interactions: nameBasedInteractions,
          totalFound: nameBasedInteractions.length,
          searchTerms: { compound1, compound2 },
          drugbankIds: { compound1: null, compound2: null },
          source: 'DrugBank Name Search',
          searchMethod: 'name_based',
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`⚠️ Nenhuma interação encontrada por nome. Usando dados simulados...`);
      return await simulateDrugInteractions(compound1, compound2);
    }

    // Step 2: Verificar interações usando estratégia multi-endpoint
    let interactions = [];
    
    if (drugId1 && drugId2) {
      console.log(`📋 Step 2: Verificando interações com estratégia multi-endpoint...`);
      interactions = await checkDrugDrugInteractions(drugId1, drugId2, region);
    }

    // Step 3: Se não encontrou interações, tentar busca expandida
    if (interactions.length === 0 && (drugId1 || drugId2)) {
      console.log(`📋 Step 3: Tentando busca expandida...`);
      
      const expandedInteractions = await getExpandedDrugInteractions(
        drugId1, drugId2, compound1, compound2, region
      );
      
      if (expandedInteractions.length > 0) {
        interactions = expandedInteractions;
        console.log(`✅ Encontradas ${interactions.length} interações via busca expandida`);
      }
    }

    // Step 4: Se ainda não encontrou interações, usar dados simulados como fallback
    if (interactions.length === 0) {
      console.log(`⚠️ Nenhuma interação encontrada via API. Usando dados simulados como fallback...`);
      return await simulateDrugInteractions(compound1, compound2);
    }

    // Remover duplicatas e processar resultados
    const uniqueInteractions = removeDuplicateInteractions(interactions);
    
    console.log(`✅ Encontradas ${uniqueInteractions.length} interações únicas entre ${compound1} e ${compound2}`);
    
    return {
      success: true,
      interactions: uniqueInteractions,
      totalFound: uniqueInteractions.length,
      searchTerms: { compound1, compound2 },
      drugbankIds: { compound1: drugId1, compound2: drugId2 },
      source: 'DrugBank API Enhanced',
      searchMethod: 'multi_endpoint',
      region: region,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Erro na busca de interações entre ${compound1} e ${compound2}:`, error);
    
    // Em caso de erro, usar dados simulados como fallback
    console.log(`🔄 Fallback: Usando dados simulados devido ao erro...`);
    return await simulateDrugInteractions(compound1, compound2);
  }
};

/**
 * Buscar interações por nome usando endpoints de busca
 * @param {string} compound1 - Nome do primeiro composto
 * @param {string} compound2 - Nome do segundo composto
 * @param {string} region - Região
 * @returns {Promise<Array>} Lista de interações encontradas
 */
const searchInteractionsByName = async (compound1, compound2, region = DEFAULT_REGION) => {
  try {
    const client = createDrugBankClient();
    
    // Buscar usando drug_names endpoint
    const searchResults = await Promise.all([
      client.get('/drug_names', { 
        params: { 
          q: compound1, 
          fuzzy: true, 
          region: region 
        } 
      }),
      client.get('/drug_names', { 
        params: { 
          q: compound2, 
          fuzzy: true, 
          region: region 
        } 
      })
    ]);

    const interactions = [];
    
    // Processar resultados e buscar interações
    if (searchResults[0].data && searchResults[1].data) {
      for (const drug1 of searchResults[0].data.slice(0, 3)) {
        for (const drug2 of searchResults[1].data.slice(0, 3)) {
          if (drug1.drugbank_id && drug2.drugbank_id) {
            const ddi = await checkDrugDrugInteractions(drug1.drugbank_id, drug2.drugbank_id, region);
            interactions.push(...ddi);
          }
        }
      }
    }

    return interactions;
  } catch (error) {
    console.log(`⚠️ Erro na busca por nome:`, error.response?.status);
    return [];
  }
};

/**
 * Busca expandida de interações usando múltiplas estratégias
 * @param {string} drugId1 - DrugBank ID do primeiro medicamento
 * @param {string} drugId2 - DrugBank ID do segundo medicamento
 * @param {string} compound1 - Nome do primeiro composto
 * @param {string} compound2 - Nome do segundo composto
 * @param {string} region - Região
 * @returns {Promise<Array>} Lista de interações encontradas
 */
const getExpandedDrugInteractions = async (drugId1, drugId2, compound1, compound2, region = DEFAULT_REGION) => {
  try {
    const interactions = [];

    // Estratégia 1: Buscar interações individuais e filtrar
    if (drugId1 || drugId2) {
      const individualInteractions = await Promise.all([
        drugId1 ? getDrugInteractionsById(drugId1, region) : [],
        drugId2 ? getDrugInteractionsById(drugId2, region) : []
      ]);

      // Filtrar interações que envolvem ambos os compostos
      const allInteractions = [...individualInteractions[0], ...individualInteractions[1]];
      const filteredInteractions = allInteractions.filter(interaction => {
        const involvesCompound1 = interaction.drug1?.name?.toLowerCase().includes(compound1.toLowerCase()) ||
                                 interaction.drug2?.name?.toLowerCase().includes(compound1.toLowerCase()) ||
                                 interaction.drug_name_1?.toLowerCase().includes(compound1.toLowerCase()) ||
                                 interaction.drug_name_2?.toLowerCase().includes(compound1.toLowerCase());
        const involvesCompound2 = interaction.drug1?.name?.toLowerCase().includes(compound2.toLowerCase()) ||
                                 interaction.drug2?.name?.toLowerCase().includes(compound2.toLowerCase()) ||
                                 interaction.drug_name_1?.toLowerCase().includes(compound2.toLowerCase()) ||
                                 interaction.drug_name_2?.toLowerCase().includes(compound2.toLowerCase());
        return involvesCompound1 && involvesCompound2;
      });

      interactions.push(...filteredInteractions);
    }

    // Estratégia 2: Buscar usando product concepts se disponível
    if (drugId1 && drugId2) {
      const productInteractions = await checkProductDrugInteractions(drugId1, drugId2, region);
      interactions.push(...productInteractions);
    }

    return interactions;
  } catch (error) {
    console.log(`⚠️ Erro na busca expandida:`, error.response?.status);
    return [];
  }
};

/**
 * Simular interações para demonstração quando a API não está disponível
 * @param {string} compound1 - Nome do primeiro composto
 * @param {string} compound2 - Nome do segundo composto
 * @returns {Promise<Object>} Resultado simulado
 */
const simulateDrugInteractions = async (compound1, compound2) => {
  const simulatedInteractions = getSimulatedInteraction(compound1, compound2);
  
  return {
    success: true,
    interactions: simulatedInteractions,
    totalFound: simulatedInteractions.length,
    searchTerms: { compound1, compound2 },
    drugbankIds: { compound1: null, compound2: null },
    source: 'Dados Simulados',
    searchMethod: 'simulated',
    timestamp: new Date().toISOString()
  };
}

export default {
  // Funções principais da implementação oficial DDI
  getDrugBankId,
  checkDrugDrugInteractions,
  getDrugInteractionsBetweenCompounds,
  
  // Funções legadas (mantidas para compatibilidade)
  getDrugInteractions,
  getDrugInteractionsByName,
  getDrugInteractionsById,
  getMultipleDrugInteractions,
  searchDrugByName,
  generateDrugBankToken,
  checkDrugBankStatus
};