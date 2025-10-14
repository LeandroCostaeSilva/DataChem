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
  gap: 12px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.07);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
    font-size: 16px;
    min-height: 56px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 18px;
    border-radius: 10px;
    min-height: 52px;
  }
`;

const SearchButton = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    padding: 18px 32px;
    font-size: 16px;
    min-height: 56px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 16px 28px;
    border-radius: 10px;
    font-size: 15px;
    min-height: 52px;
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  max-height: 320px;
  overflow-y: auto;
  z-index: 9999;
  margin-top: 8px;
  -webkit-overflow-scrolling: touch;
  animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    max-height: 280px;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 480px) {
    max-height: 240px;
    margin-top: 6px;
  }
`;

const SuggestionItem = styled.div`
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #ffffff;
    transform: translateX(4px);
  }
  
  &:active {
    background: rgba(59, 130, 246, 0.2);
  }

  &:last-child {
    border-bottom: none;
  }

  &.highlighted {
    background: rgba(59, 130, 246, 0.15);
    color: #ffffff;
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
    font-size: 16px;
    min-height: 56px;
    display: flex;
    align-items: center;
  }
  
  @media (max-width: 480px) {
    padding: 16px 18px;
    font-size: 15px;
    min-height: 52px;
  }
`;

const LoadingText = styled.div`
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
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
    
    // Verificar se onSearch existe antes de chamar
    if (typeof onSearch === 'function') {
      onSearch(term);
    } else {
      console.error('onSearch não é uma função:', onSearch);
    }
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
          placeholder="Digite o nome químico ou insira a numeração CAS"
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