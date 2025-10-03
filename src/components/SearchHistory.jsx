import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSearchHistory, getRecentSearches } from '../services/firebaseService';

const HistoryContainer = styled.div`
  /* Container simplificado para uso dentro do Sidebar */
`;

const HistoryTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const CompoundInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CompoundName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

const SearchTerm = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
`;

const MolecularInfo = styled.span`
  font-size: 0.8rem;
  color: #495057;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: #868e96;
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 20px;
  font-style: italic;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 20px;
  font-style: italic;
`;

const ToggleButton = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: #34495e;
  }
`;

const SearchHistory = ({ onSelectSearch }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRecent, setShowRecent] = useState(true);

  useEffect(() => {
    if (isExpanded) {
      loadHistory();
    } else {
      loadRecentSearches();
    }
  }, [isExpanded, showRecent]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getSearchHistory(20);
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentSearches = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentSearches();
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar pesquisas recentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      // ISO string
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleItemClick = (item) => {
    if (onSelectSearch) {
      onSelectSearch(item.searchTerm);
    }
  };

  return (
    <HistoryContainer>
      {isLoading ? (
        <LoadingMessage>Carregando histórico...</LoadingMessage>
      ) : history.length === 0 ? (
        <EmptyMessage>
          Nenhuma pesquisa realizada ainda. Faça sua primeira busca!
        </EmptyMessage>
      ) : (
        <HistoryList>
          {history.map((item) => (
            <HistoryItem 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              title="Clique para pesquisar novamente"
            >
              <CompoundInfo>
                <CompoundName>{item.compoundName || 'Nome não disponível'}</CompoundName>
                <SearchTerm>Termo: "{item.searchTerm}"</SearchTerm>
                {item.molecularFormula && (
                  <MolecularInfo>
                    {item.molecularFormula} | {item.molecularWeight} g/mol
                  </MolecularInfo>
                )}
              </CompoundInfo>
              <Timestamp>
                {formatTimestamp(item.timestamp || item.createdAt)}
              </Timestamp>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </HistoryContainer>
  );
};

export default SearchHistory;