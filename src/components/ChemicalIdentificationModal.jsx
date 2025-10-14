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
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.1);
  transform: ${props => props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 32px;
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

  @media (max-width: 480px) {
    padding: 24px;
    margin: 16px;
    max-width: calc(100vw - 32px);
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
  color: #fca5a5;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.1);
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
  text-align: center;
  margin-bottom: 32px;
  padding-right: 60px;

  @media (max-width: 480px) {
    padding-right: 50px;
    margin-bottom: 24px;
  }
`;

const ModalIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  font-size: 36px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background: rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 480px) {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 20px;
  }
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
`;

const ModalSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ModalBody = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 1.05rem;

  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const ContentText = styled.p`
  margin: 0 0 24px 0;
  text-align: justify;

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const HighlightBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  }

  @media (max-width: 480px) {
    padding: 20px;
    margin-top: 20px;
  }
`;

const HighlightText = styled.p`
  margin: 0;
  color: #93c5fd;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ChemicalIdentificationModal = ({ isOpen, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent $isOpen={isOpen}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalHeader>
          <ModalIcon>🧪</ModalIcon>
          <ModalTitle>Identificação de Compostos Químicos</ModalTitle>
          <ModalSubtitle>Sistema Integrado PubChem</ModalSubtitle>
        </ModalHeader>

        <ModalBody>
          <ContentText>
            Ao digitar o nome químico ou CAS number da substância, o sistema abrirá a funcionalidade autocomplete da PubChem. O usuário escolhe o composto, seleciona e clica em pesquisar. Assim, o sistema buscará os dados de identificação através da API oficial da plataforma totalmente integrada.
          </ContentText>
          
          <ContentText>
            Serão apresentados o nome IUPAC, numeração CAS, fórmula molecular e estrutural (2D) além das sinonímias conhecidas.
          </ContentText>

          <HighlightBox>
            <HighlightText>
              Uma gigantesca enciclopédia online sobre moléculas químicas e suas atividades biológicas.
            </HighlightText>
          </HighlightBox>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChemicalIdentificationModal;