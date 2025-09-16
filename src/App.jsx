import React, { useState } from 'react';
import styled from 'styled-components';
import SearchBox from './components/SearchBox';
import CompoundDetails from './components/CompoundDetails';
import SearchHistory from './components/SearchHistory';
import { getCompoundData } from './services/pubchemService';
import { saveSearchToHistory } from './services/firebaseService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
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
  margin-bottom: 40px;
  color: white;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Logo = styled.img`
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 0 0 6px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin: 0 0 4px 0;
  }
  
  @media (max-width: 360px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0 4px;
    line-height: 1.5;
  }
  
  @media (max-width: 360px) {
    font-size: 0.85rem;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchSection = styled.section`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 12px;
  }
`;

const SearchTitle = styled.h2`
  color: #2c3e50;
  text-align: center;
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin: 0 0 20px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin: 0 0 16px 0;
  }
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  color: white;
  opacity: 0.8;
  font-size: 14px;
  
  @media (max-width: 768px) {
    margin-top: 24px;
    padding: 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    margin-top: 16px;
    padding: 12px 8px;
    font-size: 12px;
    line-height: 1.5;
  }
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

function App() {
  const [compoundData, setCompoundData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    setError('');
    setCompoundData(null);

    try {
      const data = await getCompoundData(searchTerm);
      setCompoundData(data);
      
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
          <Logo src="/logo.svg" alt="DataChem Logo" />
          <Title>DataChem</Title>
        </HeaderContent>
        <Subtitle>
          A busca inteligente por compostos químicos conectada à PubChem database - Base de dados integrante dos Institutos Nacionais de Saúde do governo dos Estados Unidos (NIH).
        </Subtitle>
      </Header>

      <MainContent>
        <SearchSection>
          <SearchTitle>Buscar Composto Químico</SearchTitle>
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </SearchSection>

        <SearchHistory onSelectSearch={handleHistorySelect} />

        <CompoundDetails
          compoundData={compoundData}
          isLoading={isLoading}
          error={error}
        />
      </MainContent>

      <Footer>
        <p>
          Dados fornecidos por{' '}
          <FooterLink
            href="https://pubchem.ncbi.nlm.nih.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PubChem Database
          </FooterLink>
          {' '}- National Center for Biotechnology Information
        </p>
        <p>
          Desenvolvido com React + Vite | API PUG-REST
        </p>
      </Footer>
    </AppContainer>
  );
}

export default App;
