import React, { useState } from 'react';
import styled from 'styled-components';
import SearchHistory from './SearchHistory';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${props => props.$isOpen ? '0' : '-320px'};
  width: 320px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 280px;
    left: ${props => props.$isOpen ? '0' : '-280px'};
  }
  
  @media (max-width: 480px) {
    width: 100vw;
    left: ${props => props.$isOpen ? '0' : '-100vw'};
  }
`;

const SidebarHeader = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.3);
  }
`;

const SidebarContent = styled.div`
  padding: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 16px;
    height: calc(100vh - 72px);
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  left: ${props => props.$isOpen ? '340px' : '20px'};
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    left: ${props => props.$isOpen ? '300px' : '20px'};
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    left: ${props => props.$isOpen ? 'calc(100vw - 70px)' : '20px'};
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = ({ onSelectSearch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleSelectSearch = (searchTerm) => {
    onSelectSearch(searchTerm);
    closeSidebar(); // Fecha o sidebar após selecionar uma pesquisa
  };

  return (
    <>
      <ToggleButton 
        onClick={toggleSidebar}
        $isOpen={isOpen}
        title={isOpen ? 'Fechar histórico' : 'Abrir histórico de pesquisas'}
      >
        {isOpen ? '✕' : '📋'}
      </ToggleButton>

      <Overlay $isOpen={isOpen} onClick={closeSidebar} />

      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <SidebarTitle>
            📋 Pesquisas Recentes
          </SidebarTitle>
          <CloseButton 
            onClick={closeSidebar}
            title="Fechar histórico"
          >
            ✕
          </CloseButton>
        </SidebarHeader>
        
        <SidebarContent>
          <SearchHistory onSelectSearch={handleSelectSearch} />
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;