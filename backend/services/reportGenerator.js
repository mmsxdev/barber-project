import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Funções auxiliares para processar os dados
const calculateTotalRevenue = (financialData) => {
  return financialData
    .filter((item) => item.type === "INCOME")
    .reduce((total, item) => total + item.value, 0);
};

const calculateTotalExpenses = (financialData) => {
  return financialData
    .filter((item) => item.type === "EXPENSE")
    .reduce((total, item) => total + item.value, 0);
};

const getPopularServices = (appointments) => {
  const serviceCount = {};
  appointments.forEach((appointment) => {
    // Verificar se o serviço existe e tem um nome
    const serviceName = appointment.service?.name || appointment.service || "Serviço não especificado";
    serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
  });
  return Object.entries(serviceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([service, count]) => `${service}: ${count} agendamentos`);
};

const getLowStockProducts = (inventory) => {
  return inventory
    .filter((product) => product.quantityInStock < 10)
    .map((product) => `${product.name}: ${product.quantityInStock} unidades`);
};

// Adicionar função para calcular comissões
const calculateCommissions = (appointments, commissions) => {
  if (!appointments || !commissions) return { totalCommission: 0, details: [], barberCommissions: [] };
  
  const commissionDetails = appointments.map(appointment => {
    // Encontrar a comissão correspondente
    const commission = commissions.find(c => 
      c.barberId === appointment.barberId && 
      c.serviceId === appointment.serviceId
    );
    
    const rate = commission?.percentage || 0;
    const servicePrice = appointment.service?.price || 0;
    const commissionValue = (servicePrice * rate) / 100;
    
    return {
      date: appointment.dateTime,
      service: appointment.service?.name || "Serviço não especificado",
      servicePrice,
      commissionRate: rate,
      commissionValue,
      barberId: appointment.barberId,
      barberName: appointment.barber?.name || "Barbeiro não especificado"
    };
  });
  
  const totalCommission = commissionDetails.reduce(
    (sum, detail) => sum + detail.commissionValue, 
    0
  );
  
  // Calcular comissões por barbeiro
  const barberCommissions = {};
  commissionDetails.forEach(detail => {
    if (!barberCommissions[detail.barberId]) {
      barberCommissions[detail.barberId] = {
        barberName: detail.barberName,
        totalServices: 0,
        totalCommission: 0,
        services: {}
      };
    }
    
    barberCommissions[detail.barberId].totalServices++;
    barberCommissions[detail.barberId].totalCommission += detail.commissionValue;
    
    if (!barberCommissions[detail.barberId].services[detail.service]) {
      barberCommissions[detail.barberId].services[detail.service] = {
        count: 0,
        commissionRate: detail.commissionRate,
        totalCommission: 0
      };
    }
    
    barberCommissions[detail.barberId].services[detail.service].count++;
    barberCommissions[detail.barberId].services[detail.service].totalCommission += detail.commissionValue;
  });
  
  // Converter para array para facilitar o uso
  const barberCommissionsArray = Object.values(barberCommissions);
  
  return {
    totalCommission,
    details: commissionDetails,
    barberCommissions: barberCommissionsArray
  };
};

export const generateReport = async (data) => {
  try {
    // Verifica se a chave API existe
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY não configurada");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Calcula os totais e estatísticas
    const totalRevenue = calculateTotalRevenue(data.financialData);
    const totalExpenses = calculateTotalExpenses(data.financialData);
    const popularServices = getPopularServices(data.appointments);
    const lowStockProducts = getLowStockProducts(data.inventory);
    
    // Obter a data atual para o relatório
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const prompt = `
      Você é um assistente especializado em análise de dados de barbearia.
      Analise os seguintes dados e forneça um relatório detalhado, usando a seguinte estrutura e formatação:
      
      Dados Financeiros:
      - Total de receitas: R$ ${totalRevenue.toFixed(2)}
      - Total de despesas: R$ ${totalExpenses.toFixed(2)}
      - Lucro líquido: R$ ${(totalRevenue - totalExpenses).toFixed(2)}
      
      Agendamentos:
      - Total de agendamentos: ${data.appointments.length}
      - Serviços mais populares:
      ${popularServices.map((service) => `  * ${service}`).join("\n")}
      
      Estoque:
      - Produtos com baixo estoque:
      ${lowStockProducts.map((product) => `  * ${product}`).join("\n")}
      
      FORMATAÇÃO DO RELATÓRIO:
      - Use cabeçalhos numerados para as seções principais (ex: "1. Resumo Executivo")
      - Use subcabeçalhos com dois pontos no final (ex: "Destaques Financeiros:")
      - Use linhas em branco para separar parágrafos
      - Destaque números e valores importantes usando antes e depois dois asteriscos (ex: **R$ 5.000,00**) para indicar formatação em negrito
      - Use marcadores com hífen (-) para listas
      - Mantenha cada seção bem estruturada e organizada
      - IMPORTANTE: Use a data atual (${formattedDate}) no cabeçalho do relatório, não crie uma data fictícia
      
      CONTEÚDO DO RELATÓRIO (use exatamente esta estrutura e estes números de seções):
      1. Resumo Executivo (breve visão geral dos pontos mais importantes)
      2. Análise Financeira (detalhes sobre receitas, despesas, lucro, tendências)
      3. Análise de Serviços (insights sobre agendamentos, serviços populares, etc.)
      4. Gestão de Estoque (situação do estoque, produtos críticos, recomendações)
      5. Recomendações e Próximos Passos (ações concretas para melhorar resultados)
      
      Mantenha o tom profissional e focado em insights acionáveis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("A IA não gerou nenhum conteúdo");
    }

    // Processar o texto para garantir formatação adequada
    return processAIText(text);
  } catch (error) {
    console.error("Erro ao gerar relatório com IA:", error);
    throw new Error(`Falha ao gerar insights com IA: ${error.message}`);
  }
};

// Função para processar o texto gerado pela IA e garantir formatação adequada
const processAIText = (text) => {
  try {
    // Remover formatações HTML que podem ter sido geradas
    let processedText = text.replace(/<[^>]*>/g, "");

    // Garantir que os cabeçalhos numerados estejam em formato correto
    processedText = processedText.replace(/^(\d+)\)\s+/gm, "$1. ");

    // Garantir quebras de linha consistentes
    processedText = processedText.replace(/\r\n/g, "\n");

    // Garantir espaçamento adequado entre seções (adicionar linha em branco após cada cabeçalho)
    processedText = processedText.replace(/^(\d+\.\s+.+)\n(?!\n)/gm, "$1\n\n");

    // Garantir espaçamento após subcabeçalhos
    processedText = processedText.replace(/^([^:\n]+:)\s*(?!\n\n)/gm, "$1\n");

    // Garantir que linhas com marcadores tenham formatação consistente
    processedText = processedText.replace(/^\s*[•*]\s*/gm, "- ");

    // Garantir que marcadores de negrito existam apenas em pares
    const boldAsterisks = processedText.match(/\*\*/g);
    if (boldAsterisks && boldAsterisks.length % 2 !== 0) {
      // Se houver um número ímpar de marcadores de negrito, remove todos para evitar inconsistências
      processedText = processedText.replace(/\*\*/g, "");
    }

    // Verificar se os marcadores de negrito estão sendo usados corretamente
    // Se não estiverem, converter para um formato mais adequado
    if (!/\*\*[^*]+\*\*/g.test(processedText)) {
      // Tentar identificar valores numéricos e destacá-los
      processedText = processedText.replace(/(R\$\s*[\d.,]+)/g, "**$1**");
      processedText = processedText.replace(/(\d+[,.]\d+%)/g, "**$1**");
    }

    return processedText;
  } catch (error) {
    console.error("Erro ao processar texto da IA:", error);
    return text; // Em caso de erro, retorna o texto original
  }
};
