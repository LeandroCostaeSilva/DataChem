/**
 * Utilitários para gerenciamento do cache da aplicação
 * Fornece funções para monitorar, limpar e gerenciar o cache do Perplexity
 */

// Chave do cache no localStorage
const CACHE_STORAGE_KEY = 'perplexity_cache_v2';

/**
 * Obtém estatísticas detalhadas do cache
 * @returns {Object} - Estatísticas completas do cache
 */
export const getCacheStatistics = () => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) {
      return {
        totalEntries: 0,
        totalSize: 0,
        entriesByType: {},
        oldestEntry: null,
        newestEntry: null,
        expiredEntries: 0
      };
    }

    const cache = JSON.parse(stored);
    const entries = Object.entries(cache);
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    let totalSize = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let expiredCount = 0;
    const entriesByType = {};

    entries.forEach(([key, entry]) => {
      // Calcular tamanho aproximado
      totalSize += JSON.stringify(entry).length;
      
      // Rastrear timestamps
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
      
      // Verificar se expirou
      if (now - entry.timestamp > CACHE_DURATION) {
        expiredCount++;
      }
      
      // Contar por tipo
      const type = entry.queryType || 'unknown';
      entriesByType[type] = (entriesByType[type] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      entriesByType: entriesByType,
      oldestEntry: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp).toLocaleString('pt-BR'),
      newestEntry: newestTimestamp === 0 ? null : new Date(newestTimestamp).toLocaleString('pt-BR'),
      expiredEntries: expiredCount,
      cacheHitRate: calculateCacheHitRate()
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cache:', error);
    return null;
  }
};

/**
 * Limpa todo o cache persistente
 * @returns {boolean} - Sucesso da operação
 */
export const clearAllCache = () => {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
    console.log('🧹 Cache limpo com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
};

/**
 * Remove entradas expiradas do cache
 * @returns {number} - Número de entradas removidas
 */
export const cleanExpiredEntries = () => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return 0;

    const cache = JSON.parse(stored);
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
    const validEntries = {};
    let removedCount = 0;

    for (const [key, entry] of Object.entries(cache)) {
      if (now - entry.timestamp <= CACHE_DURATION) {
        validEntries[key] = entry;
      } else {
        removedCount++;
      }
    }

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(validEntries));
    console.log(`🧹 ${removedCount} entradas expiradas removidas`);
    return removedCount;
  } catch (error) {
    console.error('❌ Erro ao limpar entradas expiradas:', error);
    return 0;
  }
};

/**
 * Remove entradas específicas por tipo de consulta
 * @param {string} queryType - Tipo de consulta (interactions, medical_topic, etc.)
 * @returns {number} - Número de entradas removidas
 */
export const clearCacheByType = (queryType) => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return 0;

    const cache = JSON.parse(stored);
    const filteredEntries = {};
    let removedCount = 0;

    for (const [key, entry] of Object.entries(cache)) {
      if (entry.queryType !== queryType) {
        filteredEntries[key] = entry;
      } else {
        removedCount++;
      }
    }

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(filteredEntries));
    console.log(`🧹 ${removedCount} entradas do tipo "${queryType}" removidas`);
    return removedCount;
  } catch (error) {
    console.error('❌ Erro ao limpar cache por tipo:', error);
    return 0;
  }
};

/**
 * Exporta o cache para backup
 * @returns {string|null} - JSON string do cache ou null em caso de erro
 */
export const exportCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return null;

    const cache = JSON.parse(stored);
    const exportData = {
      version: 'v2',
      exportDate: new Date().toISOString(),
      totalEntries: Object.keys(cache).length,
      cache: cache
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('❌ Erro ao exportar cache:', error);
    return null;
  }
};

/**
 * Importa cache de backup
 * @param {string} cacheData - JSON string do cache
 * @returns {boolean} - Sucesso da operação
 */
export const importCache = (cacheData) => {
  try {
    const importData = JSON.parse(cacheData);
    
    if (!importData.cache || !importData.version) {
      throw new Error('Formato de cache inválido');
    }

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(importData.cache));
    console.log(`✅ Cache importado com sucesso: ${importData.totalEntries} entradas`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao importar cache:', error);
    return false;
  }
};

/**
 * Busca entradas do cache por nome do composto
 * @param {string} compoundName - Nome do composto químico
 * @returns {Array} - Lista de entradas encontradas
 */
export const searchCacheByCompound = (compoundName) => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return [];

    const cache = JSON.parse(stored);
    const normalizedSearch = compoundName.toLowerCase().trim();
    const results = [];

    for (const [key, entry] of Object.entries(cache)) {
      if (entry.compoundName && 
          entry.compoundName.toLowerCase().includes(normalizedSearch)) {
        results.push({
          key: key,
          compoundName: entry.compoundName,
          queryType: entry.queryType,
          timestamp: new Date(entry.timestamp).toLocaleString('pt-BR'),
          size: JSON.stringify(entry).length
        });
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('❌ Erro ao buscar no cache:', error);
    return [];
  }
};

/**
 * Calcula a taxa de acerto do cache (aproximada)
 * @returns {string} - Taxa de acerto formatada
 */
const calculateCacheHitRate = () => {
  // Esta é uma implementação simplificada
  // Em uma implementação real, você manteria contadores de hits/misses
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return '0%';

    const cache = JSON.parse(stored);
    const entries = Object.keys(cache).length;
    
    // Estimativa baseada no número de entradas
    // Mais entradas = maior probabilidade de hits
    if (entries === 0) return '0%';
    if (entries < 5) return '20%';
    if (entries < 20) return '45%';
    if (entries < 50) return '65%';
    return '80%';
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Formata bytes em formato legível
 * @param {number} bytes - Número de bytes
 * @returns {string} - Tamanho formatado
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Monitora o uso do cache e alerta sobre limites
 * @returns {Object} - Status do monitoramento
 */
export const monitorCacheUsage = () => {
  try {
    const stats = getCacheStatistics();
    if (!stats) return { status: 'error', message: 'Erro ao obter estatísticas' };

    const warnings = [];
    
    // Verificar tamanho total
    if (stats.totalSize > 5 * 1024 * 1024) { // 5MB
      warnings.push('Cache muito grande (>5MB)');
    }
    
    // Verificar entradas expiradas
    if (stats.expiredEntries > 10) {
      warnings.push(`${stats.expiredEntries} entradas expiradas`);
    }
    
    // Verificar número total de entradas
    if (stats.totalEntries > 100) {
      warnings.push('Muitas entradas no cache (>100)');
    }

    return {
      status: warnings.length > 0 ? 'warning' : 'ok',
      warnings: warnings,
      stats: stats,
      recommendations: generateRecommendations(stats, warnings)
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

/**
 * Gera recomendações baseadas no estado do cache
 * @param {Object} stats - Estatísticas do cache
 * @param {Array} warnings - Lista de avisos
 * @returns {Array} - Lista de recomendações
 */
const generateRecommendations = (stats, warnings) => {
  const recommendations = [];
  
  if (stats.expiredEntries > 0) {
    recommendations.push('Execute limpeza de entradas expiradas');
  }
  
  if (stats.totalSize > 3 * 1024 * 1024) { // 3MB
    recommendations.push('Considere limpar cache antigo para liberar espaço');
  }
  
  if (stats.totalEntries > 80) {
    recommendations.push('Cache próximo do limite, considere limpeza');
  }
  
  if (warnings.length === 0 && stats.totalEntries > 0) {
    recommendations.push('Cache funcionando adequadamente');
  }
  
  return recommendations;
};

// Exportar todas as funções como default também
export default {
  getCacheStatistics,
  clearAllCache,
  cleanExpiredEntries,
  clearCacheByType,
  exportCache,
  importCache,
  searchCacheByCompound,
  monitorCacheUsage
};