import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    color: #495057;
  }
`;

const SourceSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #495057;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SourceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SourceItem = styled.li`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SourceTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
`;

const SourceLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
    color: #0056b3;
  }
`;

const SourceDate = styled.span`
  color: #6c757d;
  font-size: 14px;
  margin-left: 8px;
`;

const SourceDescription = styled.p`
  margin: 8px 0 0 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
`;

const MetadataSection = styled.div`
  background: #e3f2fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
`;

const MetadataTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #1976d2;
  font-size: 16px;
  font-weight: 600;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  color: #424242;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
`;

const SourcesModal = ({ isOpen, onClose, sourcesData, metadata }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Debug: verificar dados recebidos no modal
  console.log('🔍 SourcesModal - isOpen:', isOpen);
  console.log('🔍 SourcesModal - sourcesData recebido:', sourcesData);
  console.log('🔍 SourcesModal - metadata recebido:', metadata);

  // Processar dados de fontes - verificar múltiplas estruturas possíveis
  const processedSources = metadata?.search_results || sourcesData?.search_results || [];
  const citations = metadata?.citations || sourcesData?.citations || [];
  const relatedQuestions = metadata?.related_questions || sourcesData?.related_questions || [];

  console.log('🔍 SourcesModal - processedSources:', processedSources);
  console.log('🔍 SourcesModal - citations:', citations);
  console.log('🔍 SourcesModal - relatedQuestions:', relatedQuestions);

  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            📚 Fontes Bibliográficas Consultadas
          </ModalTitle>
          <CloseButton onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        {processedSources.length > 0 && (
          <SourceSection>
            <SectionTitle>
              🔍 Fontes de Pesquisa ({processedSources.length})
            </SectionTitle>
            <SourceList>
              {processedSources.map((source, index) => (
                <SourceItem key={index}>
                  <SourceTitle>
                    <SourceLink 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {source.title || `Fonte ${index + 1}`}
                    </SourceLink>
                    {source.date && (
                      <SourceDate>
                        📅 {source.date}
                      </SourceDate>
                    )}
                  </SourceTitle>
                  {source.snippet && (
                    <SourceDescription>
                      {source.snippet}
                    </SourceDescription>
                  )}
                </SourceItem>
              ))}
            </SourceList>
          </SourceSection>
        )}

        {citations.length > 0 && (
          <SourceSection>
            <SectionTitle>
              📖 Citações ({citations.length})
            </SectionTitle>
            <SourceList>
              {citations.map((citation, index) => (
                <SourceItem key={index}>
                  <SourceDescription>
                    "{citation}"
                  </SourceDescription>
                </SourceItem>
              ))}
            </SourceList>
          </SourceSection>
        )}

        {relatedQuestions.length > 0 && (
          <SourceSection>
            <SectionTitle>
              ❓ Perguntas Relacionadas ({relatedQuestions.length})
            </SectionTitle>
            <SourceList>
              {relatedQuestions.map((question, index) => (
                <SourceItem key={index}>
                  <SourceDescription>
                    {question}
                  </SourceDescription>
                </SourceItem>
              ))}
            </SourceList>
          </SourceSection>
        )}

        {metadata && (
          <MetadataSection>
            <MetadataTitle>
              📊 Metadados da Pesquisa
            </MetadataTitle>
            {metadata.model && (
              <MetadataItem>
                <span>🤖 Modelo utilizado:</span>
                <span>{metadata.model}</span>
              </MetadataItem>
            )}
            {metadata.usage?.total_tokens && (
              <MetadataItem>
                <span>🔢 Tokens utilizados:</span>
                <span>{metadata.usage.total_tokens}</span>
              </MetadataItem>
            )}
            {metadata.timestamp && (
              <MetadataItem>
                <span>⏰ Data da consulta:</span>
                <span>{new Date(metadata.timestamp).toLocaleString('pt-BR')}</span>
              </MetadataItem>
            )}
            {metadata.statistics?.wordCount && (
              <MetadataItem>
                <span>📝 Palavras no resultado:</span>
                <span>{metadata.statistics.wordCount}</span>
              </MetadataItem>
            )}
          </MetadataSection>
        )}

        {processedSources.length === 0 && citations.length === 0 && relatedQuestions.length === 0 && (
          <EmptyState>
            <h3>📚 Nenhuma fonte disponível</h3>
            <p>Não foram encontradas fontes bibliográficas para esta consulta.</p>
          </EmptyState>
        )}
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default SourcesModal;