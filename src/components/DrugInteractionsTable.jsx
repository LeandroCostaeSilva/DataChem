import React, { useState } from 'react';
import styled from 'styled-components';
import { getDrugInteractionsBetweenCompounds } from '../services/drugbankService';
import DrugBankAutocomplete from './DrugBankAutocomplete';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-top: 24px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 8px;
    margin-top: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 6px;
    margin-top: 12px;
  }
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 0 16px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin: 0 0 12px 0;
  }
`;



const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e1e5e9;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e1e5e9;
  color: #495057;
  vertical-align: top;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
  }
`;

const Badge = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'active': return '#d4edda';
      case 'inactive': return '#f8d7da';
      case 'inconclusive': return '#fff3cd';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'active': return '#155724';
      case 'inactive': return '#721c24';
      case 'inconclusive': return '#856404';
      default: return '#383d41';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 11px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-style: italic;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 14px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #007bff;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 14px;
  }
`;

const FilterContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e1e5e9;
  
  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    margin-bottom: 12px;
  }
`;

const FilterTitle = styled.h4`
  color: #495057;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin: 0 0 10px 0;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    flex-direction: column;
    align-items: stretch;
  }
`;



const SearchButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    width: 100%;
  }
`;

const ClearButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #545b62;
  }
  
  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    width: 100%;
  }
`;

const DrugInteractionsTable = ({ drugInteractions = 0, isLoading = false, compoundName = '' }) => {
  const [secondCompound, setSecondCompound] = useState('');
  const [crossSearchResults, setCrossSearchResults] = useState(null);
  const [isCrossSearching, setIsCrossSearching] = useState(false);
  const [crossSearchError, setCrossSearchError] = useState('');

  const handleCrossSearch = async () => {
    console.log('🔍 Iniciando busca cruzada de interações...');
    console.log('📋 Parâmetros:', { compoundName, secondCompound: secondCompound.trim() });
    
    if (!secondCompound.trim()) {
      console.warn('⚠️ Segundo composto não informado');
      setCrossSearchError('Por favor, digite o nome do segundo composto');
      return;
    }

    if (!compoundName.trim()) {
      console.warn('⚠️ Composto principal não encontrado');
      setCrossSearchError('Composto principal não encontrado');
      return;
    }

    setIsCrossSearching(true);
    setCrossSearchError('');

    try {
      console.log(`🚀 Chamando getDrugInteractionsBetweenCompounds("${compoundName}", "${secondCompound.trim()}")`);
      const results = await getDrugInteractionsBetweenCompounds(compoundName, secondCompound.trim());
      
      console.log('📊 Resultado da busca:', results);
      console.log('📊 Tipo do resultado:', typeof results);
      console.log('📊 É array?', Array.isArray(results));
      
      // A função sempre retorna um objeto com propriedade 'interactions'
      if (results && results.interactions) {
        console.log('✅ Resultado tem propriedade interactions:', results.interactions.length);
        setCrossSearchResults(results.interactions);
        
        if (results.interactions.length === 0) {
          setCrossSearchError(`Nenhuma interação específica encontrada entre "${compoundName}" e "${secondCompound}"`);
        } else {
          console.log(`✅ ${results.interactions.length} interações encontradas!`);
          console.log('📋 Fonte dos dados:', results.source);
          console.log('📋 Método de busca:', results.searchMethod);
        }
      } else {
        console.warn('⚠️ Formato de resultado inesperado:', results);
        setCrossSearchResults([]);
        setCrossSearchError('Formato de resposta inesperado da API');
      }
    } catch (error) {
      console.error('❌ Erro na busca cruzada:', error);
      console.error('❌ Stack trace:', error.stack);
      setCrossSearchError(`Erro ao buscar interações: ${error.message}`);
      setCrossSearchResults([]);
    } finally {
      setIsCrossSearching(false);
      console.log('🏁 Busca cruzada finalizada');
    }
  };

  const handleClearSearch = () => {
    setSecondCompound('');
    setCrossSearchResults(null);
    setCrossSearchError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCrossSearch();
    }
  };

  // Determinar quais dados exibir
  const displayData = crossSearchResults !== null ? crossSearchResults : drugInteractions;
  const displayLoading = isCrossSearching || isLoading;

  const renderContent = () => {
    if (displayLoading) {
      const loadingMessage = isCrossSearching 
        ? `🔍 Buscando interações entre "${compoundName}" e "${secondCompound}"...`
        : '🔍 Carregando interações medicamentosas via DrugBank...';
      
      return <LoadingState>{loadingMessage}</LoadingState>;
    }

    // Exibir erro de busca cruzada se houver
    if (crossSearchError) {
      return (
        <EmptyState>
          ❌ {crossSearchError}
          <br />
          <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Tente com nomes diferentes ou verifique a ortografia
          </small>
        </EmptyState>
      );
    }

    // Se displayData é 0 (nenhuma interação encontrada), exibir (0)
    if (displayData === 0) {
      const message = crossSearchResults !== null 
        ? `Interações entre "${compoundName}" e "${secondCompound}": (0)`
        : 'Drug-Drug Interactions: (0)';
      
      return (
        <EmptyState>
          {message}
          <br />
          <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Nenhuma interação encontrada na base DrugBank
          </small>
        </EmptyState>
      );
    }

    // Se displayData é um array vazio ou não tem dados específicos de DDI
    if (!displayData || (Array.isArray(displayData) && displayData.length === 0)) {
      const message = crossSearchResults !== null 
        ? `Interações entre "${compoundName}" e "${secondCompound}": (0)`
        : 'Drug-Drug Interactions: (0)';
      
      return (
        <EmptyState>
          {message}
          <br />
          <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Nenhuma interação encontrada na base DrugBank
          </small>
        </EmptyState>
      );
    }

    // Se houver dados específicos de DDI do DrugBank
    if (Array.isArray(displayData) && displayData.length > 0) {
      const isSpecificSearch = crossSearchResults !== null;
      const searchInfo = isSpecificSearch 
        ? `Interações específicas entre "${compoundName}" e "${secondCompound}"`
        : `Interações encontradas para "${compoundName}"`;

      return (
        <>
          <div style={{ marginBottom: '16px', color: '#495057', fontSize: '14px' }}>
            <strong>{displayData.length}</strong> interação(ões) encontrada(s) via DrugBank API
            <br />
            <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {searchInfo}
            </small>
          </div>
          <TableWrapper>
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Substância Interagente</TableHeaderCell>
                  <TableHeaderCell>Tipo de Interação</TableHeaderCell>
                  <TableHeaderCell>Severidade</TableHeaderCell>
                  <TableHeaderCell>Descrição</TableHeaderCell>
                  <TableHeaderCell>Evidência</TableHeaderCell>
                  <TableHeaderCell>Mecanismo</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {displayData.map((interaction, index) => (
                  <TableRow key={interaction.id || index}>
                    <TableCell>
                      <strong>{interaction.interactingSubstance}</strong>
                      {interaction.drugbankId && (
                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                          ID: {interaction.drugbankId}
                        </div>
                      )}
                      {interaction.searchType && (
                        <div style={{ fontSize: '10px', color: '#007bff', marginTop: '2px', fontStyle: 'italic' }}>
                          {interaction.searchType === 'cross_compound_search' ? 'Busca Direta' : 'Busca Reversa'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{interaction.interactionType}</TableCell>
                    <TableCell>
                      <Badge type={interaction.severity?.toLowerCase()}>
                        {interaction.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div style={{ maxWidth: '300px', lineHeight: '1.4' }}>
                        {interaction.description}
                        {interaction.management && interaction.management !== 'Consulte um profissional de saúde' && (
                          <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px', fontStyle: 'italic' }}>
                            <strong>Manejo:</strong> {interaction.management}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{interaction.evidence}</TableCell>
                    <TableCell>
                      <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                        {interaction.mechanism}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#6c757d', fontStyle: 'italic' }}>
            Dados fornecidos pela DrugBank API. Última atualização: {new Date().toLocaleDateString('pt-BR')}
            {isSpecificSearch && (
              <div style={{ marginTop: '4px' }}>
                Busca específica entre dois compostos realizada em {new Date().toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        </>
      );
    }

    const message = crossSearchResults !== null 
      ? `Interações entre "${compoundName}" e "${secondCompound}": (0)`
      : 'Drug-Drug Interactions: (0)';
    
    return (
      <EmptyState>
        {message}
        <br />
        <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '8px', display: 'block' }}>
          Nenhuma interação encontrada na base DrugBank
        </small>
      </EmptyState>
    );
  };

  return (
    <TableContainer>
      <SectionTitle>
        🧬 Drug-Drug Interactions
      </SectionTitle>
      
      <FilterContainer>
        <FilterTitle>
          🔍 Busca Específica de Interações entre Dois Compostos
        </FilterTitle>
        <InputGroup>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '14px', color: '#495057', whiteSpace: 'nowrap' }}>
              {compoundName || 'Composto Principal'}
            </span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>×</span>
            <DrugBankAutocomplete
              placeholder="Digite o segundo medicamento (ex: aspirin, warfarin)"
              value={secondCompound}
              onChange={setSecondCompound}
              onSelect={(suggestion) => {
                console.log('🎯 Medicamento selecionado:', suggestion);
                setSecondCompound(suggestion.name || suggestion.highlight || suggestion.id);
              }}
              onKeyPress={handleKeyPress}
              disabled={isCrossSearching}
              region="us"
              fuzzy={true}
              debounceMs={400}
            />
          </div>
          <SearchButton 
            onClick={handleCrossSearch}
            disabled={isCrossSearching || !secondCompound.trim()}
          >
            {isCrossSearching ? 'Buscando...' : 'Buscar Interações'}
          </SearchButton>
          {(crossSearchResults !== null || crossSearchError) && (
            <ClearButton onClick={handleClearSearch}>
              Limpar
            </ClearButton>
          )}
        </InputGroup>
      </FilterContainer>
      
      {renderContent()}
    </TableContainer>
  );
};

export default DrugInteractionsTable;