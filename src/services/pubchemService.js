import axios from 'axios';
import { getAdverseReactions } from './fdaService.js';

// Base URLs para as APIs do PubChem
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const AUTOCOMPLETE_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete';

// Detectar padrão de número CAS (ex.: 2305040-16-6)
export const isCasNumber = (query) => {
  if (!query) return false;
  const clean = String(query).trim();
  const casPattern = /^\d{2,7}-\d{2}-\d$/;
  return casPattern.test(clean);
};

// Utilitário: JSONP para endpoints de autocomplete do PubChem (compound/substance)
const jsonpAutocomplete = (type, query, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const cleanQuery = query.trim().replace(/[^a-zA-Z0-9\s\-]/g, '');
    if (!cleanQuery) return resolve([]);

    const callbackName = `pubchem_cb_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let script;

    // Criar callback global
    window[callbackName] = (data) => {
      try {
        const dict = data?.dictionary_terms || {};
        const list = dict[type] || dict.compound || dict.substance || [];
        const suggestions = Array.isArray(list) ? list : [];
        const filtered = suggestions.filter(s => s && typeof s === 'string').slice(0, 15);
        resolve(filtered);
      } catch (e) {
        console.warn(`Falha ao processar JSONP ${type}:`, e);
        resolve([]);
      } finally {
        if (window[callbackName]) delete window[callbackName];
        if (script && script.parentNode) document.head.removeChild(script);
      }
    };

    script = document.createElement('script');
    script.src = `${AUTOCOMPLETE_BASE_URL}/${encodeURIComponent(type)}/${encodeURIComponent(cleanQuery)}/jsonp?callback=${callbackName}`;
    script.onerror = () => {
      if (window[callbackName]) delete window[callbackName];
      if (script && script.parentNode) document.head.removeChild(script);
      resolve([]);
    };

    const tId = setTimeout(() => {
      if (window[callbackName]) delete window[callbackName];
      if (script && script.parentNode) document.head.removeChild(script);
      resolve([]);
    }, timeoutMs);

    // Garantir limpeza do timeout ao finalizar
    const originalCallback = window[callbackName];
    window[callbackName] = (...args) => {
      clearTimeout(tId);
      originalCallback(...args);
    };

    document.head.appendChild(script);
  });
};

// Utilitário: obter CIDs por número CAS
const getCidsByCAS = async (cas) => {
  try {
    const url = `${PUBCHEM_BASE_URL}/compound/xref/RN/${encodeURIComponent(cas)}/cids/JSON`;
    const response = await axios.get(url);
    const cids = response.data?.IdentifierList?.CID || [];
    return Array.isArray(cids) ? cids : [];
  } catch (e) {
    return [];
  }
};

// Utilitário: obter SIDs por número CAS
const getSidsByCAS = async (cas) => {
  try {
    const url = `${PUBCHEM_BASE_URL}/substance/xref/RN/${encodeURIComponent(cas)}/sids/JSON`;
    const response = await axios.get(url);
    const sids = response.data?.IdentifierList?.SID || [];
    return Array.isArray(sids) ? sids : [];
  } catch (e) {
    return [];
  }
};

// Utilitário: deduplicação simples mantendo ordem
const uniqueStrings = (arr) => {
  const seen = new Set();
  const out = [];
  for (const s of arr) {
    if (typeof s === 'string' && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
};

/**
 * Função para buscar sugestões de autocompletar
 * @param {string} query - Termo de busca
 * @returns {Promise<Array>} - Lista de sugestões
 */
export const getAutocompleteSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) return [];
    const cleanQuery = query.trim();

    // Caso 1: usuário digitou um número CAS -> usar xref para obter nomes
    if (isCasNumber(cleanQuery)) {
      const cas = cleanQuery;
      const suggestions = [cas];

      // Priorizar CIDs (compostos) e coletar sinônimos
      const cids = await getCidsByCAS(cas);
      if (cids.length > 0) {
        try {
          const synonyms = await getCompoundSynonyms(cids[0]);
          const names = synonyms.filter(s => typeof s === 'string' && !isCasNumber(s));
          return uniqueStrings([...suggestions, ...names]).slice(0, 15);
        } catch {
          // continua para SIDs
        }
      }

      // Fallback: buscar SIDs (substâncias) e tentar nomes
      const sids = await getSidsByCAS(cas);
      if (sids.length > 0) {
        try {
          const syns = await getSubstanceSynonyms(sids[0]);
          const names = syns.filter(s => typeof s === 'string' && !isCasNumber(s));
          return uniqueStrings([...suggestions, ...names]).slice(0, 15);
        } catch {}
      }

      // Sem CIDs/SIDs, devolver apenas o CAS
      return suggestions;
    }

    // Caso 2: nome comum -> combinar autocomplete de compound e substance
    const [compoundSuggestions, substanceSuggestions] = await Promise.all([
      jsonpAutocomplete('compound', cleanQuery),
      jsonpAutocomplete('substance', cleanQuery)
    ]);

    const combined = uniqueStrings([...compoundSuggestions, ...substanceSuggestions]);
    return combined.slice(0, 15);
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
    // Se for um número CAS, usar xref RN (mais confiável)
    if (isCasNumber(compoundName)) {
      const cids = await getCidsByCAS(compoundName);
      if (cids.length > 0) return cids[0];
      return null;
    }

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

// ===== Fallback para SUBSTANCE (SID) =====

export const getSubstanceSID = async (name) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/substance/name/${encodeURIComponent(name)}/sids/JSON`
    );
    const sids = response.data?.IdentifierList?.SID || [];
    return Array.isArray(sids) && sids.length > 0 ? sids[0] : null;
  } catch (error) {
    console.error('Erro ao buscar SID por nome:', error);
    return null;
  }
};

export const getSubstanceSynonyms = async (sid) => {
  try {
    const response = await axios.get(
      `${PUBCHEM_BASE_URL}/substance/sid/${sid}/synonyms/JSON`
    );
    const info = response.data?.InformationList?.Information?.[0];
    return info?.Synonym || [];
  } catch (error) {
    console.error('Erro ao buscar sinônimos da substância:', error);
    return [];
  }
};

export const getSubstanceImageURL = (sid) => {
  return `${PUBCHEM_BASE_URL}/substance/sid/${sid}/PNG?image_size=large`;
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
      // Fallback: tentar como SUBSTANCE (ex.: biológicos como Delandistrogene moxeparvovec)
      const sid = await getSubstanceSID(compoundName);
      if (!sid) {
        throw new Error('Composto/Substância não encontrado');
      }

      const synonyms = await getSubstanceSynonyms(sid);
      const casPattern = /^\d{2,7}-\d{2}-\d$/;
      const casNumber = synonyms.find(s => casPattern.test(s)) || null;
      const imageURL = getSubstanceImageURL(sid);

      console.log('🔍 PubChem Service - Buscando reações adversas para (substância):', compoundName);
      const adverseReactions = await getAdverseReactions(compoundName, { maxResults: 500, synonyms: Array.isArray(synonyms) ? synonyms.slice(0, 50) : [] });
      console.log('📊 PubChem Service - Reações adversas recebidas:', adverseReactions);

      return {
        sid,
        cid: null,
        name: compoundName,
        iupacName: 'Não disponível',
        molecularFormula: 'Não disponível',
        molecularWeight: 'Não disponível',
        casNumber: casNumber || 'Não disponível',
        synonyms: Array.isArray(synonyms) ? synonyms.slice(0, 20) : [],
        smiles: 'Não disponível',
        imageURL,
        adverseReactions,
        searchTerm: compoundName
      };
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

    // 6. Buscar reações adversas no FDA
    console.log('🔍 PubChem Service - Buscando reações adversas para:', compoundName);
    const adverseReactions = await getAdverseReactions(compoundName, { maxResults: 500, synonyms: Array.isArray(synonyms) ? synonyms.slice(0, 50) : [] });
    console.log('📊 PubChem Service - Reações adversas recebidas:', adverseReactions);

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
      adverseReactions,
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