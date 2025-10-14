import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    padding: 32px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 12px;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding-bottom: 20px;
    gap: 12px;
  }
`;

const ModalIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 24px;
    border-radius: 12px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const ModalBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50px;
  padding: 6px 12px;
  margin-bottom: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #fca5a5;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &::before {
    content: '🔗';
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 5px 10px;
    margin-bottom: 20px;
  }
`;

const ModalText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 24px;
  text-align: justify;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
  }
`;

const HighlightBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  position: relative;

  &::before {
    content: '💡';
    position: absolute;
    top: -8px;
    left: 16px;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin: 20px 0;
  }
`;

const HighlightText = styled.p`
  color: #93c5fd;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const FeaturesList = styled.div`
  display: grid;
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 480px) {
    gap: 12px;
    margin: 20px 0;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 10px;
  }
`;

const FeatureIcon = styled.div`
  width: 24px;
  height: 24px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
`;

const FeatureText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const AdverseEventsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalHeader>
          <ModalIcon>⚠️</ModalIcon>
          <div>
            <ModalBadge>FDA Integration</ModalBadge>
            <ModalTitle>Detecção de Eventos Adversos</ModalTitle>
          </div>
        </ModalHeader>

        <ModalText>
          O DataChem possui integração em tempo real com o banco de dados do FDA via API 
          disponibilizada para as requisições com alta eficiência. Há uma função implementada 
          em nosso código que filtra todos os medicamentos contendo aquela substância ativa 
          objeto da pesquisa do usuário e apresenta esses dados instantaneamente.
        </ModalText>

        <FeaturesList>
          <FeatureItem>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureText>
              <strong>Classificação de Severidade:</strong> Análise automática do nível de 
              gravidade dos eventos adversos reportados.
            </FeatureText>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureText>
              <strong>Dados Demográficos:</strong> Informações sobre idade do paciente e 
              características relevantes dos casos reportados.
            </FeatureText>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>💊</FeatureIcon>
            <FeatureText>
              <strong>Informações do Medicamento:</strong> Nome comercial, fabricante e 
              detalhes específicos do produto objeto da notificação.
            </FeatureText>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureText>
              <strong>Filtragem Inteligente:</strong> Busca automática por substância ativa 
              com resultados instantâneos e precisos.
            </FeatureText>
          </FeatureItem>
        </FeaturesList>

        <HighlightBox>
          <HighlightText>
            <strong>Importante:</strong> Por definição conceitual, não há relação de causalidade 
            estabelecida tratando-se de Eventos Adversos aos medicamentos descritos. Isso irá 
            depender do aprofundamento da investigação clínica de cada caso que não será aqui detalhada.
          </HighlightText>
        </HighlightBox>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AdverseEventsModal;