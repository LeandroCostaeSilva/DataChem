import { db } from '../firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Coleção para histórico de pesquisas
const SEARCHES_COLLECTION = 'searches';

/**
 * Salva uma pesquisa no histórico do Firebase
 * @param {Object} searchData - Dados da pesquisa
 * @param {string} searchData.searchTerm - Termo pesquisado
 * @param {string} searchData.compoundName - Nome do composto encontrado
 * @param {string} searchData.cid - CID do composto
 * @param {Object} searchData.compoundData - Dados completos do composto
 * @returns {Promise<string>} ID do documento criado
 */
export const saveSearchToHistory = async (searchData) => {
  try {
    const searchRecord = {
      searchTerm: searchData.searchTerm,
      compoundName: searchData.compoundName,
      cid: searchData.cid,
      molecularFormula: searchData.compoundData?.molecularFormula || '',
      molecularWeight: searchData.compoundData?.molecularWeight || '',
      smiles: searchData.compoundData?.smiles || '',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, SEARCHES_COLLECTION), searchRecord);
    console.log('Pesquisa salva no histórico com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar pesquisa no histórico:', error);
    throw error;
  }
};

/**
 * Recupera o histórico de pesquisas do Firebase
 * @param {number} limitCount - Número máximo de registros a retornar (padrão: 20)
 * @returns {Promise<Array>} Array com o histórico de pesquisas
 */
export const getSearchHistory = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, SEARCHES_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return history;
  } catch (error) {
    console.error('Erro ao recuperar histórico de pesquisas:', error);
    throw error;
  }
};

/**
 * Busca pesquisas por termo específico
 * @param {string} searchTerm - Termo a ser buscado
 * @param {number} limitCount - Número máximo de registros a retornar (padrão: 10)
 * @returns {Promise<Array>} Array com pesquisas que correspondem ao termo
 */
export const searchInHistory = async (searchTerm, limitCount = 10) => {
  try {
    const q = query(
      collection(db, SEARCHES_COLLECTION),
      where('searchTerm', '>=', searchTerm.toLowerCase()),
      where('searchTerm', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('searchTerm'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return results;
  } catch (error) {
    console.error('Erro ao buscar no histórico:', error);
    throw error;
  }
};

/**
 * Recupera pesquisas recentes (últimas 24 horas)
 * @returns {Promise<Array>} Array com pesquisas recentes
 */
export const getRecentSearches = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const q = query(
      collection(db, SEARCHES_COLLECTION),
      where('createdAt', '>=', yesterday.toISOString()),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const recentSearches = [];
    
    querySnapshot.forEach((doc) => {
      recentSearches.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return recentSearches;
  } catch (error) {
    console.error('Erro ao recuperar pesquisas recentes:', error);
    throw error;
  }
};