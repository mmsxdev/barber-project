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
    serviceCount[appointment.service] =
      (serviceCount[appointment.service] || 0) + 1;
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

export const generateReport = async (data) => {
  try {
    // Verifica se a chave API existe
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY não configurada");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Calcula os totais e estatísticas
    const totalRevenue = calculateTotalRevenue(data.financialData);
    const totalExpenses = calculateTotalExpenses(data.financialData);
    const popularServices = getPopularServices(data.appointments);
    const lowStockProducts = getLowStockProducts(data.inventory);

    const prompt = `
      Você é um assistente especializado em análise de dados de barbearia.
      Analise os seguintes dados e forneça um relatório detalhado:
      
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
      
      Por favor, forneça:
      1. Resumo executivo com os principais pontos do período
      2. Análise detalhada por categoria (financeira, serviços, estoque)
      3. Recomendações específicas para melhorias
      4. Tendências identificadas e oportunidades de crescimento
      
      Mantenha o tom profissional e focado em insights acionáveis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("A IA não gerou nenhum conteúdo");
    }

    return text;
  } catch (error) {
    console.error("Erro ao gerar relatório com IA:", error);
    throw new Error(`Falha ao gerar insights com IA: ${error.message}`);
  }
};
