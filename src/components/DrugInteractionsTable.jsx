import React from 'react';
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

const DrugInteractionsTable = ({ drugInteractions = 0, isLoading = false }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState>🔍 Carregando interações medicamentosas...</LoadingState>;
    }

    // Se drugInteractions é 0 (conforme retornado pelo serviço), exibir (0)
    if (drugInteractions === 0) {
      return (
        <EmptyState>
          Drug-Drug Interactions: (0)
        </EmptyState>
      );
    }

    // Se drugInteractions é um array vazio ou não tem dados específicos de DDI
    if (!drugInteractions || (Array.isArray(drugInteractions) && drugInteractions.length === 0)) {
      return (
        <EmptyState>
          Drug-Drug Interactions: (0)
        </EmptyState>
      );
    }

    // Se houver dados específicos de DDI (caso futuro com API especializada)
    if (Array.isArray(drugInteractions) && drugInteractions.length > 0) {
      return (
        <TableWrapper>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Substância Interagente</TableHeaderCell>
                <TableHeaderCell>Tipo de Interação</TableHeaderCell>
                <TableHeaderCell>Severidade</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell>Evidência</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {drugInteractions.map((interaction, index) => (
                <TableRow key={index}>
                  <TableCell>{interaction.interactingSubstance}</TableCell>
                  <TableCell>{interaction.interactionType}</TableCell>
                  <TableCell>
                    <Badge type={interaction.severity?.toLowerCase()}>
                      {interaction.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{interaction.description}</TableCell>
                  <TableCell>{interaction.evidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      );
    }

    return (
      <EmptyState>
        Drug-Drug Interactions: (0)
      </EmptyState>
    );
  };

  return (
    <TableContainer>
      <SectionTitle>
        🧬 Drug-Drug Interactions
      </SectionTitle>
      
      {renderContent()}
    </TableContainer>
  );
};

export default DrugInteractionsTable;