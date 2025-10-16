import React, { useState } from 'react';
import styled from 'styled-components';
import SourcesModal from './SourcesModal';

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
`;

const TableTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: white;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderCell = styled.th`
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 11px;
  }
  
  &:first-child {
    border-top-left-radius: 8px;
  }
  
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #e3f2fd;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const TableCell = styled.td`
  padding: 14px 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 12px;
  }
`;

const SeverityBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.severity?.toLowerCase()) {
      case 'grave':
      case 'severe':
        return `
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        `;
      case 'moderada':
      case 'moderate':
        return `
          background: #fff3e0;
          color: #ef6c00;
          border: 1px solid #ffcc02;
        `;
      case 'leve':
      case 'mild':
      case 'light':
        return `
          background: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
        `;
    }
  }}
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;

const SourceInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #6c757d;
  border-left: 4px solid #007bff;
`;

const ClickableSourcesText = styled.span`
  cursor: pointer;
  color: #007bff;
  text-decoration: underline;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0056b3;
    background: rgba(0, 123, 255, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

const BibliographicContainer = styled.div`
  margin-top: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

const BibliographicHeader = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BibliographicContent = styled.div`
  padding: 16px;
`;

const SourcesList = styled.div`
  display: grid;
  gap: 12px;
`;

const SourceItem = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const SourceTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
`;

const SourceUrl = styled.a`
  color: #007bff;
  text-decoration: none;
  font-size: 12px;
  word-break: break-all;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SourceMeta = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: #6c757d;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;



const StatsContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 12px;
  color: #1565c0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ViewAllSourcesButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
`;

// Componente para exibir fontes bibliográficas
const BibliographicSourcesSection = ({ interactionsData, additionalInfo, onSourcesClick }) => {
  // Extrair fontes e citações dos metadados da Perplexity
  const sources = interactionsData?.metadata?.search_results || [];
  const citations = interactionsData?.metadata?.citations || [];
  const statistics = interactionsData?.statistics || {};

  // Se não há search_results, tentar construir uma lista a partir das citações
  const citationAsSources = citations
    .map((c, idx) => {
      if (!c) return null;
      if (typeof c === 'string') {
        return { title: `Citação ${idx + 1}`, url: c };
      }
      const title = c.title || c.source || c.label || `Citação ${idx + 1}`;
      const url = c.url || c.source_url || c.href || c.link;
      const domain = c.domain;
      return (title || url) ? { title, url, domain, type: 'citation' } : null;
    })
    .filter(Boolean);

  const displaySources = (sources && sources.length > 0) ? sources : citationAsSources;

  // Se não há fontes nem citações, manter mensagem informativa
  if ((displaySources?.length || 0) === 0 && !additionalInfo?.sources) {
    return (
      <BibliographicContainer>
        <BibliographicHeader>
          📚 Fontes Bibliográficas
        </BibliographicHeader>
        <BibliographicContent>
          <div style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
            Nenhuma fonte bibliográfica específica disponível para esta consulta.
          </div>
        </BibliographicContent>
      </BibliographicContainer>
    );
  }

  return (
    <BibliographicContainer>
      <BibliographicHeader>
        📚 Fontes Bibliográficas Consultadas
      </BibliographicHeader>
      
      <BibliographicContent>
        {/* Lista de Fontes */}
        {displaySources.length > 0 && (
          <SourcesList>
            {displaySources.slice(0, 5).map((source, index) => (
              <SourceItem key={index}>
                <SourceTitle>
                  {index + 1}. {source.title || 'Fonte Médica Especializada'}
                </SourceTitle>
                {source.url && (
                  <SourceUrl 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Abrir fonte em nova aba"
                  >
                    🔗 {source.url}
                  </SourceUrl>
                )}
                <SourceMeta>
                  {source.date && <span>📅 {source.date}</span>}
                  {source.domain && <span>🌐 {source.domain}</span>}
                  {source.type && <span>📄 {source.type}</span>}
                </SourceMeta>
              </SourceItem>
            ))}
          </SourcesList>
        )}

        {/* Fontes adicionais extraídas do conteúdo */}
        {additionalInfo?.sources && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2c3e50' }}>
              📖 Fontes Adicionais Identificadas:
            </h4>
            <div 
              style={{ 
                background: 'white', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #dee2e6',
                fontSize: '13px',
                lineHeight: '1.5'
              }}
              dangerouslySetInnerHTML={{ 
                __html: additionalInfo.sources.replace(/\n/g, '<br>') 
              }} 
            />
          </div>
        )}



        {/* Estatísticas e Metadados */}
        <StatsContainer>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <StatItem>
              📊 Gerado por {interactionsData?.source || 'Perplexity AI'}
            </StatItem>
            <StatItem>
              🕒 {interactionsData?.timestamp ? 
                new Date(interactionsData.timestamp).toLocaleString('pt-BR') : 
                'Data não disponível'
              }
            </StatItem>
            {statistics.searchResults > 0 && (
              <StatItem>
                📚 {statistics.searchResults} fontes consultadas
              </StatItem>
            )}
            {statistics.wordCount && (
              <StatItem>
                📝 {statistics.wordCount} palavras
              </StatItem>
            )}
          </div>
          
          {displaySources.length > 5 && (
            <ViewAllSourcesButton 
              onClick={onSourcesClick}
              title="Ver todas as fontes bibliográficas"
            >
              Ver Todas as Fontes ({displaySources.length})
            </ViewAllSourcesButton>
          )}
        </StatsContainer>
      </BibliographicContent>
    </BibliographicContainer>
  );
};

const DrugInteractionsTable = ({ interactionsData, compoundName }) => {
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  const handleSourcesClick = () => {
    setIsSourcesModalOpen(true);
  };

  // Função para extrair dados da tabela markdown
  const parseMarkdownTable = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const tableLines = lines.filter(line => line.includes('|') && line.trim().length > 0);
    
    if (tableLines.length < 2) return [];
    
    // Primeira linha são os cabeçalhos
    const headers = tableLines[0]
      .split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Pular a linha de separação (segunda linha)
    const dataLines = tableLines.slice(2);
    
    return dataLines.map(line => {
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      const row = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '_')] = cells[index] || '';
      });
      
      return row;
    });
  };

  // Função para extrair informações adicionais (fontes, citações, etc.)
  const extractAdditionalInfo = (content) => {
    if (!content) return {};
    
    const sections = content.split('\n## ');
    const info = {};
    
    sections.forEach(section => {
      if (section.includes('Fontes Consultadas') || section.includes('📚')) {
        info.sources = section;
      } else if (section.includes('Perguntas Relacionadas') || section.includes('❓')) {
        info.relatedQuestions = section;
      }
    });
    
    return info;
  };

  if (!interactionsData || !interactionsData.content) {
    return (
      <TableContainer>
        <NoDataMessage>
          📊 Nenhum dado de interação disponível para {compoundName}
        </NoDataMessage>
      </TableContainer>
    );
  }

  const tableData = parseMarkdownTable(interactionsData.rawContent || interactionsData.content);
  const additionalInfo = extractAdditionalInfo(interactionsData.rawContent || interactionsData.content);

  // Normaliza o texto da severidade para exibir apenas Leve/Moderada/Grave
  const normalizeSeverity = (value) => {
    if (!value) return '';
    const str = String(value).toLowerCase();
    if (str.includes('grave')) return 'Grave';
    if (str.includes('moderada')) return 'Moderada';
    if (str.includes('leve')) return 'Leve';
    // Robustez: mapear equivalentes em inglês caso ocorram
    if (str.includes('severe')) return 'Grave';
    if (str.includes('moderate')) return 'Moderada';
    if (str.includes('mild') || str.includes('light')) return 'Leve';
    // Remover detalhamento entre parênteses, mantendo prefixo
    const base = String(value).split('(')[0].trim();
    const baseLower = base.toLowerCase();
    if (baseLower === 'grave') return 'Grave';
    if (baseLower === 'moderada') return 'Moderada';
    if (baseLower === 'leve') return 'Leve';
    return base || String(value);
  };

  if (tableData.length === 0) {
    return (
      <TableContainer>
        <TableTitle>
          🧬 Interações Medicamentosas - {compoundName}
        </TableTitle>
        <div 
          dangerouslySetInnerHTML={{ __html: interactionsData.content }}
          style={{ lineHeight: '1.6', color: '#333' }}
        />
        {interactionsData.source && (
          <SourceInfo>
            📊 Dados gerados por {interactionsData.source} em {new Date(interactionsData.timestamp).toLocaleString('pt-BR')}
          </SourceInfo>
        )}
      </TableContainer>
    );
  }

  // Determinar as colunas baseadas nos dados
  const columns = Object.keys(tableData[0]);
  const columnHeaders = {
    'medicamento': 'Medicamento',
    'drug': 'Medicamento',
    'severidade': 'Severidade',
    'severity': 'Severidade',
    'mecanismo': 'Mecanismo',
    'mecanismo_de_interação': 'Mecanismo de Interação',
    'mechanism': 'Mecanismo',
    'efeitos_clínicos': 'Efeitos Clínicos',
    'efeito_clínico': 'Efeitos Clínicos',
    'clinical_effects': 'Efeitos Clínicos',
    'effects': 'Efeitos',
    'recomendações': 'Recomendações',
    'recomendação': 'Recomendações',
    'recommendations': 'Recomendações',
    'management': 'Recomendações'
  };

  return (
    <TableContainer>
      <TableTitle>
        🧬 Interações Medicamentosas - {compoundName}
      </TableTitle>
      
      <StyledTable>
        <TableHeader>
          <tr>
            {columns.map((column, index) => (
              <HeaderCell key={index}>
                {columnHeaders[column] || column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </HeaderCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.includes('severidade') || column.includes('severity') ? (
                    <SeverityBadge severity={normalizeSeverity(row[column])}>
                      {normalizeSeverity(row[column])}
                    </SeverityBadge>
                  ) : (
                    row[column]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Seção de Fontes Bibliográficas */}
      <BibliographicSourcesSection 
        interactionsData={interactionsData}
        additionalInfo={additionalInfo}
        onSourcesClick={handleSourcesClick}
      />

      <SourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        sourcesData={interactionsData.metadata}
        metadata={interactionsData.metadata}
      />
    </TableContainer>
  );
};

export default DrugInteractionsTable;