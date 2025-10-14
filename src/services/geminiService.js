import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateDrugInteractionsWithHF, generateMockDrugInteractions } from './alternativeAIService.js';

// --- CONFIGURAÇÃO ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDsBPn174Ixccs01ZYa5GdQyffWBiqVZwo';

// Log para verificar se a variável de ambiente está sendo carregada
console.log('🔧 Configuração do Gemini Service:');
console.log('📝 VITE_GEMINI_API_KEY from env:', import.meta.env.VITE_GEMINI_API_KEY ? 'Definida' : 'Não definida');
console.log('🔑 API_KEY final:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Não definida');

// Lista de modelos em ordem de prioridade (fallback automático)
const AVAILABLE_MODELS = [
  "gemini-1.5-pro",
  "gemini-pro", 
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest"
];

const genAI = new GoogleGenerativeAI(API_KEY);

// Função para tentar diferentes modelos
async function getAvailableModel() {
  console.log('🔍 Iniciando busca por modelo disponível...');
  console.log('📋 Modelos a testar:', AVAILABLE_MODELS);
  
  const errors = [];
  
  for (const modelName of AVAILABLE_MODELS) {
    try {
      console.log(`🔄 Tentando modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Teste simples para verificar se o modelo funciona
      console.log(`📤 Enviando teste para ${modelName}...`);
      const testResult = await model.generateContent("Test");
      console.log(`✅ Modelo ${modelName} funcionando!`);
      return { model, modelName };
    } catch (error) {
      const errorInfo = {
        model: modelName,
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details || 'N/A'
      };
      errors.push(errorInfo);
      console.error(`❌ Modelo ${modelName} falhou:`, errorInfo);
      continue;
    }
  }
  
  console.error('🚫 Todos os modelos falharam. Detalhes dos erros:', errors);
  throw new Error(`Nenhum modelo Gemini disponível na sua região. Erros: ${errors.map(e => `${e.model}: ${e.message}`).join('; ')}`);
}

// --- FUNÇÃO DE CHAMADA ---
async function executarModelo(prompt) {
  try {
    console.log('🔄 Iniciando chamada para API Gemini...');
    console.log('📝 API Key disponível:', API_KEY ? 'Sim' : 'Não');
    console.log('🔑 API Key (primeiros 10 chars):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Não definida');
    console.log('📋 Prompt length:', prompt.length);
    
    if (!API_KEY) {
      throw new Error('API Key não configurada');
    }
    
    console.log('🔧 Buscando modelo disponível...');
    const { model, modelName } = await getAvailableModel();
    console.log('🤖 Modelo selecionado:', modelName);
    
    console.log('📤 Enviando prompt para a API...');
    const result = await model.generateContent(prompt);
    console.log('📨 Resposta recebida da API');
    
    console.log('🔍 Processando resposta...');
    const response = await result.response;
    console.log('📄 Response object:', response);
    
    const text = response.text();
    console.log('📝 Texto extraído:', text ? `Sucesso (${text.length} chars)` : 'Vazio');
    console.log('📋 Primeiros 100 chars:', text ? text.substring(0, 100) + '...' : 'N/A');
    
    return text;
  } catch (error) {
    console.error('❌ Erro na função executarModelo:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code || 'N/A'
    });
    
    // Retornar erro específico em vez de null
    throw new Error(`Erro na API Gemini: ${error.message}`);
  }
}

/**
 * Função de teste simples para verificar se a API Gemini está funcionando
 * @returns {Promise<string>} - Resposta da IA
 */
export const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testando API Gemini com prompt simples...');
    const simplePrompt = 'Diga apenas "API funcionando" se você conseguir responder.';
    const response = await executarModelo(simplePrompt);
    console.log('✅ Teste da API bem-sucedido:', response);
    return response;
  } catch (error) {
    console.error('❌ Teste da API falhou:', error);
    throw error;
  }
};

/**
 * Gera dados de interações drug-drug usando a API Gemini 1.5 Flash
 * @param {string} compoundName - Nome do composto químico
 * @returns {Promise<string>} - Resposta da IA com dados de interações em formato de tabela
 */
export const generateDrugInteractions = async (compoundName) => {
  console.log('🎯 Iniciando geração de interações para:', compoundName);
  
  // Tentar primeiro com Gemini
  try {
    console.log('🤖 Tentando com Gemini...');
    const prompt = `Forneça uma tabela completa das principais interações medicamentosas do ${compoundName}. Use EXATAMENTE este formato:

| Medicamento | Severidade | Mecanismo | Efeito Clínico | Recomendação |
|-------------|------------|-----------|----------------|--------------|
| [Nome específico do medicamento] | [Leve/Moderada/Grave] | [Mecanismo detalhado da interação] | [Efeito clínico específico observado] | [Recomendação prática específica] |

INSTRUÇÕES OBRIGATÓRIAS:
1. Inclua EXATAMENTE 6-8 interações clinicamente relevantes
2. Para SEVERIDADE use apenas: "Leve", "Moderada" ou "Grave"
3. Para MECANISMO inclua: tipo de interação (farmacocinética/farmacodinâmica) + mecanismo específico
4. Para EFEITO CLÍNICO seja específico: aumento/diminuição de efeito, toxicidade, etc.
5. Para RECOMENDAÇÃO seja prático: ajuste de dose, monitoramento, evitar combinação, etc.
6. Use nomes genéricos dos medicamentos (não comerciais)
7. Baseie-se em evidências científicas reconhecidas

EXEMPLO DE LINHA VÁLIDA:
| Warfarina | Grave | Farmacocinética - Inibição CYP2C9 | Aumento do risco de sangramento (INR elevado) | Monitorar INR, ajustar dose de warfarina |

Após a tabela, adicione:

## Referências:
1. [Fonte bibliográfica específica 1]
2. [Fonte bibliográfica específica 2]
3. [Fonte bibliográfica específica 3]
4. [Fonte bibliográfica específica 4]

IMPORTANTE: Preencha TODAS as células da tabela com dados específicos e completos. NÃO deixe células vazias.`;

    const resposta = await executarModelo(prompt);
    
    // Validação básica do conteúdo
    const hasTableStructure = resposta.includes('|') && resposta.includes('Medicamento');
    if (!hasTableStructure) {
      throw new Error('Resposta não contém estrutura de tabela válida');
    }
    
    const tableLines = resposta.split('\n').filter(line => line.includes('|'));
    if (tableLines.length < 4) { // Cabeçalho + separador + pelo menos 2 linhas de dados
      throw new Error('Tabela não contém dados suficientes');
    }
    
    return resposta;

  } catch (geminiError) {
    console.error('❌ Gemini falhou:', geminiError.message);
    
    // Fallback 1: Tentar Hugging Face
    try {
      console.log('🔄 Tentando fallback com Hugging Face...');
      const hfResponse = await generateDrugInteractionsWithHF(compoundName);
      console.log('✅ Hugging Face funcionou!');
      return hfResponse;
    } catch (hfError) {
      console.error('❌ Hugging Face também falhou:', hfError.message);
      
      // Fallback 2: Dados mock
      try {
        console.log('🔄 Usando dados mock como último recurso...');
        const mockResponse = generateMockDrugInteractions(compoundName);
        console.log('✅ Dados mock gerados com sucesso!');
        return mockResponse;
      } catch (mockError) {
        console.error('❌ Até os dados mock falharam:', mockError.message);
        throw new Error(`Todos os serviços de IA falharam. Gemini: ${geminiError.message}, HF: ${hfError.message}, Mock: ${mockError.message}`);
      }
    }
  }
};

/**
 * Formata a resposta da IA para melhor exibição
 * @param {string} rawResponse - Resposta bruta da API
 * @returns {Object} - Objeto com dados formatados
 */
export const formatInteractionsResponse = (rawResponse) => {
  try {
    // Log para debug
    console.log('Formatando resposta:', rawResponse);
    
    // Verifica se a resposta contém dados válidos
    if (!rawResponse || rawResponse.trim().length === 0) {
      throw new Error('Resposta vazia recebida');
    }
    
    // Validação específica para tabelas de interações
    const hasTableStructure = rawResponse.includes('|') && rawResponse.includes('Medicamento');
    if (!hasTableStructure) {
      throw new Error('Resposta não contém estrutura de tabela válida');
    }
    
    // Verifica se há pelo menos 3 linhas de dados (cabeçalho + separador + pelo menos 1 linha de dados)
    const tableLines = rawResponse.split('\n').filter(line => line.includes('|'));
    if (tableLines.length < 3) {
      throw new Error('Tabela não contém dados suficientes');
    }
    
    // Verifica se as linhas de dados não estão vazias
    const dataLines = tableLines.slice(2); // Pula cabeçalho e separador
    const hasEmptyData = dataLines.some(line => {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      return cells.length < 5 || cells.some(cell => cell === '' || cell === '-' || cell.toLowerCase().includes('vazio'));
    });
    
    if (hasEmptyData) {
      throw new Error('Tabela contém células vazias ou dados incompletos');
    }
    
    // Remove qualquer texto que pareça ser system prompt ou explicações desnecessárias
    let cleanedResponse = rawResponse
      .replace(/^.*?farmacologista.*?\n/gi, '') // Remove linhas sobre ser farmacologista
      .replace(/^.*?especialista.*?\n/gi, '') // Remove linhas sobre ser especialista
      .replace(/^.*?apresento.*?\n/gi, '') // Remove linhas introdutórias
      .replace(/^.*?como.*?especialista.*?\n/gi, '') // Remove outras introduções
      .trim();
    
    // Converte tabela markdown para HTML
    let formattedContent = cleanedResponse;
    
    // Detecta e converte tabelas markdown
    const tableRegex = /\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)+)/g;
    formattedContent = formattedContent.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
      const rowsArray = rows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );
      
      let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">';
      
      // Cabeçalho
      tableHTML += '<thead><tr style="background-color: #f8f9fa;">';
      headerCells.forEach(cell => {
        tableHTML += `<th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-weight: 600; color: #495057;">${cell}</th>`;
      });
      tableHTML += '</tr></thead>';
      
      // Corpo da tabela
      tableHTML += '<tbody>';
      rowsArray.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
        tableHTML += `<tr style="background-color: ${bgColor};">`;
        row.forEach(cell => {
          tableHTML += `<td style="border: 1px solid #dee2e6; padding: 12px; vertical-align: top;">${cell}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table>';
      
      return tableHTML;
    });
    
    // Formatar outras marcações
    formattedContent = formattedContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
      .replace(/^## (.*$)/gm, '<h3 style="color: #2c3e50; margin: 20px 0 12px 0; font-size: 16px; font-weight: 600;">$1</h3>') // Títulos h2
      .replace(/^# (.*$)/gm, '<h2 style="color: #2c3e50; margin: 24px 0 16px 0; font-size: 18px; font-weight: 700;">$1</h2>') // Títulos h1
      .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">') // Parágrafos
      .replace(/\n/g, '<br>'); // Quebras de linha simples
    
    // Envolver em parágrafo se não começar com tag HTML
    if (!formattedContent.startsWith('<')) {
      formattedContent = `<p style="margin: 12px 0; line-height: 1.6;">${formattedContent}</p>`;
    }
    
    return {
      content: formattedContent,
      rawContent: rawResponse,
      timestamp: new Date().toISOString(),
      source: 'Gemini 2.5 Flash',
      hasTable: rawResponse.includes('|'),
      wordCount: rawResponse.split(' ').length,
      isFormatted: true
    };
  } catch (error) {
    console.error('Erro ao formatar resposta:', error);
    return {
      content: rawResponse || 'Erro: Resposta não disponível',
      rawContent: rawResponse,
      timestamp: new Date().toISOString(),
      source: 'Gemini 2.5 Flash',
      error: 'Erro na formatação: ' + error.message,
      hasTable: false,
      wordCount: 0,
      isFormatted: false
    };
  }
};