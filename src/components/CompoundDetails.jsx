import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdverseReactionsTable from './AdverseReactionsTable';
import DrugInteractionsTable from './DrugInteractionsTable';
import { generateDrugInteractions, formatInteractionsResponse, testPerplexityAPI } from '../services/perplexityService';

const DetailsContainer = styled.div`
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 32px;
  margin-top: 32px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
  }
`;

const CompoundHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    border-radius: 1px;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-bottom: 20px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
    padding-bottom: 16px;
    gap: 12px;
  }
`;

const CompoundInfo = styled.div`
  flex: 1;
`;

const CompoundTitle = styled.h2`
  color: #ffffff;
  margin: 0 0 12px 0;
  font-size: 28px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin: 0 0 10px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 22px;
    margin: 0 0 8px 0;
  }
`;

const CompoundSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 15px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  word-break: break-word;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const StructureContainer = styled.div`
  flex-shrink: 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  @media (min-width: 768px) {
    width: 300px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const StructureImage = styled.img`
  max-width: 100%;
  height: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    border-radius: 8px;
  }
`;

const ImageError = styled.div`
  width: 100%;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-style: italic;
  text-align: center;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    height: 180px;
    border-radius: 10px;
    font-size: 14px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    height: 160px;
    border-radius: 8px;
    font-size: 13px;
    padding: 12px;
  }
`;

const PropertiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const PropertyCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const PropertyLabel = styled.h3`
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  font-size: 13px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin: 0 0 10px 0;
    letter-spacing: 0.8px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    margin: 0 0 8px 0;
    letter-spacing: 0.6px;
  }
`;

const PropertyValue = styled.p`
  color: #ffffff;
  margin: 0;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const SynonymsContainer = styled.div`
  margin-top: 32px;
  
  @media (max-width: 768px) {
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    margin-top: 20px;
  }
`;

const SynonymsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const SynonymsTitle = styled.h3`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 17px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;

  &:hover {
    background-color: #f8f9fa;
  }
  
  &:active {
    background-color: #e9ecef;
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
    min-height: 48px;
    border-radius: 6px;
  }
`;

const SynonymsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const SynonymTag = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 13px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 12px;
  }
`;

const NoDataMessage = styled.div`
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #007bff;
  font-size: 18px;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    font-size: 17px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 16px;
  }
`;

const ErrorContainer = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 6px;
    margin-top: 20px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 4px;
    margin-top: 16px;
    font-size: 14px;
  }
`;

const InteractionsButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 24px 0;
  width: 100%;
  max-width: 400px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #d3d3d3;
    color: #888;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:disabled:hover {
    background: #d3d3d3;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 15px;
    margin: 20px 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
    margin: 16px 0;
  }
`;

const InteractionsContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #007bff;
`;

const InteractionsTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InteractionsContent = styled.div`
  background: white;
  border-radius: 6px;
  padding: 16px;
  line-height: 1.6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  color: #333;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  
  /* Estilos para tabelas */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  th {
    background-color: #f8f9fa !important;
    border: 1px solid #dee2e6 !important;
    padding: 12px !important;
    text-align: left !important;
    font-weight: 600 !important;
    color: #495057 !important;
    font-size: 12px !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    border: 1px solid #dee2e6 !important;
    padding: 12px !important;
    vertical-align: top !important;
    font-size: 13px !important;
    line-height: 1.4;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: #e3f2fd;
  }
  
  /* Estilos para referências */
  h2, h3 {
    color: #2c3e50;
    margin: 24px 0 12px 0;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 8px;
  }
  
  h2 {
    font-size: 16px;
  }
  
  h3 {
    font-size: 14px;
  }
  
  /* Estilos para parágrafos */
  p {
    margin: 12px 0;
    line-height: 1.6;
  }
  
  /* Estilos para listas */
  ul, ol {
    margin: 12px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 6px 0;
    line-height: 1.5;
  }
  
  /* Estilos para texto em negrito e itálico */
  strong {
    font-weight: 600;
    color: #2c3e50;
  }
  
  em {
    font-style: italic;
    color: #6c757d;
  }
`;

const InteractionsError = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 12px;
  margin: 16px 0;
`;

const InteractionsMetadata = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 12px;
  text-align: right;
`;

const CompoundDetails = ({ compoundData, isLoading, error }) => {
  const [showAllSynonyms, setShowAllSynonyms] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [interactionsData, setInteractionsData] = useState(null);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  const [interactionsError, setInteractionsError] = useState(null);

  // Limpar dados das interações quando o composto muda
  useEffect(() => {
    setInteractionsData(null);
    setInteractionsError(null);
    setIsLoadingInteractions(false);
  }, [compoundData?.cid, compoundData?.name]);

  const handleGenerateInteractions = async () => {
    if (!compoundData?.name) {
      setInteractionsError('Nome do composto não disponível');
      return;
    }

    setIsLoadingInteractions(true);
    setInteractionsError(null);
    setInteractionsData(null);

    try {
      // Primeiro, testar se a API está funcionando
      console.log('🧪 Testando API Perplexity primeiro...');
      await testPerplexityAPI();
      console.log('✅ API teste passou, gerando interações...');
      
      const response = await generateDrugInteractions(compoundData.name);
      const formattedData = formatInteractionsResponse(response);
      
      // Debug: verificar dados de metadata
      console.log('🔍 Dados formatados recebidos da API:', formattedData);
      
      // Verificar se houve erro na formatação
      if (!formattedData.success) {
        throw new Error(formattedData.error || 'Erro ao processar resposta da API');
      }
      
      setInteractionsData(formattedData);
    } catch (error) {
      console.error('Erro ao gerar interações:', error);
      setInteractionsError(error.message || 'Erro ao gerar dados de interações');
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <div>🔍 Buscando dados do composto...</div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <strong>Erro:</strong> {error}
      </ErrorContainer>
    );
  }

  if (!compoundData) {
    return (
      <NoDataMessage>
        Digite o nome de um composto químico e clique em "Pesquisar" para ver os detalhes.
      </NoDataMessage>
    );
  }

  const {
    name,
    iupacName,
    molecularFormula,
    molecularWeight,
    casNumber,
    synonyms,
    smiles,
    imageURL,
    cid,
    adverseReactions
  } = compoundData;

  const displayedSynonyms = showAllSynonyms ? synonyms : synonyms.slice(0, 10);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <DetailsContainer>
      <CompoundHeader>
        <CompoundInfo>
          <CompoundTitle>{name}</CompoundTitle>
          <CompoundSubtitle>PubChem CID: {cid}</CompoundSubtitle>
        </CompoundInfo>
        
        <StructureContainer>
          {!imageError ? (
            <StructureImage
              src={imageURL}
              alt={`Estrutura molecular de ${name}`}
              onError={handleImageError}
            />
          ) : (
            <ImageError>
              Estrutura 2D não disponível
            </ImageError>
          )}
        </StructureContainer>
      </CompoundHeader>

      <PropertiesGrid>
        <PropertyCard>
          <PropertyLabel>Nome IUPAC</PropertyLabel>
          <PropertyValue>{iupacName}</PropertyValue>
        </PropertyCard>

        <PropertyCard>
          <PropertyLabel>Fórmula Molecular</PropertyLabel>
          <PropertyValue>{molecularFormula}</PropertyValue>
        </PropertyCard>

        <PropertyCard>
          <PropertyLabel>Peso Molecular</PropertyLabel>
          <PropertyValue>
            {molecularWeight !== 'Não disponível' 
              ? `${parseFloat(molecularWeight).toFixed(2)} g/mol`
              : molecularWeight
            }
          </PropertyValue>
        </PropertyCard>

        <PropertyCard>
          <PropertyLabel>Número CAS</PropertyLabel>
          <PropertyValue>{casNumber}</PropertyValue>
        </PropertyCard>

        <PropertyCard style={{ gridColumn: '1 / -1' }}>
          <PropertyLabel>SMILES Canônico</PropertyLabel>
          <PropertyValue style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {smiles}
          </PropertyValue>
        </PropertyCard>
      </PropertiesGrid>

      {synonyms && synonyms.length > 0 && (
        <SynonymsContainer>
          <SynonymsHeader>
            <SynonymsTitle>
              Sinonímias ({synonyms.length})
            </SynonymsTitle>
            {synonyms.length > 10 && (
              <ShowMoreButton
                onClick={() => setShowAllSynonyms(!showAllSynonyms)}
              >
                {showAllSynonyms ? 'Mostrar menos' : 'Mostrar todos'}
              </ShowMoreButton>
            )}
          </SynonymsHeader>
          
          <SynonymsList>
            {displayedSynonyms.map((synonym, index) => (
              <SynonymTag key={index}>
                {synonym}
              </SynonymTag>
            ))}
          </SynonymsList>
        </SynonymsContainer>
      )}

      <InteractionsButton 
        onClick={handleGenerateInteractions}
        disabled={isLoadingInteractions}
      >
        {isLoadingInteractions ? '🔄 Gerando interações...' : 'Gerar dados de interações com outros fármacos'}
      </InteractionsButton>

      {interactionsError && (
        <InteractionsError>
          <strong>Erro:</strong> {interactionsError}
        </InteractionsError>
      )}

      {interactionsData && (
        <DrugInteractionsTable 
          interactionsData={interactionsData}
          compoundName={name}
        />
      )}

      <AdverseReactionsTable 
        adverseReactions={adverseReactions}
        isLoading={isLoading}
        compoundName={name}
      />
    </DetailsContainer>
  );
};

export default CompoundDetails;