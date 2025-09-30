import React, { useState } from 'react';
import styled from 'styled-components';
import DrugInteractionsTable from './DrugInteractionsTable';

const DetailsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-top: 24px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  
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

const CompoundHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding-bottom: 16px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
    gap: 8px;
  }
`;

const CompoundInfo = styled.div`
  flex: 1;
`;

const CompoundTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
  
  @media (max-width: 768px) {
    font-size: 22px;
    margin: 0 0 6px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    margin: 0 0 4px 0;
  }
`;

const CompoundSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const StructureContainer = styled.div`
  flex-shrink: 0;
  text-align: center;

  @media (min-width: 768px) {
    width: 300px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    max-width: 240px;
  }
`;

const StructureImage = styled.img`
  max-width: 100%;
  height: auto;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

const ImageError = styled.div`
  width: 100%;
  height: 200px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 16px;
  
  @media (max-width: 768px) {
    height: 180px;
    border-radius: 6px;
    font-size: 14px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    height: 160px;
    border-radius: 4px;
    font-size: 13px;
    padding: 8px;
  }
`;

const PropertiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const PropertyCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 4px;
  }
`;

const PropertyLabel = styled.h3`
  color: #495057;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin: 0 0 6px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin: 0 0 4px 0;
    letter-spacing: 0.3px;
  }
`;

const PropertyValue = styled.p`
  color: #2c3e50;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const SynonymsContainer = styled.div`
  margin-top: 24px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    margin-top: 16px;
  }
`;

const SynonymsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const SynonymsTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  
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

const CompoundDetails = ({ compoundData, isLoading, error }) => {
  const [showAllSynonyms, setShowAllSynonyms] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    drugInteractions
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
              Sinônimos ({synonyms.length})
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

      <DrugInteractionsTable 
        drugInteractions={drugInteractions}
        isLoading={isLoading}
      />
    </DetailsContainer>
  );
};

export default CompoundDetails;