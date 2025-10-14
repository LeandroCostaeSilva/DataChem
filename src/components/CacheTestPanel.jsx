import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateDrugInteractions, searchMedicalTopic } from '../services/perplexityService';
import { getCacheStatistics, clearAllCache, cleanExpiredEntries, monitorCacheUsage } from '../utils/cacheManager';
import { runCacheDemo, quickCacheDemo, testCachePersistence } from '../utils/cacheDemo';

const TestPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
`;

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: 18px;
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const TestButton = styled.button`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled(TestButton)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
`;

const StatsContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  backdrop-filter: blur(10px);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 13px;
`;

const LogContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
`;

const LogEntry = styled.div`
  margin: 2px 0;
  color: ${props => {
    if (props.type === 'hit') return '#4ade80';
    if (props.type === 'miss') return '#f87171';
    if (props.type === 'save') return '#60a5fa';
    return '#e5e7eb';
  }};
`;

const ToggleButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #ff6b6b;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
`;

const CacheTestPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState({});

  // Compostos para teste
  const testCompounds = ['aspirin', 'ibuprofen', 'paracetamol', 'amoxicillin'];

  useEffect(() => {
    updateStats();
    
    // Interceptar logs do console para capturar mensagens do cache
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('Cache HIT') || message.includes('Cache MISS') || 
          message.includes('salvo no cache') || message.includes('encontrado no cache')) {
        
        let type = 'info';
        if (message.includes('Cache HIT')) type = 'hit';
        else if (message.includes('Cache MISS')) type = 'miss';
        else if (message.includes('salvo no cache')) type = 'save';
        
        setLogs(prev => [...prev.slice(-20), { 
          message, 
          type, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
      
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const updateStats = () => {
    const cacheStats = getCacheStatistics();
    setStats(cacheStats);
  };

  const testCacheHit = async (compound) => {
    setIsLoading(true);
    try {
      console.log(`🧪 Testando cache para: ${compound}`);
      
      // Primeira requisição (deve ser MISS)
      const start1 = Date.now();
      await generateDrugInteractions(compound);
      const time1 = Date.now() - start1;
      
      // Segunda requisição (deve ser HIT)
      const start2 = Date.now();
      await generateDrugInteractions(compound);
      const time2 = Date.now() - start2;
      
      setTestResults(prev => ({
        ...prev,
        [compound]: {
          firstCall: time1,
          secondCall: time2,
          improvement: Math.round(((time1 - time2) / time1) * 100)
        }
      }));
      
      updateStats();
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllCompounds = async () => {
    setIsLoading(true);
    for (const compound of testCompounds) {
      await testCacheHit(compound);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre testes
    }
    setIsLoading(false);
  };

  const clearCache = () => {
    clearAllCache();
    setLogs([]);
    setTestResults({});
    updateStats();
    console.log('🧹 Cache limpo manualmente');
  };

  const cleanExpired = () => {
    const removed = cleanExpiredEntries();
    updateStats();
    console.log(`🧹 ${removed} entradas expiradas removidas`);
  };

  if (!isVisible) {
    return (
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <TestButton onClick={() => setIsVisible(true)} style={{ width: 'auto', padding: '10px 15px' }}>
          🧪 Teste Cache
        </TestButton>
      </div>
    );
  }

  return (
    <TestPanel>
      <ToggleButton onClick={() => setIsVisible(false)}>×</ToggleButton>
      
      <Title>🧪 Teste do Sistema de Cache</Title>
      
      <div>
        <TestButton 
          onClick={async () => {
            setIsLoading(true);
            await quickCacheDemo();
            updateStats();
            setIsLoading(false);
          }} 
          disabled={isLoading}
        >
          ⚡ Demo Rápido
        </TestButton>
        
        <TestButton 
          onClick={async () => {
            setIsLoading(true);
            await runCacheDemo();
            updateStats();
            setIsLoading(false);
          }} 
          disabled={isLoading}
        >
          🚀 Demo Completo
        </TestButton>
        
        <TestButton 
          onClick={() => testCacheHit('aspirin')} 
          disabled={isLoading}
        >
          🔬 Testar Aspirina (2x)
        </TestButton>
        
        <TestButton 
          onClick={() => testCacheHit('ibuprofen')} 
          disabled={isLoading}
        >
          🔬 Testar Ibuprofeno (2x)
        </TestButton>
        
        <TestButton 
          onClick={testAllCompounds} 
          disabled={isLoading}
        >
          🧪 Testar Todos os Compostos
        </TestButton>
        
        <TestButton 
          onClick={async () => {
            setIsLoading(true);
            await testCachePersistence();
            updateStats();
            setIsLoading(false);
          }} 
          disabled={isLoading}
        >
          🔄 Testar Persistência
        </TestButton>
        
        <ClearButton onClick={clearCache} disabled={isLoading}>
          🗑️ Limpar Cache
        </ClearButton>
        
        <TestButton onClick={cleanExpired} disabled={isLoading}>
          🧹 Limpar Expirados
        </TestButton>
      </div>

      {stats && (
        <StatsContainer>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📊 Estatísticas do Cache</h4>
          <StatItem>
            <span>Entradas:</span>
            <span>{stats.totalEntries}</span>
          </StatItem>
          <StatItem>
            <span>Tamanho:</span>
            <span>{stats.totalSizeFormatted}</span>
          </StatItem>
          <StatItem>
            <span>Taxa de Acerto:</span>
            <span>{stats.cacheHitRate}</span>
          </StatItem>
          <StatItem>
            <span>Expiradas:</span>
            <span>{stats.expiredEntries}</span>
          </StatItem>
        </StatsContainer>
      )}

      {Object.keys(testResults).length > 0 && (
        <StatsContainer>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>⚡ Resultados dos Testes</h4>
          {Object.entries(testResults).map(([compound, result]) => (
            <div key={compound} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{compound}:</div>
              <StatItem>
                <span>1ª chamada:</span>
                <span>{result.firstCall}ms</span>
              </StatItem>
              <StatItem>
                <span>2ª chamada:</span>
                <span>{result.secondCall}ms</span>
              </StatItem>
              <StatItem>
                <span>Melhoria:</span>
                <span style={{ color: '#4ade80' }}>{result.improvement}%</span>
              </StatItem>
            </div>
          ))}
        </StatsContainer>
      )}

      <LogContainer>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>📝 Logs do Cache</h4>
        {logs.length === 0 ? (
          <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            Nenhum log ainda. Execute um teste!
          </div>
        ) : (
          logs.map((log, index) => (
            <LogEntry key={index} type={log.type}>
              [{log.timestamp}] {log.message}
            </LogEntry>
          ))
        )}
      </LogContainer>

      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          margin: '10px 0'
        }}>
          🔄 Executando teste...
        </div>
      )}
    </TestPanel>
  );
};

export default CacheTestPanel;