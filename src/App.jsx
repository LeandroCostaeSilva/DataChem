import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import SearchBox from './components/SearchBox';
import CompoundDetails from './components/CompoundDetails';
import Sidebar from './components/Sidebar';
import CacheTestPanel from './components/CacheTestPanel';
import AdverseEventsModal from './components/AdverseEventsModal';
import ChemicalIdentificationModal from './components/ChemicalIdentificationModal';


import { getCompoundData } from './services/pubchemService';
import { saveSearchToHistory } from './services/firebaseService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 100vh;
    min-height: -webkit-fill-available; /* iOS Safari fix */
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 48px;
  color: white;
  padding: 24px 0;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
    padding: 20px 0;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding: 16px 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Logo = styled.img`
  height: 70px;
  width: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  border-radius: 12px;
  transition: transform 0.3s ease, filter 0.3s ease;

  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5));
  }

  @media (max-width: 768px) {
    height: 60px;
  }
  
  @media (max-width: 480px) {
    height: 50px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
  color: #e2e8f0;
  letter-spacing: 0.025em;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0 8px;
    line-height: 1.7;
  }
  
  @media (max-width: 360px) {
    font-size: 0.95rem;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const PromoSection = styled.section`
  text-align: center;
  margin-bottom: 48px;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding: 0 12px;
  }
`;

const PromoTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50px;
  padding: 8px 16px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #60a5fa;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }
  
  &::before {
    content: '⚗️';
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 14px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 12px;
    margin-bottom: 16px;
  }
`;

const PromoTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  
  .highlight {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
  }
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
    margin: 0 0 20px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 2.2rem;
    margin: 0 0 16px 0;
    line-height: 1.2;
  }
  
  @media (max-width: 360px) {
    font-size: 1.9rem;
  }
`;

const PromoDescription = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 auto 32px auto;
  max-width: 800px;
  font-weight: 400;
  letter-spacing: 0.01em;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin: 0 auto 24px auto;
    max-width: 600px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin: 0 auto 20px auto;
    line-height: 1.7;
  }
`;



const SearchTitle = styled.h2`
  color: #f1f5f9;
  text-align: center;
  margin: 0 0 32px 0;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin: 0 0 24px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin: 0 0 20px 0;
  }
`;

const FeaturesSection = styled.section`
  margin: 48px 0;
  
  @media (max-width: 768px) {
    margin: 36px 0;
  }
  
  @media (max-width: 480px) {
    margin: 28px 0;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FeatureCard = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.gradient};
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 28px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 8px;
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 24px;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 0 0 10px 0;
  }
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin: 0 0 16px 0;
  }
`;

const FeatureLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #60a5fa;
    transform: translateX(2px);
  }
  
  &::after {
    content: '→';
    transition: transform 0.2s ease;
  }
  
  &:hover::after {
    transform: translateX(2px);
  }
`;

const FeatureBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.background};
  color: ${props => props.color};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  
  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    font-size: 0.7rem;
    padding: 3px 6px;
  }
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 64px;
  padding: 32px 20px;
  color: #cbd5e1;
  font-size: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px 16px 0 0;
  
  @media (max-width: 768px) {
    margin-top: 48px;
    padding: 24px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    margin-top: 32px;
    padding: 20px 12px;
    font-size: 12px;
    line-height: 1.6;
  }
`;

const FooterLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    color: #60a5fa;
    text-decoration: underline;
  }
`;

const FooterText = styled.p`
  margin: 8px 0;
  opacity: 0.8;
  line-height: 1.5;
`;

function App() {
  const [compoundData, setCompoundData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdverseEventsModalOpen, setIsAdverseEventsModalOpen] = useState(false);
  const [isChemicalIdentificationModalOpen, setIsChemicalIdentificationModalOpen] = useState(false);
  
  // Ref para a seção de resultados
  const resultsRef = useRef(null);
  
  // Função para rolar automaticamente para a seção de resultados
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    setError('');
    setCompoundData(null);

    try {
      const data = await getCompoundData(searchTerm);
      setCompoundData(data);
      
      // Rolar automaticamente para a seção de resultados após carregar os dados
      setTimeout(() => {
        scrollToResults();
      }, 100); // Pequeno delay para garantir que o componente seja renderizado
      
      // Salvar pesquisa bem-sucedida no Firebase
      try {
        await saveSearchToHistory({
          searchTerm: searchTerm,
          compoundName: data.name,
          cid: data.cid,
          compoundData: data
        });
        console.log('Pesquisa salva no histórico do Firebase');
      } catch (firebaseError) {
        console.warn('Erro ao salvar no Firebase (não crítico):', firebaseError);
        // Não interrompe a aplicação se o Firebase falhar
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(
        err.message === 'Composto não encontrado'
          ? `Composto "${searchTerm}" não foi encontrado. Tente usar um nome diferente ou verifique a ortografia.`
          : 'Erro ao buscar dados do composto. Tente novamente em alguns instantes.'
      );
      
      // Rolar para a seção de resultados mesmo em caso de erro para mostrar a mensagem
      setTimeout(() => {
        scrollToResults();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (searchTerm) => {
    handleSearch(searchTerm);
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo src="/logo.svg" alt="DataChem - Chemical Data Platform" />
        </HeaderContent>
      </Header>

      <CacheTestPanel />
      <Sidebar onSelectSearch={handleHistorySelect} />

      <MainContent>
        <PromoSection>
          <PromoTag>
            Plataforma de Pesquisa Farmacêutica
          </PromoTag>
          <PromoTitle>
            Pesquisa avançada de <span className="highlight">substâncias ativas</span> de medicamentos
          </PromoTitle>
          <PromoDescription>
            Plataforma integrada de identificação de fármacos, pesquisa de Eventos Adversos no FDA database, interações medicamentosas e produtos de degradação associados à molécula, com tecnologia de AI Fine Tuning.
          </PromoDescription>
        </PromoSection>
        
        <div style={{ margin: '48px 0 32px 0', width: '100%' }}>
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </div>

        <FeaturesSection>
          <FeaturesGrid>
            <FeatureCard 
              gradient="linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
              onClick={() => setIsAdverseEventsModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <FeatureBadge background="rgba(239, 68, 68, 0.2)" color="#fca5a5">FDA Integration</FeatureBadge>
              <FeatureIcon background="rgba(239, 68, 68, 0.2)">⚠️</FeatureIcon>
              <FeatureTitle>Detecção de Eventos Adversos</FeatureTitle>
              <FeatureDescription>
                Análise em tempo real de Eventos Adversos notificados no Food and Drug Administration (FDA) com algoritmos avançados de detecção de padrões e correlações.
              </FeatureDescription>
              <FeatureLink href="#" onClick={(e) => { e.preventDefault(); setIsAdverseEventsModalOpen(true); }}>
                Saiba mais
              </FeatureLink>
            </FeatureCard>

            <FeatureCard 
              gradient="linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)"
              onClick={() => setIsChemicalIdentificationModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <FeatureBadge background="rgba(59, 130, 246, 0.2)" color="#93c5fd">PubChem API</FeatureBadge>
              <FeatureIcon background="rgba(59, 130, 246, 0.2)">🧪</FeatureIcon>
              <FeatureTitle>Identificação de Compostos Químicos</FeatureTitle>
              <FeatureDescription>
                Sistema com Integração eficiente com a PubChem database, mantida pelo Nacional Center for Biotechnology Information (NCBI) do Nacional Institutes of Health (NIH) dos Estados Unidos.
              </FeatureDescription>
              <FeatureLink href="#" onClick={(e) => { e.preventDefault(); setIsChemicalIdentificationModalOpen(true); }}>
                Saiba mais
              </FeatureLink>
            </FeatureCard>

            <FeatureCard gradient="linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)">
              <FeatureBadge background="rgba(139, 92, 246, 0.2)" color="#c4b5fd">AI Powered</FeatureBadge>
              <FeatureIcon background="rgba(139, 92, 246, 0.2)">🧬</FeatureIcon>
              <FeatureTitle>Interações entre Fármacos com IA</FeatureTitle>
              <FeatureDescription>
                Predição inteligente de interações medicamentosas utilizando modelos de machine learning e redes neurais profundas.
              </FeatureDescription>
              <FeatureLink href="#" onClick={(e) => e.preventDefault()}>
                Saiba mais
              </FeatureLink>
            </FeatureCard>

            <FeatureCard gradient="linear-gradient(90deg, #10b981 0%, #059669 100%)">
              <FeatureBadge background="rgba(16, 185, 129, 0.2)" color="#6ee7b7">Advanced Search</FeatureBadge>
              <FeatureIcon background="rgba(16, 185, 129, 0.2)">🧠</FeatureIcon>
              <FeatureTitle>Produtos de Degradação</FeatureTitle>
              <FeatureDescription>
                Busca avançada e análise preditiva de produtos de degradação com base em condições ambientais e tempo de armazenamento.
              </FeatureDescription>
              <FeatureLink style={{color: '#94a3b8', cursor: 'default'}} onClick={(e) => e.preventDefault()}>
                Em construção
              </FeatureLink>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        {(compoundData || isLoading || error) && (
          <div ref={resultsRef}>
            <CompoundDetails
              compoundData={compoundData}
              isLoading={isLoading}
              error={error}
            />

            
          </div>
        )}
      </MainContent>

      <Footer>
        <FooterText>
          Dados fornecidos por{' '}
          <FooterLink
            href="https://pubchem.ncbi.nlm.nih.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PubChem Database
          </FooterLink>
          {' '}- National Center for Biotechnology Information
        </FooterText>
        <FooterText>
          Desenvolvido com React + Vite | API PUG-REST
        </FooterText>
      </Footer>

      <AdverseEventsModal 
        isOpen={isAdverseEventsModalOpen}
        onClose={() => setIsAdverseEventsModalOpen(false)}
      />

      <ChemicalIdentificationModal 
        isOpen={isChemicalIdentificationModalOpen}
        onClose={() => setIsChemicalIdentificationModalOpen(false)}
      />
    </AppContainer>
  );
}

export default App;
