import React, { useState } from 'react';
import styled from 'styled-components';

// Componentes estilizados
const Container = styled.div`
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Badge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const Content = styled.div`
  padding: 20px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  
  /* Estilização da barra de scroll para melhor aparência */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Para dispositivos móveis, garantir que o scroll seja visível */
  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      height: 12px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px; /* Largura mínima para garantir que as 5 colunas não fiquem muito comprimidas */
  
  @media (max-width: 768px) {
    min-width: 1100px; /* Aumenta a largura mínima em mobile para forçar o scroll horizontal */
  }
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 14px;
  white-space: nowrap;
  
  /* Larguras mínimas específicas para cada coluna */
  &:nth-child(1) {
    min-width: 250px; /* Medicamento Comercial */
  }
  
  &:nth-child(2) {
    min-width: 300px; /* Reações Adversas */
  }
  
  &:nth-child(3) {
    min-width: 150px; /* Paciente */
  }
  
  &:nth-child(4) {
    min-width: 120px; /* ID do Relatório */
  }
  
  &:nth-child(5) {
    min-width: 150px; /* Fabricante */
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
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  vertical-align: top;
  
  /* Larguras mínimas específicas para cada coluna */
  &:nth-child(1) {
    min-width: 250px; /* Medicamento Comercial */
  }
  
  &:nth-child(2) {
    min-width: 300px; /* Reações Adversas */
  }
  
  &:nth-child(3) {
    min-width: 150px; /* Paciente */
  }
  
  &:nth-child(4) {
    min-width: 120px; /* ID do Relatório */
    text-align: center;
  }
  
  &:nth-child(5) {
    min-width: 150px; /* Fabricante */
  }
`;

const ReactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ReactionItem = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
`;

const ReactionTerm = styled.div`
  font-weight: 600;
  color: #856404;
`;

const ReactionDetails = styled.div`
  color: #6c757d;
  font-size: 11px;
  margin-top: 2px;
`;

const SeverityBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    if (props.serious === 'Sim') return '#dc3545';
    return '#28a745';
  }};
  color: white;
`;

const PatientInfo = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const Disclaimer = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 12px 16px;
  margin-top: 16px;
  font-size: 12px;
  color: #495057;
  line-height: 1.4;
`;

const ShowMoreButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 12px;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const AdverseReactionsTable = ({ adverseReactions, isLoading, compoundName }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (isLoading) {
    return (
      <Container>
        <Header>
          Eventos Adversos notificados no FDA
          <Badge>Carregando...</Badge>
        </Header>
        <LoadingState>
          🔄 Buscando eventos adversos no banco de dados do FDA...
        </LoadingState>
      </Container>
    );
  }

  if (!adverseReactions || !adverseReactions.results || adverseReactions.results.length === 0) {
    return (
      <Container>
        <Header>
          Eventos Adversos notificados no FDA
          <Badge>(0)</Badge>
        </Header>
        <EmptyState>
          <EmptyIcon>⚕️</EmptyIcon>
          <EmptyTitle>Nenhum evento adverso encontrado</EmptyTitle>
          <EmptyDescription>
            {adverseReactions?.meta?.error 
              ? adverseReactions.meta.disclaimer
              : `Não foram encontrados eventos adversos notificados no FDA para "${compoundName || 'este composto'}".`
            }
            <br />
            <br />
            <strong style={{ color: '#007bff' }}>
              💡 Dica: Refaça a busca com a sinonímia mais conhecida em idioma inglês
            </strong>
            <br />
            <br />
            Isso pode indicar que o composto não possui relatos de eventos adversos registrados ou que não é um medicamento aprovado pelo FDA.
          </EmptyDescription>
        </EmptyState>
      </Container>
    );
  }

  const results = adverseReactions.results;
  const displayedResults = showAll ? results : results.slice(0, 5);
  const hasMore = results.length > 5;

  return (
    <Container>
      <Header>
        Eventos Adversos notificados no FDA
        <Badge>({results.length})</Badge>
      </Header>
      <Content>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Medicamento Comercial</TableHeaderCell>
                <TableHeaderCell>Eventos Adversos</TableHeaderCell>
                <TableHeaderCell>Paciente</TableHeaderCell>
                <TableHeaderCell>ID do Relatório</TableHeaderCell>
                <TableHeaderCell>Fabricante</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {displayedResults.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {event.medicationName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Substância ativa: {event.genericName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                      Data: {event.reportDate} | País: {event.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ReactionsList>
                      {event.reactions.map((reaction, index) => (
                        <ReactionItem key={index}>
                          <ReactionTerm>{reaction.term}</ReactionTerm>
                          <ReactionDetails>
                            Resultado: {reaction.outcome}
                            {reaction.severity !== 'Não especificado' && (
                              <span> | Gravidade: {reaction.severity}</span>
                            )}
                          </ReactionDetails>
                        </ReactionItem>
                      ))}
                    </ReactionsList>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                      <strong>Idade:</strong> {event.patientAge} {event.patientAgeUnit}
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                      <strong>Sexo:</strong> {event.patientSex}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>
                      <SeverityBadge serious={event.serious}>
                        {event.serious === 'Sim' ? 'Grave' : 'Não Grave'}
                      </SeverityBadge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#495057', marginBottom: '4px' }}>
                      {event.safetyReportId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '12px' }}>
                      {event.manufacturer}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {hasMore && (
          <ShowMoreButton 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Mostrar Menos' : `Mostrar Mais (${results.length - 5} restantes)`}
          </ShowMoreButton>
        )}

        <Disclaimer>
          <strong>Aviso Importante:</strong> {adverseReactions.meta?.disclaimer || 'Dados fornecidos pela API openFDA'}
          <br />
          <br />
          Os dados de eventos adversos são baseados em relatos voluntários ao FDA e não estabelecem uma relação causal entre o medicamento e o evento adverso. 
          Estes dados devem ser interpretados por profissionais de saúde qualificados e não substituem orientação médica profissional.
        </Disclaimer>
      </Content>
    </Container>
  );
};

export default AdverseReactionsTable;