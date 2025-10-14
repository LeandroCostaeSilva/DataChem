// Serviço alternativo de IA usando Hugging Face (gratuito e global)
// Este serviço será usado como fallback quando o Gemini não estiver disponível

const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

// Função para gerar interações usando Hugging Face
async function generateDrugInteractionsWithHF(drugName) {
  console.log('🤖 Usando Hugging Face como alternativa ao Gemini...');
  
  const prompt = `Gere uma tabela de interações medicamentosas para ${drugName}:

| Medicamento | Nível de Interação | Descrição | Mecanismo |
|-------------|-------------------|-----------|-----------|
| Exemplo | Moderada | Descrição da interação | Mecanismo da interação |

Forneça pelo menos 5 interações conhecidas para ${drugName}.`;

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Hugging Face: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do Hugging Face');
    
    // Processar resposta
    if (data && data[0] && data[0].generated_text) {
      return data[0].generated_text;
    } else {
      throw new Error('Resposta inválida da API Hugging Face');
    }
  } catch (error) {
    console.error('❌ Erro no Hugging Face:', error);
    throw error;
  }
}

// Função alternativa simples que gera dados mock
function generateMockDrugInteractions(drugName) {
  console.log('📋 Gerando dados mock como último recurso...');
  
  const mockInteractions = [
    {
      medicamento: "Warfarina",
      nivel: "Alta",
      descricao: "Pode aumentar o risco de sangramento",
      mecanismo: "Potencialização do efeito anticoagulante"
    },
    {
      medicamento: "Aspirina",
      nivel: "Moderada", 
      descricao: "Risco aumentado de efeitos gastrointestinais",
      mecanismo: "Inibição sinérgica de prostaglandinas"
    },
    {
      medicamento: "Omeprazol",
      nivel: "Baixa",
      descricao: "Possível alteração na absorção",
      mecanismo: "Mudança no pH gástrico"
    },
    {
      medicamento: "Metformina",
      nivel: "Moderada",
      descricao: "Monitoramento da glicemia recomendado",
      mecanismo: "Possível interferência no metabolismo da glicose"
    },
    {
      medicamento: "Atorvastatina",
      nivel: "Baixa",
      descricao: "Risco mínimo de interação",
      mecanismo: "Metabolismo por vias diferentes"
    }
  ];

  // Converter para formato de tabela
  let tableText = `Interações medicamentosas para ${drugName}:\n\n`;
  tableText += "| Medicamento | Nível de Interação | Descrição | Mecanismo |\n";
  tableText += "|-------------|-------------------|-----------|-----------|\\n";
  
  mockInteractions.forEach(interaction => {
    tableText += `| ${interaction.medicamento} | ${interaction.nivel} | ${interaction.descricao} | ${interaction.mecanismo} |\\n`;
  });

  tableText += "\n**Nota:** Estes são dados de exemplo. Consulte sempre um profissional de saúde para informações precisas sobre interações medicamentosas.";

  return tableText;
}

export { generateDrugInteractionsWithHF, generateMockDrugInteractions };