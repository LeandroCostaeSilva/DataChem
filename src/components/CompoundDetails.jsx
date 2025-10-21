import React, { useEffect, useState } from 'react';
import DrugInteractionsTable from './DrugInteractionsTable.jsx';
import AdverseReactionsTable from './AdverseReactionsTable.jsx';
import { runAgentSearch } from '../services/agentService.js';

export default function CompoundDetails({ compoundData, isLoading = false, error = '' }) {
  const [interactions, setInteractions] = useState(null);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  const compoundName =
    compoundData?.compound?.name ||
    compoundData?.name ||
    compoundData?.compoundName ||
    compoundData?.synonyms?.[0] ||
    '';

  const compound = compoundData?.compound || compoundData || {};
  const pubchemInfo = {
    cid: compound.cid,
    iupacName: compound.iupacName,
    molecularFormula: compound.molecularFormula,
    molecularWeight: compound.molecularWeight,
    casNumber: compound.casNumber,
    imageURL: compound.imageURL,
    smiles: compound.smiles,
    synonyms: Array.isArray(compound.synonyms) ? compound.synonyms : []
  };
  const adverseReactions = compound.adverseReactions;

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      if (!compoundName) return;
      setLoadingInteractions(true);
      try {
        const res = await runAgentSearch(compoundName);
        const data = res?.interactions ? res.interactions : res;
        if (!cancelled) setInteractions(data);
      } catch (e) {
        console.error('Erro ao gerar interações automaticamente:', e);
        if (!cancelled)
          setInteractions({
            content: '',
            citations: [],
            search_results: [],
            model: 'fallback',
            timestamp: new Date().toISOString(),
            compound_name: compoundName,
          });
      } finally {
        if (!cancelled) setLoadingInteractions(false);
      }
    }
    generate();
    return () => {
      cancelled = true;
    };
  }, [compoundName]);

  if (!compoundName) {
    return <div style={{ padding: 12 }}>Selecione um composto para visualizar interações.</div>;
  }

  const cardStyle = {
    display: 'flex',
    gap: 16,
    background: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start'
  };

  const labelStyle = { color: '#6b7280', fontSize: 12 };
  const valueStyle = { color: '#111827', fontSize: 14, fontWeight: 600 };
  const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Identificação PubChem */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>🧪 Identificação química - PubChem</h3>
        <div style={cardStyle}>
          {pubchemInfo.imageURL ? (
            <img
              src={pubchemInfo.imageURL}
              alt={`Estrutura 2D de ${compoundName}`}
              style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          ) : (
            <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6, color: '#6b7280' }}>
              Sem imagem
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={infoGrid}>
              <div>
                <div style={labelStyle}>Nome IUPAC</div>
                <div style={valueStyle}>{pubchemInfo.iupacName || 'Não disponível'}</div>
              </div>
              <div>
                <div style={labelStyle}>Fórmula Molecular</div>
                <div style={valueStyle}>{pubchemInfo.molecularFormula || 'Não disponível'}</div>
              </div>
              <div>
                <div style={labelStyle}>Peso Molecular</div>
                <div style={valueStyle}>{pubchemInfo.molecularWeight || 'Não disponível'}</div>
              </div>
              <div>
                <div style={labelStyle}>Número CAS</div>
                <div style={valueStyle}>{pubchemInfo.casNumber || 'Não disponível'}</div>
              </div>
              <div>
                <div style={labelStyle}>CID</div>
                <div style={valueStyle}>{pubchemInfo.cid || 'Não disponível'}</div>
              </div>
              <div>
                <div style={labelStyle}>SMILES</div>
                <div style={{ ...valueStyle, fontFamily: 'monospace', fontWeight: 500 }}>{pubchemInfo.smiles || 'Não disponível'}</div>
              </div>
            </div>

            {pubchemInfo.synonyms && pubchemInfo.synonyms.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={labelStyle}>Sinônimos (Top 10)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pubchemInfo.synonyms.slice(0, 10).map((s, idx) => (
                    <span key={idx} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 12, padding: '4px 8px', fontSize: 12, color: '#374151' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interações (Perplexity) */}
      <DrugInteractionsTable
        interactionsData={interactions}
        compoundName={compoundName}
        isLoading={loadingInteractions}
      />

      {/* Eventos adversos da openFDA */}
      <div style={{ marginTop: 16 }}>
        <AdverseReactionsTable
          adverseReactions={adverseReactions}
          compoundName={compoundName}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#b91c1c' }}>
          {String(error)}
        </div>
      )}
    </div>
  );
}