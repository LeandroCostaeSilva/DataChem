// quick test script to call openFDA adverse reactions via local fdaService
import { getAdverseReactions } from '../src/services/fdaService.js';

const drugName = process.argv[2] || 'semaglutide';
const extraSynonyms = ['ozempic', 'wegovy', 'rybelsus', 'semaglutida'];

(async () => {
  try {
    console.log('🧪 Testando openFDA para:', drugName);
    const result = await getAdverseReactions(drugName, { maxResults: 100, synonyms: extraSynonyms });
    console.log('success:', result.success);
    console.log('total events:', result?.meta?.total || 0);
    if (Array.isArray(result.results)) {
      const preview = result.results.slice(0, 5).map(r => ({
        medicationName: r.medicationName || r.drugName || 'N/A',
        genericName: r.genericName || 'N/A',
        reactionsCount: Array.isArray(r.reactions) ? r.reactions.length : 0,
        sampleReaction: r.reactions?.[0]?.term || 'N/A'
      }));
      console.log('preview:', preview);
    } else {
      console.log('results:', result.results);
    }
  } catch (e) {
    console.error('❌ Erro no teste openFDA:', e?.message || e);
  }
})();