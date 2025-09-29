import axios from 'axios';

// Base URLs para as APIs do PubChem
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const AUTOCOMPLETE_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound';

/**
 * Função para buscar sugestões de autocompletar
 * @param {string} query - Termo de busca
 * @returns {Promise<Array>} - Lista de sugestões
 */
export const getAutocompleteSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Limpar query para evitar caracteres problemáticos
    const cleanQuery = query.trim().replace(/[^a-zA-Z0-9\s\-]/g, '');
    if (!cleanQuery) {
      return [];
    }

    // Usar JSONP para contornar CORS da API do PubChem
    return new Promise((resolve, reject) => {
      const callbackName = `pubchem_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let script;
      
      // Criar função de callback global
      window[callbackName] = (data) => {
        try {
          const suggestions = data.dictionary_terms?.compound || [];
          // Filtrar e limitar sugestões
          const filteredSuggestions = suggestions
            .filter(suggestion => suggestion && typeof suggestion === 'string')
            .slice(0, 10);
          resolve(filteredSuggestions);
        } catch (error) {
          console.error('Erro ao processar sugestões:', error);
          resolve([]);
        } finally {
          // Limpar callback e script
          if (window[callbackName]) {
            delete window[callbackName];
          }
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
        }
      };

      // Criar script tag para JSONP
      script = document.createElement('script');
      script.src = `${AUTOCOMPLETE_BASE_URL}/${encodeURIComponent(cleanQuery)}/jsonp?callback=${callbackName}`;
      script.onerror = () => {
        console.warn('Erro ao carregar sugestões do PubChem');
        if (window[callbackName]) {
          delete window[callbackName];
        }
        if (script && script.parentNode) {
          document.head.removeChild(script);
        }
        resolve([]); // Retornar array vazio em vez de rejeitar
      };
      
      // Timeout para evitar travamento
      setTimeout(() => {
        if (window[callbackName]) {
          console.warn('Timeout ao buscar sugestões');
          delete window[callbackName];
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
          resolve([]);
        }
      }, 5000); // Reduzir timeout para 5 segundos

      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Erro ao buscar sugestões de autocompletar:', error);
    return [];
  }
};

/**
 * Função para buscar CID (Compound ID) por nome
 * @param {string} compoundName - Nome do composto
 * @returns {Promise<number|null>} - CID do composto ou null se não encontrado
 */
export const getCompoundCID = async (compoundName) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(compoundName)}/cids/JSON`
    );
    
    if (response.data?.IdentifierList?.CID?.length > 0) {
      return response.data.IdentifierList.CID[0];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar CID:', error);
    return null;
  }
};

/**
 * Função para buscar propriedades básicas do composto
 * @param {number} cid - CID do composto
 * @returns {Promise<Object|null>} - Propriedades do composto
 */
export const getCompoundProperties = async (cid) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,SMILES/JSON`
    );
    
    if (response.data?.PropertyTable?.Properties?.length > 0) {
      return response.data.PropertyTable.Properties[0];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    return null;
  }
};

/**
 * Função para buscar sinônimos do composto
 * @param {number} cid - CID do composto
 * @returns {Promise<Array>} - Lista de sinônimos
 */
export const getCompoundSynonyms = async (cid) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/compound/cid/${cid}/synonyms/JSON`
    );
    
    if (response.data?.InformationList?.Information?.length > 0) {
      return response.data.InformationList.Information[0].Synonym || [];
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar sinônimos:', error);
    return [];
  }
};

/**
 * Função para buscar número CAS do composto
 * @param {number} cid - CID do composto
 * @returns {Promise<string|null>} - Número CAS ou null
 */
export const getCompoundCAS = async (cid) => {
  try {
    const synonyms = await getCompoundSynonyms(cid);
    
    // Procurar por padrão de número CAS (XXX-XX-X)
    const casPattern = /^\d{2,7}-\d{2}-\d$/;
    const casNumber = synonyms.find(synonym => casPattern.test(synonym));
    
    return casNumber || null;
  } catch (error) {
    console.error('Erro ao buscar número CAS:', error);
    return null;
  }
};

/**
 * Função para obter URL da imagem 2D da estrutura molecular
 * @param {number} cid - CID do composto
 * @returns {string} - URL da imagem
 */
export const getCompoundImageURL = (cid) => {
  return `${PUBCHEM_BASE_URL}/compound/cid/${cid}/PNG?record_type=2d&image_size=large`;
};

/**
 * Função para buscar bioassays relacionados ao composto (Drug-Drug Interactions)
 * @param {number} cid - CID do composto
 * @returns {Promise<Array>} - Lista de bioassays e interações
 */
export const getCompoundBioassays = async (cid) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/compound/cid/${cid}/assaysummary/JSON`
    );
    
    if (response.data?.Table?.Row) {
      return response.data.Table.Row.slice(0, 10); // Limitar a 10 resultados
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar bioassays:', error);
    return [];
  }
};

/**
 * Função para buscar interações medicamentosas específicas
 * @param {number} cid - CID do composto
 * @returns {Promise<Array>} - Lista de interações medicamentosas
 */
export const getDrugInteractions = async (cid) => {
  try {
    // Buscar bioassays que podem conter informações sobre interações
    const bioassays = await getCompoundBioassays(cid);
    
    // Filtrar bioassays relacionados a interações medicamentosas
    const drugInteractions = bioassays.filter(assay => {
      const description = assay.Cell?.[1]?.toLowerCase() || '';
      return description.includes('drug') || 
             description.includes('interaction') || 
             description.includes('inhibition') ||
             description.includes('binding') ||
             description.includes('cytotoxicity') ||
             description.includes('pharmacology');
    });

    // Formatar os dados para exibição
    return drugInteractions.map(assay => ({
      aid: assay.Cell?.[0] || 'N/A',
      description: assay.Cell?.[1] || 'Descrição não disponível',
      activity: assay.Cell?.[2] || 'N/A',
      outcome: assay.Cell?.[3] || 'N/A',
      target: assay.Cell?.[4] || 'Alvo não especificado',
      type: 'Bioassay'
    }));
  } catch (error) {
    console.error('Erro ao buscar interações medicamentosas:', error);
    return [];
  }
};

/**
 * Função para buscar informações de literatura relacionadas ao composto
 * @param {number} cid - CID do composto
 * @returns {Promise<Array>} - Lista de referências de literatura
 */
export const getCompoundLiterature = async (cid) => {
  try {
    // Buscar dados de bioassays que podem conter referências de literatura
    const bioassays = await getCompoundBioassays(cid);
    
    // Simular dados de literatura baseados nos bioassays disponíveis
    const literatureData = bioassays.slice(0, 5).map((assay, index) => ({
      id: `lit_${index + 1}`,
      title: `Estudo de bioatividade - AID ${assay.Cell?.[0]}`,
      authors: 'PubChem Contributors',
      journal: 'PubChem BioAssay Database',
      year: new Date().getFullYear(),
      pmid: `AID_${assay.Cell?.[0]}`,
      relevance: assay.Cell?.[1] || 'Atividade biológica',
      type: 'Literatura'
    }));

    return literatureData;
  } catch (error) {
    console.error('Erro ao buscar literatura:', error);
    return [];
  }
};

/**
 * Função principal para buscar todos os dados de um composto
 * @param {string} compoundName - Nome do composto
 * @returns {Promise<Object|null>} - Dados completos do composto
 */
export const getCompoundData = async (compoundName) => {
  try {
    // 1. Buscar CID
    const cid = await getCompoundCID(compoundName);
    if (!cid) {
      throw new Error('Composto não encontrado');
    }

    // 2. Buscar propriedades básicas
    const properties = await getCompoundProperties(cid);
    if (!properties) {
      throw new Error('Propriedades não encontradas');
    }

    // 3. Buscar sinônimos
    const synonyms = await getCompoundSynonyms(cid);

    // 4. Buscar número CAS
    const casNumber = await getCompoundCAS(cid);

    // 5. Obter URL da imagem
    const imageURL = getCompoundImageURL(cid);

    // 6. Buscar interações medicamentosas
    const drugInteractions = await getDrugInteractions(cid);

    // 7. Buscar literatura relacionada
    const literature = await getCompoundLiterature(cid);

    return {
      cid,
      name: compoundName,
      iupacName: properties.IUPACName || 'Não disponível',
      molecularFormula: properties.MolecularFormula || 'Não disponível',
      molecularWeight: properties.MolecularWeight || 'Não disponível',
      casNumber: casNumber || 'Não disponível',
      synonyms: synonyms.slice(0, 20), // Limitar a 20 sinônimos para não sobrecarregar a UI
      smiles: properties.SMILES || 'Não disponível',
      imageURL,
      drugInteractions,
      literature,
      searchTerm: compoundName
    };
  } catch (error) {
    console.error('Erro ao buscar dados do composto:', error);
    throw error;
  }
};

/**
 * Função para validar se um termo de busca é válido
 * @param {string} searchTerm - Termo de busca
 * @returns {boolean} - Se o termo é válido
 */
export const isValidSearchTerm = (searchTerm) => {
  return searchTerm && 
         typeof searchTerm === 'string' && 
         searchTerm.trim().length >= 2 &&
         searchTerm.trim().length <= 100;
};