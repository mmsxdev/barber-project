import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

  async generateExcelReport(data, fileName) {
    try {
      const workbook = new ExcelJS.Workbook();

      // Planilha Financeira
      const financialSheet = workbook.addWorksheet("Financeiro");
      financialSheet.columns = [
        { header: "Data", key: "date" },
        { header: "Tipo", key: "type" },
        { header: "Valor", key: "value" },
        { header: "Usuário", key: "user" },
        { header: "Produto", key: "product" },
      ];

      data.financialData.forEach((item) => {
        financialSheet.addRow({
          date: item.date.toLocaleDateString("pt-BR"),
          type: item.type,
          value: item.value,
          user: item.user?.name || "N/A",
          product: item.product?.name || "N/A",
        });
      });

      // Planilha de Agendamentos
      const appointmentsSheet = workbook.addWorksheet("Agendamentos");
      appointmentsSheet.columns = [
        { header: "Data/Hora", key: "dateTime" },
        { header: "Cliente", key: "clientName" },
        { header: "Barbeiro", key: "barber" },
        { header: "Criado por", key: "createdBy" },
      ];

      data.appointments.forEach((item) => {
        appointmentsSheet.addRow({
          dateTime: item.dateTime.toLocaleString("pt-BR"),
          clientName: item.clientName,
          barber: item.barber?.name || "N/A",
          createdBy: item.createdBy?.name || "N/A",
        });
      });

      // Planilha de Estoque
      const inventorySheet = workbook.addWorksheet("Estoque");
      inventorySheet.columns = [
        { header: "Produto", key: "name" },
        { header: "Quantidade", key: "quantity" },
        { header: "Preço", key: "price" },
      ];

      data.inventory.forEach((item) => {
        inventorySheet.addRow({
          name: item.name,
          quantity: item.quantityInStock,
          price: item.price,
        });
      });

      const filePath = path.join(uploadsDir, fileName);
      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (error) {
      console.error("Erro no generateExcelReport:", error);
      throw error;
    }
  }

  async generatePDFReport(data, fileName) {
    try {
      const doc = new PDFDocument();
      const filePath = path.join(uploadsDir, fileName);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Cabeçalho
      doc.fontSize(18).text("Relatório Mensal", { align: "center" });
      doc.moveDown();

      // Seção Financeira
      doc.fontSize(14).text("Transações Financeiras");
      data.financialData.forEach((item) => {
        doc
          .fontSize(10)
          .text(`Data: ${item.date.toLocaleDateString("pt-BR")}`)
          .text(`Valor: R$ ${item.value.toFixed(2)}`)
          .text(`Responsável: ${item.user?.name || "N/A"}`)
          .moveDown();
      });

      doc.addPage();

      // Seção Agendamentos
      doc.fontSize(14).text("Agendamentos");
      data.appointments.forEach((item) => {
        doc
          .fontSize(10)
          .text(`Data: ${item.dateTime.toLocaleString("pt-BR")}`)
          .text(`Cliente: ${item.clientName}`)
          .text(`Barbeiro: ${item.barber?.name || "N/A"}`)
          .moveDown();
      });

      doc.addPage();

      // Seção Estoque
      doc.fontSize(14).text("Estoque de Produtos");
      data.inventory.forEach((item) => {
        doc
          .fontSize(10)
          .text(`Produto: ${item.name}`)
          .text(`Quantidade: ${item.quantityInStock}`)
          .text(`Preço: R$ ${item.price.toFixed(2)}`)
          .moveDown();
      });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
      });
    } catch (error) {
      console.error("Erro no generatePDFReport:", error);
      throw error;
    }
  }
}

const reportService = new ReportService();
export default reportService;
