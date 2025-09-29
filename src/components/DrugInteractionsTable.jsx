import React, { useState } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-top: 24px;
  overflow: hidden;
  
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

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 0 16px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin: 0 0 12px 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #f8f9fa;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#007bff' : '#6c757d'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #007bff;
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e1e5e9;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e1e5e9;
  color: #495057;
  vertical-align: top;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
  }
`;

const Badge = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'active': return '#d4edda';
      case 'inactive': return '#f8d7da';
      case 'inconclusive': return '#fff3cd';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'active': return '#155724';
      case 'inactive': return '#721c24';
      case 'inconclusive': return '#856404';
      default: return '#383d41';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 11px;
  }
`;

const EmptyState = styled.div`
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

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #007bff;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 14px;
  }
`;

const DrugInteractionsTable = ({ drugInteractions = [], literature = [], isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('interactions');

  const getBadgeType = (outcome) => {
    if (!outcome || outcome === 'N/A') return 'default';
    const lowerOutcome = outcome.toLowerCase();
    if (lowerOutcome.includes('active') || lowerOutcome.includes('positive')) return 'active';
    if (lowerOutcome.includes('inactive') || lowerOutcome.includes('negative')) return 'inactive';
    if (lowerOutcome.includes('inconclusive') || lowerOutcome.includes('unclear')) return 'inconclusive';
    return 'default';
  };

  const renderInteractionsTable = () => {
    if (isLoading) {
      return <LoadingState>🔍 Carregando interações medicamentosas...</LoadingState>;
    }

    if (!drugInteractions || drugInteractions.length === 0) {
      return (
        <EmptyState>
          Nenhuma interação medicamentosa encontrada nos bioassays disponíveis.
        </EmptyState>
      );
    }

    return (
      <TableWrapper>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>AID</TableHeaderCell>
              <TableHeaderCell>Descrição</TableHeaderCell>
              <TableHeaderCell>Atividade</TableHeaderCell>
              <TableHeaderCell>Resultado</TableHeaderCell>
              <TableHeaderCell>Alvo</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {drugInteractions.map((interaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  <a 
                    href={`https://pubchem.ncbi.nlm.nih.gov/bioassay/${interaction.aid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    {interaction.aid}
                  </a>
                </TableCell>
                <TableCell>{interaction.description}</TableCell>
                <TableCell>{interaction.activity}</TableCell>
                <TableCell>
                  <Badge type={getBadgeType(interaction.outcome)}>
                    {interaction.outcome}
                  </Badge>
                </TableCell>
                <TableCell>{interaction.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    );
  };

  const renderLiteratureTable = () => {
    if (isLoading) {
      return <LoadingState>🔍 Carregando literatura científica...</LoadingState>;
    }

    if (!literature || literature.length === 0) {
      return (
        <EmptyState>
          Nenhuma referência de literatura encontrada.
        </EmptyState>
      );
    }

    return (
      <TableWrapper>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Título</TableHeaderCell>
              <TableHeaderCell>Autores</TableHeaderCell>
              <TableHeaderCell>Revista</TableHeaderCell>
              <TableHeaderCell>Ano</TableHeaderCell>
              <TableHeaderCell>PMID/AID</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {literature.map((paper, index) => (
              <TableRow key={index}>
                <TableCell>{paper.title}</TableCell>
                <TableCell>{paper.authors}</TableCell>
                <TableCell>{paper.journal}</TableCell>
                <TableCell>{paper.year}</TableCell>
                <TableCell>
                  <a 
                    href={`https://pubchem.ncbi.nlm.nih.gov/bioassay/${paper.pmid.replace('AID_', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    {paper.pmid}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <TableContainer>
      <SectionTitle>
        📊 Contents - Literature & Drug Interactions
      </SectionTitle>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'interactions'} 
          onClick={() => setActiveTab('interactions')}
        >
          Drug-Drug Interactions ({drugInteractions?.length || 0})
        </Tab>
        <Tab 
          active={activeTab === 'literature'} 
          onClick={() => setActiveTab('literature')}
        >
          Literatura ({literature?.length || 0})
        </Tab>
      </TabContainer>

      {activeTab === 'interactions' ? renderInteractionsTable() : renderLiteratureTable()}
    </TableContainer>
  );
};

export default DrugInteractionsTable;