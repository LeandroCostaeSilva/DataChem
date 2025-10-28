import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DrugInteractionsTable({ interactionsData, compoundName, isLoading }) {
  const containerStyle = {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    borderLeft: '4px solid #007bff',
    margin: '16px 0'
  };

  const infoStyle = {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '8px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: 6,
    minWidth: 720
  };

  const thStyle = {
    background: '#f1f5f9',
    color: '#0f172a',
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 14
  };

  const tdStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e9ecef',
    fontSize: 14,
    verticalAlign: 'top',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
  };

  const scrollContainerStyle = {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    maxWidth: '100%',
    paddingBottom: 4
  };

  const badgeBase = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff'
  };

  const severityBadge = (text) => {
    const v = String(text || '').toLowerCase();
    if (/^grave/.test(v)) return { ...badgeBase, background: '#dc3545' };
    if (/^moderada/.test(v)) return { ...badgeBase, background: '#fd7e14' };
    if (/^leve/.test(v)) return { ...badgeBase, background: '#198754' };
    return null;
  };

  const getText = (children) => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(getText).join('');
    if (children && children.props) return getText(children.props.children);
    return '';
  };

  const resolveSourceLabel = (model) => {
    const m = String(model || '').toLowerCase();
    if (m === 'fallback') return 'fallback interno';
    if (m.includes('claude')) return `Claude (${model})`;
    return `Perplexity AI (${model})`;
  };

  const sourceBadgeBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  };

  const sourceBadgeStyle = (model) => {
    const m = String(model || '').toLowerCase();
    if (m === 'fallback') return { ...sourceBadgeBase, background: '#6c757d' };
    if (m.includes('claude')) return { ...sourceBadgeBase, background: '#8b5cf6' };
    return { ...sourceBadgeBase, background: '#0ea5e9' };
  };

  const resolveBadgeLabel = (model) => {
    const m = String(model || '').toLowerCase();
    if (m === 'fallback') return 'Fallback';
    if (m.includes('claude')) return 'Claude';
    return 'Perplexity';
  };

  const sourceBadgeIcon = (model) => {
    const m = String(model || '').toLowerCase();
    if (m === 'fallback') return '🛟';
    if (m.includes('claude')) return '🧠';
    return '🔍';
  };

  if (isLoading) {
    return (
      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-label="processando" role="img">🔄</span>
        <span style={{ background: '#007bff', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600 }}>
          buscando interações entre fármacos
        </span>
      </div>
    );
  }
  if (!interactionsData) {
    return <div style={{ padding: '12px' }}>Nenhum dado de interações disponível.</div>;
  }

  const content =
    typeof interactionsData === 'string'
      ? interactionsData
      : interactionsData?.content || interactionsData?.rawContent || '';

  const model =
    (typeof interactionsData === 'object' && (interactionsData.model || interactionsData?.metadata?.model))
      ? (interactionsData.model || interactionsData?.metadata?.model)
      : 'sonar-pro';

  const timestamp =
    (typeof interactionsData === 'object' && interactionsData.timestamp)
      ? interactionsData.timestamp
      : new Date().toISOString();

  const hasContent = content && String(content).trim().length > 0;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#007bff', color: '#fff', borderRadius: 6, padding: '8px 12px' }}>
        <h3 style={{ margin: 0 }}>🧪 Interações Medicamentosas - {compoundName}</h3>
        <span style={sourceBadgeStyle(model)} title={resolveSourceLabel(model)} aria-label={`Fonte: ${resolveSourceLabel(model)}`}>
          <span aria-hidden="true" style={{ marginRight: 6 }}>{sourceBadgeIcon(model)}</span>
          {resolveBadgeLabel(model)}
        </span>
      </div>
      {!hasContent ? (
        <div>
          <div style={scrollContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Medicamento</th>
                  <th style={thStyle}>Nível</th>
                  <th style={thStyle}>Descrição</th>
                  <th style={thStyle}>Mecanismo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>—</td>
                  <td style={tdStyle}><span style={{ ...badgeBase, background: '#6c757d' }}>N/A</span></td>
                  <td style={tdStyle}>Sem dados disponíveis no momento. Tente novamente.</td>
                  <td style={tdStyle}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ fontStyle: 'italic', color: '#6c757d', marginTop: 8 }}>
            Placeholder exibido por falha de conteúdo ou rede
          </div>
        </div>
      ) : (
        <div>
          <div style={scrollContainerStyle}>
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => <table style={tableStyle}>{children}</table>,
              thead: ({ children }) => <thead>{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => <th style={thStyle}>{children}</th>,
              td: ({ children }) => {
                const text = getText(children).trim();
                const badge = severityBadge(text);
                return (
                  <td style={tdStyle}>
                    {badge ? <span style={badge}>{text}</span> : children}
                  </td>
                );
              }
            }}
          >
            {String(content)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div style={infoStyle}>
        <span>
          Dados gerados por {resolveSourceLabel(model)} em {new Date(timestamp).toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
}