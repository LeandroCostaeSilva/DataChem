import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { medicationSearchAutocomplete } from '../services/drugbankService';

const AutocompleteContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 150px;
  }
  
  @media (max-width: 480px) {
    min-width: auto;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #6c757d;
  }
  
  &:disabled {
    background-color: #e9ecef;
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 480px) {
    max-height: 200px;
  }
`;

const SuggestionItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.highlighted {
    background-color: #e3f2fd;
  }
  
  .drug-name {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 2px;
  }
  
  .drug-id {
    font-size: 11px;
    color: #6c757d;
    font-family: monospace;
  }
  
  .drug-highlight {
    background-color: #fff3cd;
    padding: 1px 2px;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 7px 8px;
    font-size: 12px;
  }
`;

const LoadingIndicator = styled.div`
  padding: 12px;
  color: #007bff;
  font-style: italic;
  font-size: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &::before {
    content: '🔍';
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 8px;
  }
`;

const NoSuggestions = styled.div`
  padding: 12px;
  color: #6c757d;
  font-style: italic;
  font-size: 14px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 8px;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  color: #dc3545;
  font-size: 13px;
  text-align: center;
  background-color: #f8d7da;
  border-radius: 4px;
  margin: 4px;
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px;
  }
`;

const DrugBankAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  disabled = false,
  onKeyPress = () => {},
  debounceMs = 400,
  region = 'us',
  fuzzy = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Função para buscar sugestões usando o Medication Search Plugin
  const fetchSuggestions = async (query) => {
    console.log(`🔍 DrugBank Autocomplete: fetchSuggestions chamada com query="${query}"`);
    
    if (!query || query.length < 2) {
      console.log(`⚠️ Query muito curta ou vazia: "${query}"`);
      setSuggestions([]);
      setShowSuggestions(false);
      setError('');
      return;
    }

    console.log(`🚀 Iniciando busca para: "${query}"`);
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`🔍 DrugBank Autocomplete: Buscando "${query}" com região=${region}, fuzzy=${fuzzy}`);
      const results = await medicationSearchAutocomplete(query, region, fuzzy, true);
      
      console.log(`📋 DrugBank Autocomplete: ${results.length} resultados encontrados:`, results);
      
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setHighlightedIndex(-1);
      
      if (results.length === 0) {
        console.log(`⚠️ Nenhum resultado encontrado para "${query}"`);
        setError('Nenhum medicamento encontrado na base DrugBank');
      } else {
        console.log(`✅ ${results.length} sugestões carregadas com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro no DrugBank Autocomplete:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setError('Erro ao buscar medicamentos. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log(`🏁 Busca finalizada para "${query}"`);
    }
  };

  // Debounce para busca
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery !== value) {
        setSearchQuery(value);
        fetchSuggestions(value);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, debounceMs, region, fuzzy]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setError('');
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedValue = suggestion.name || suggestion.highlight || suggestion.id;
    onChange(selectedValue);
    onSelect(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setError('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onKeyPress(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          onKeyPress(e);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setError('');
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const renderSuggestionContent = (suggestion) => {
    const displayName = suggestion.name || suggestion.highlight || suggestion.id;
    const drugbankId = suggestion.drugbank_id || suggestion.id;
    
    return (
      <div>
        <div className="drug-name">
          {suggestion.highlight ? (
            <span dangerouslySetInnerHTML={{ __html: suggestion.highlight }} />
          ) : (
            displayName
          )}
        </div>
        {drugbankId && (
          <div className="drug-id">
            DrugBank ID: {drugbankId}
          </div>
        )}
      </div>
    );
  };

  return (
    <AutocompleteContainer ref={containerRef}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyPress={onKeyPress}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showSuggestions && (
        <SuggestionsDropdown>
          {isLoading ? (
            <LoadingIndicator>Buscando medicamentos na DrugBank...</LoadingIndicator>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={`${suggestion.id || suggestion.drugbank_id || index}`}
                className={index === highlightedIndex ? 'highlighted' : ''}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {renderSuggestionContent(suggestion)}
              </SuggestionItem>
            ))
          ) : (
            <NoSuggestions>Nenhum medicamento encontrado</NoSuggestions>
          )}
        </SuggestionsDropdown>
      )}
    </AutocompleteContainer>
  );
};

export default DrugBankAutocomplete;