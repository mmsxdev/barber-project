import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateReport } from "../services/reportGenerator.js"; // Supondo que você tenha uma função para gerar insights com IA
import { sanitizeFileName, validateFilePath } from "../services/path.js"; // Função para sanitizar o nome do arquivo

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class ReportService {
  async generateMonthlyReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Buscar dados financeiros com relacionamentos
      const financialData = await prisma.finance.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Buscar agendamentos com relacionamentos
      const appointments = await prisma.scheduling.findMany({
        where: {
          dateTime: {
            gte: start,
            lte: end,
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          barber: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Buscar produtos
      const inventory = await prisma.product.findMany();

      return {
        financialData,
        appointments,
        inventory,
      };
    } catch (error) {
      console.error("Erro no generateMonthlyReport:", {
        message: error.message,
        stack: error.stack,
        details: error,
      });
      throw error;
    }
  }

  async generateMonthlyReportWithAI(startDate, endDate) {
    try {
      const reportData = await this.generateMonthlyReport(startDate, endDate);

      console.log("Dados coletados para IA:", reportData); // Log para debug

      // Gera insights com IA
      let aiInsights;
      try {
        aiInsights = await generateReport(reportData);
        console.log("Insights gerados:", aiInsights); // Log para debug
      } catch (aiError) {
        console.error("Erro ao gerar insights:", aiError);
        aiInsights = "Não foi possível gerar insights neste momento.";
      }

      // Adiciona os insights ao relatório
      return { ...reportData, aiInsights };
    } catch (error) {
      console.error("Erro no generateMonthlyReportWithAI:", error);
      throw error;
    }
  }

  async generateExcelReport(data, fileName) {
    try {
      const safeFileName = sanitizeFileName(fileName);
      const filePath = validateFilePath(safeFileName);

      const workbook = new ExcelJS.Workbook();

      // Estilos
      const headerStyle = {
        font: { bold: true, size: 12, color: { argb: "FFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        },
        alignment: { vertical: "middle", horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const subHeaderStyle = {
        font: { bold: true, size: 11 },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E2EFDA" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const cellStyle = {
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Planilha Financeira
      const financialSheet = workbook.addWorksheet("Financeiro");
      financialSheet.columns = [
        { header: "Data", key: "date", width: 15 },
        { header: "Tipo", key: "type", width: 15 },
        { header: "Valor", key: "value", width: 15 },
        { header: "Usuário", key: "user", width: 20 },
        { header: "Produto", key: "product", width: 20 },
        { header: "Descrição", key: "description", width: 30 },
      ];

      // Aplicar estilos aos cabeçalhos
      financialSheet.getRow(1).font = headerStyle.font;
      financialSheet.getRow(1).fill = headerStyle.fill;
      financialSheet.getRow(1).alignment = headerStyle.alignment;
      financialSheet.getRow(1).border = headerStyle.border;

      data.financialData.forEach((item) => {
        const row = financialSheet.addRow({
          date: item.date.toLocaleDateString("pt-BR"),
          type: item.type === "INCOME" ? "Receita" : "Despesa",
          value: item.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          user: item.user?.name || "N/A",
          product: item.product?.name || "N/A",
          description: item.description,
        });
        row.eachCell((cell) => {
          cell.border = cellStyle.border;
          cell.alignment = { vertical: "middle" };
        });
      });

      // Planilha de Agendamentos
      const appointmentsSheet = workbook.addWorksheet("Agendamentos");
      appointmentsSheet.columns = [
        { header: "Data/Hora", key: "dateTime", width: 20 },
        { header: "Cliente", key: "clientName", width: 25 },
        { header: "Serviço", key: "service", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Barbeiro", key: "barber", width: 20 },
        { header: "Criado por", key: "createdBy", width: 20 },
      ];

      // Aplicar estilos aos cabeçalhos
      appointmentsSheet.getRow(1).font = headerStyle.font;
      appointmentsSheet.getRow(1).fill = headerStyle.fill;
      appointmentsSheet.getRow(1).alignment = headerStyle.alignment;
      appointmentsSheet.getRow(1).border = headerStyle.border;

      data.appointments.forEach((item) => {
        const row = appointmentsSheet.addRow({
          dateTime: item.dateTime.toLocaleString("pt-BR"),
          clientName: item.clientName,
          service: item.service,
          status: item.status,
          barber: item.barber?.name || "N/A",
          createdBy: item.createdBy?.name || "N/A",
        });
        row.eachCell((cell) => {
          cell.border = cellStyle.border;
          cell.alignment = { vertical: "middle" };
        });
      });

      // Planilha de Estoque
      const inventorySheet = workbook.addWorksheet("Estoque");
      inventorySheet.columns = [
        { header: "Produto", key: "name", width: 30 },
        { header: "Descrição", key: "description", width: 40 },
        { header: "Quantidade", key: "quantity", width: 15 },
        { header: "Preço", key: "price", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      // Aplicar estilos aos cabeçalhos
      inventorySheet.getRow(1).font = headerStyle.font;
      inventorySheet.getRow(1).fill = headerStyle.fill;
      inventorySheet.getRow(1).alignment = headerStyle.alignment;
      inventorySheet.getRow(1).border = headerStyle.border;

      data.inventory.forEach((item) => {
        const row = inventorySheet.addRow({
          name: item.name,
          description: item.description,
          quantity: item.quantityInStock,
          price: item.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          status: item.quantityInStock < 10 ? "Baixo Estoque" : "Normal",
        });
        row.eachCell((cell) => {
          cell.border = cellStyle.border;
          cell.alignment = { vertical: "middle" };
        });
      });

      // Adicionar insights gerados por IA (se existirem)
      if (data.aiInsights) {
        const insightsSheet = workbook.addWorksheet("Insights de IA");
        insightsSheet.columns = [
          { header: "Seção", key: "section", width: 30 },
          { header: "Conteúdo", key: "content", width: 100 },
        ];

        // Aplicar estilos aos cabeçalhos
        insightsSheet.getRow(1).font = headerStyle.font;
        insightsSheet.getRow(1).fill = headerStyle.fill;
        insightsSheet.getRow(1).alignment = headerStyle.alignment;
        insightsSheet.getRow(1).border = headerStyle.border;

        // Dividir os insights em seções
        const sections = data.aiInsights.split("\n\n");
        sections.forEach((section) => {
          const [title, ...content] = section.split("\n");
          const row = insightsSheet.addRow({
            section: title.replace(/^\d+\.\s*/, ""),
            content: content.join("\n"),
          });
          row.eachCell((cell) => {
            cell.border = cellStyle.border;
            cell.alignment = { vertical: "top", wrapText: true };
          });
        });
      }

      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (error) {
      console.error("Erro no generateExcelReport:", error);
      throw error;
    }
  }

  async generatePDFReport(data, fileName) {
    try {
      const safeFileName = sanitizeFileName(fileName);
      const filePath = validateFilePath(safeFileName);

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        info: {
          Title: "Relatório Mensal",
          Author: "Sistema de Barbearia",
        },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Função auxiliar para adicionar cabeçalho de seção
      const addSectionHeader = (text) => {
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(text, { underline: true })
          .moveDown();
      };

      // Função auxiliar para adicionar subcabeçalho
      const addSubHeader = (text) => {
        doc.fontSize(12).font("Helvetica-Bold").text(text).moveDown(0.5);
      };

      // Cabeçalho do documento
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("Relatório Mensal", { align: "center" })
        .moveDown();

      // Resumo Financeiro
      addSectionHeader("Resumo Financeiro");

      const totalRevenue = data.financialData
        .filter((item) => item.type === "INCOME")
        .reduce((total, item) => total + item.value, 0);

      const totalExpenses = data.financialData
        .filter((item) => item.type === "EXPENSE")
        .reduce((total, item) => total + item.value, 0);

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Total de Receitas: R$ ${totalRevenue.toFixed(2)}`)
        .text(`Total de Despesas: R$ ${totalExpenses.toFixed(2)}`)
        .text(`Lucro Líquido: R$ ${(totalRevenue - totalExpenses).toFixed(2)}`)
        .moveDown();

      // Detalhes Financeiros
      addSubHeader("Detalhes das Transações");
      data.financialData.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Data: ${item.date.toLocaleDateString("pt-BR")}`)
          .text(`Tipo: ${item.type === "INCOME" ? "Receita" : "Despesa"}`)
          .text(`Valor: R$ ${item.value.toFixed(2)}`)
          .text(`Descrição: ${item.description}`)
          .text(`Responsável: ${item.user?.name || "N/A"}`)
          .moveDown(0.5);
      });

      doc.addPage();

      // Agendamentos
      addSectionHeader("Agendamentos");
      addSubHeader(`Total de Agendamentos: ${data.appointments.length}`);

      const serviceCount = {};
      data.appointments.forEach((appointment) => {
        serviceCount[appointment.service] =
          (serviceCount[appointment.service] || 0) + 1;
      });

      addSubHeader("Serviços Mais Populares");
      Object.entries(serviceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .forEach(([service, count]) => {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${service}: ${count} agendamentos`)
            .moveDown(0.5);
        });

      doc.addPage();

      // Estoque
      addSectionHeader("Estoque");

      const lowStock = data.inventory.filter(
        (product) => product.quantityInStock < 10
      );
      if (lowStock.length > 0) {
        addSubHeader("Produtos com Baixo Estoque");
        lowStock.forEach((product) => {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${product.name}: ${product.quantityInStock} unidades`)
            .moveDown(0.5);
        });
      }

      // Insights de IA (se existirem)
      if (data.aiInsights) {
        doc.addPage();
        addSectionHeader("Insights Gerados por IA");
        doc.fontSize(10).font("Helvetica").text(data.aiInsights);
      }

      doc.end();
      return filePath;
    } catch (error) {
      console.error("Erro no generatePDFReport:", error);
      throw error;
    }
  }
}

export default new ReportService();
