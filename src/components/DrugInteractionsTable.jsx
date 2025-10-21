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
    borderRadius: 6
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
    verticalAlign: 'top'
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
      <h3 style={{ marginTop: 0 }}>🧪 Interações Medicamentosas - {compoundName}</h3>
      {!hasContent ? (
        <div style={{ fontStyle: 'italic', color: '#6c757d' }}>Sem conteúdo retornado. Exibindo placeholder.</div>
      ) : (
        <div>
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
      )}

      <div style={infoStyle}>
        <span>
          Dados gerados por {model === 'fallback' ? 'fallback interno' : `Perplexity AI (${model})`} em {new Date(timestamp).toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
}