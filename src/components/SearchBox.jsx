import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getAutocompleteSuggestions, isValidSearchTerm } from '../services/pubchemService';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px; /* Evita zoom no iOS */
    min-height: 44px; /* Tamanho mínimo recomendado para touch */
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    border-radius: 6px;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  &:active:not(:disabled) {
    background-color: #004085;
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 14px 24px;
    font-size: 16px;
    min-height: 44px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 15px;
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    max-height: 250px;
    border-radius: 6px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 480px) {
    max-height: 200px;
    margin-top: 2px;
  }
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;

  &:hover {
    background-color: #f8f9fa;
  }
  
  &:active {
    background-color: #e9ecef;
  }

  &:last-child {
    border-bottom: none;
  }

  &.highlighted {
    background-color: #e3f2fd;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 15px;
  }
`;

const LoadingText = styled.div`
  padding: 12px 16px;
  color: #6c757d;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
`;

const SearchBox = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState('');
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Função para buscar sugestões com debounce
  const fetchSuggestions = async (query) => {
    if (!isValidSearchTerm(query)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setError('');

    try {
      const results = await getAutocompleteSuggestions(query);
      console.log('Sugestões recebidas:', results); // Debug
      setSuggestions(results.slice(0, 10)); // Limitar a 10 sugestões
      setShowSuggestions(results.length > 0);
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      setError('Erro ao carregar sugestões');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Effect para debounce das sugestões
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Função para lidar com mudanças no input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setHighlightedIndex(-1);
    setError('');
  };

  // Função para lidar com teclas pressionadas
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Função para selecionar uma sugestão
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  // Função para realizar a busca
  const handleSearch = () => {
    const term = searchTerm.trim();
    
    if (!isValidSearchTerm(term)) {
      setError('Por favor, digite pelo menos 2 caracteres para buscar');
      return;
    }

    setError('');
    setShowSuggestions(false);
    onSearch(term);
  };

  // Função para lidar com clique fora do componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SearchContainer ref={suggestionsRef}>
      <SearchInputContainer>
        <SearchInput
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite o nome de um composto químico (ex: aspirin, glucose, caffeine)..."
          disabled={isLoading}
        />
        <SearchButton
          onClick={handleSearch}
          disabled={isLoading || !isValidSearchTerm(searchTerm.trim())}
        >
          {isLoading ? 'Buscando...' : 'Pesquisar'}
        </SearchButton>
      </SearchInputContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {showSuggestions && (
        <SuggestionsContainer>
          {isLoadingSuggestions ? (
            <LoadingText>Carregando sugestões...</LoadingText>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                className={index === highlightedIndex ? 'highlighted' : ''}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {suggestion}
              </SuggestionItem>
            ))
          ) : (
            <LoadingText>Nenhuma sugestão encontrada</LoadingText>
          )}
        </SuggestionsContainer>
      )}
    </SearchContainer>
  );
};

export default SearchBox;