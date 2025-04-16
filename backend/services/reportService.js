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

// Configuração do diretório de uploads
const getUploadsDir = () => {
  if (process.env.NODE_ENV === "production") {
    return "/tmp/uploads";
  }
  return path.join(__dirname, "../uploads");
};

const createUploadsDir = () => {
  const dir = getUploadsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
createUploadsDir();

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
          service: {
            select: {
              id: true,
              name: true,
              price: true,
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
          clientName: item.clientName || "N/A",
          service: item.service?.name || "N/A",
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

        // Configurar colunas com margens e configurações de layout melhores
        insightsSheet.properties.defaultRowHeight = 18;
        insightsSheet.properties.outlineProperties = {
          summaryBelow: false,
          summaryRight: false,
        };

        // Adicionar título principal
        const titleRow = insightsSheet.addRow([
          "Insights e Análises Geradas por IA",
        ]);
        titleRow.height = 30;
        titleRow.font = {
          name: "Arial",
          size: 16,
          bold: true,
          color: { argb: "2F5597" },
        };
        insightsSheet.mergeCells(`A1:B1`);
        titleRow.alignment = { vertical: "middle", horizontal: "center" };

        // Definir estilos para diferentes níveis
        const h1Style = {
          font: {
            bold: true,
            size: 14,
            color: { argb: "2F5597" },
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E9EFF7" },
          },
          border: {
            bottom: { style: "thin", color: { argb: "4472C4" } },
          },
        };

        const h2Style = {
          font: {
            bold: true,
            size: 12,
            color: { argb: "2F5597" },
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "EDF2FA" },
          },
        };

        const normalTextStyle = {
          font: { size: 11 },
          alignment: {
            wrapText: true,
            vertical: "top",
          },
        };

        // Processar os insights em seções formatadas
        const aiTextLines = data.aiInsights.split("\n");
        let currentRowNum = 2; // Começando após o título
        let inSection = false;
        let sectionTitle = "";
        let sectionContent = [];

        // Adicionar linhas em branco para espaçamento
        insightsSheet.addRow([""]);
        currentRowNum++;

        aiTextLines.forEach((line, index) => {
          const trimmedLine = line.trim();

          // Identificar cabeçalhos numerados (ex: "1. Resumo executivo")
          if (/^\d+\.\s+.+/.test(trimmedLine)) {
            // Se já estiver em uma seção, adicione-a primeiro
            if (inSection && sectionContent.length > 0) {
              const contentText = sectionContent.join("\n");
              const contentRow = insightsSheet.addRow(["", contentText]);
              contentRow.getCell(2).alignment = normalTextStyle.alignment;
              contentRow.font = normalTextStyle.font;
              sectionContent = [];
            }

            // Adicionar cabeçalho principal (H1)
            const headerRow = insightsSheet.addRow([trimmedLine, ""]);
            headerRow.getCell(1).font = h1Style.font;
            headerRow.getCell(1).fill = h1Style.fill;
            headerRow.getCell(1).border = h1Style.border;
            headerRow.height = 24;
            insightsSheet.mergeCells(`A${currentRowNum}:B${currentRowNum}`);

            inSection = true;
            sectionTitle = trimmedLine;
            currentRowNum++;

            // Adicionar linha em branco para espaçamento
            insightsSheet.addRow(["", ""]);
            currentRowNum++;

            // Identificar subcabeçalhos
          } else if (trimmedLine.endsWith(":") && trimmedLine.length < 50) {
            // Adicionar subcabeçalho (H2)
            const subheaderRow = insightsSheet.addRow(["", trimmedLine]);
            subheaderRow.getCell(2).font = h2Style.font;
            subheaderRow.getCell(2).fill = h2Style.fill;
            subheaderRow.height = 20;
            currentRowNum++;

            // Linhas vazias - apenas para espaçamento
          } else if (trimmedLine === "" && sectionContent.length > 0) {
            // Se houver conteúdo acumulado, adicione-o
            const contentText = sectionContent.join("\n");
            const contentRow = insightsSheet.addRow(["", contentText]);
            contentRow.getCell(2).alignment = normalTextStyle.alignment;
            contentRow.font = normalTextStyle.font;
            sectionContent = [];
            currentRowNum++;

            // Adicionar linha em branco para espaçamento
            insightsSheet.addRow(["", ""]);
            currentRowNum++;

            // Conteúdo normal
          } else if (trimmedLine !== "") {
            // Remover marcadores Markdown de negrito
            const cleanLine = trimmedLine.replace(/\*\*/g, "");
            sectionContent.push(cleanLine);
          }
        });

        // Adicionar qualquer conteúdo restante
        if (sectionContent.length > 0) {
          const contentText = sectionContent.join("\n");
          const contentRow = insightsSheet.addRow(["", contentText]);
          contentRow.getCell(2).alignment = normalTextStyle.alignment;
          contentRow.font = normalTextStyle.font;
        }

        // Ajustar largura das colunas
        insightsSheet.getColumn(1).width = 20;
        insightsSheet.getColumn(2).width = 80;
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

      // Cores do tema
      const colors = {
        primary: "#2F5597",
        secondary: "#4472C4",
        accent: "#A5A5A5",
        light: "#E9EFF7",
        dark: "#333333",
      };

      // Função auxiliar para adicionar cabeçalho de seção
      const addSectionHeader = (text) => {
        doc
          .fillColor(colors.primary)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(text)
          .moveDown(0.5);

        // Adicionar linha horizontal após o título
        const currentY = doc.y;
        doc
          .strokeColor(colors.secondary)
          .lineWidth(1)
          .moveTo(50, currentY)
          .lineTo(doc.page.width - 50, currentY)
          .stroke();

        doc.moveDown(0.5);
      };

      // Função auxiliar para adicionar subcabeçalho
      const addSubHeader = (text) => {
        doc
          .fillColor(colors.secondary)
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(text)
          .moveDown(0.5);
      };

      // Função para texto normal
      const addNormalText = (text) => {
        doc
          .fillColor(colors.dark)
          .fontSize(10)
          .font("Helvetica")
          .text(text)
          .moveDown(0.5);
      };

      // Função para destacar valor
      const addHighlightedValue = (label, value) => {
        doc
          .fillColor(colors.dark)
          .fontSize(10)
          .font("Helvetica")
          .text(label, { continued: true })
          .fillColor(colors.primary)
          .font("Helvetica-Bold")
          .text(` ${value}`)
          .fillColor(colors.dark)
          .font("Helvetica")
          .moveDown(0.3);
      };

      // Cabeçalho do documento
      const addPageHeader = () => {
        // Adicionar faixa de cabeçalho
        doc.fillColor(colors.primary).rect(0, 0, doc.page.width, 80).fill();

        // Título do relatório
        doc
          .fillColor("white")
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("Relatório Mensal", 50, 30, {
            align: "center",
          });

        // Período do relatório
        const startDateObj = new Date(data.period?.startDate || new Date());
        const endDateObj = new Date(data.period?.endDate || new Date());

        doc
          .fillColor("white")
          .fontSize(12)
          .font("Helvetica")
          .text(
            `Período: ${startDateObj.toLocaleDateString(
              "pt-BR"
            )} a ${endDateObj.toLocaleDateString("pt-BR")}`,
            50,
            55,
            {
              align: "center",
            }
          );

        // Linha decorativa
        doc
          .strokeColor("white")
          .lineWidth(1)
          .moveTo(150, 75)
          .lineTo(doc.page.width - 150, 75)
          .stroke();

        doc.moveDown(3); // Espaço após o cabeçalho
      };

      // Rodapé para todas as páginas
      const addPageFooter = () => {
        const pageNumber = doc.page.pageNumber;
        const today = new Date().toLocaleDateString("pt-BR");

        doc
          .fillColor(colors.accent)
          .fontSize(8)
          .font("Helvetica")
          .text(
            `Relatório gerado em ${today} | Página ${pageNumber}`,
            50,
            doc.page.height - 50,
            {
              align: "center",
            }
          );
      };

      // Adicionar cabeçalho na primeira página
      addPageHeader();
      // Adicionar rodapé na primeira página
      addPageFooter();

      // Resumo Financeiro
      addSectionHeader("Resumo Financeiro");

      const totalRevenue = data.financialData
        .filter((item) => item.type === "INCOME")
        .reduce((total, item) => total + item.value, 0);

      const totalExpenses = data.financialData
        .filter((item) => item.type === "EXPENSE")
        .reduce((total, item) => total + item.value, 0);

      // Adicionar grid com estatísticas
      const boxWidth = (doc.page.width - 100 - 20) / 3; // 3 caixas com 10px de margem entre elas
      const boxHeight = 70;
      const boxY = doc.y;

      // Caixa de receitas
      doc
        .fillColor(colors.light)
        .roundedRect(50, boxY, boxWidth, boxHeight, 5)
        .fill();
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("TOTAL DE RECEITAS", 60, boxY + 15, { width: boxWidth - 20 });
      doc
        .fillColor(colors.dark)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`R$ ${totalRevenue.toFixed(2)}`, 60, boxY + 35, {
          width: boxWidth - 20,
        });

      // Caixa de despesas
      doc
        .fillColor(colors.light)
        .roundedRect(50 + boxWidth + 10, boxY, boxWidth, boxHeight, 5)
        .fill();
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("TOTAL DE DESPESAS", 60 + boxWidth + 10, boxY + 15, {
          width: boxWidth - 20,
        });
      doc
        .fillColor(colors.dark)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`R$ ${totalExpenses.toFixed(2)}`, 60 + boxWidth + 10, boxY + 35, {
          width: boxWidth - 20,
        });

      // Caixa de lucro líquido
      doc
        .fillColor(colors.light)
        .roundedRect(50 + (boxWidth + 10) * 2, boxY, boxWidth, boxHeight, 5)
        .fill();
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("LUCRO LÍQUIDO", 60 + (boxWidth + 10) * 2, boxY + 15, {
          width: boxWidth - 20,
        });
      doc
        .fillColor(totalRevenue - totalExpenses >= 0 ? "#007F00" : "#BF0000")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(
          `R$ ${(totalRevenue - totalExpenses).toFixed(2)}`,
          60 + (boxWidth + 10) * 2,
          boxY + 35,
          { width: boxWidth - 20 }
        );

      doc.y = boxY + boxHeight + 20;

      // Detalhes Financeiros
      addSubHeader("Detalhes das Transações");

      if (data.financialData.length > 0) {
        // Cabeçalhos da tabela
        const tableTop = doc.y;
        const tableHeaders = ["Data", "Tipo", "Valor", "Descrição"];
        const columnWidth = (doc.page.width - 100) / tableHeaders.length;

        // Desenhar cabeçalho da tabela
        doc
          .fillColor(colors.primary)
          .rect(50, tableTop, doc.page.width - 100, 20)
          .fill();

        tableHeaders.forEach((header, i) => {
          doc
            .fillColor("white")
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(header, 50 + columnWidth * i, tableTop + 5, {
              width: columnWidth,
              align: "center",
            });
        });

        // Linhas da tabela
        let rowTop = tableTop + 20;

        data.financialData.slice(0, 10).forEach((item, index) => {
          // Alternar cores de fundo
          if (index % 2 === 0) {
            doc
              .fillColor("#F5F5F5")
              .rect(50, rowTop, doc.page.width - 100, 20)
              .fill();
          }

          doc
            .fillColor(colors.dark)
            .fontSize(9)
            .font("Helvetica")
            .text(item.date.toLocaleDateString("pt-BR"), 50, rowTop + 5, {
              width: columnWidth,
              align: "center",
            })
            .text(
              item.type === "INCOME" ? "Receita" : "Despesa",
              50 + columnWidth,
              rowTop + 5,
              { width: columnWidth, align: "center" }
            )
            .text(
              `R$ ${item.value.toFixed(2)}`,
              50 + columnWidth * 2,
              rowTop + 5,
              { width: columnWidth, align: "center" }
            )
            .text(item.description, 50 + columnWidth * 3, rowTop + 5, {
              width: columnWidth,
              align: "left",
            });

          rowTop += 20;
        });

        if (data.financialData.length > 10) {
          doc
            .fillColor(colors.accent)
            .fontSize(9)
            .font("Helvetica-Oblique")
            .text(
              `... e mais ${data.financialData.length - 10} transações`,
              50,
              rowTop + 5,
              { align: "center" }
            );

          rowTop += 20;
        }

        doc.y = rowTop + 20;
      } else {
        addNormalText("Nenhuma transação registrada no período.");
      }

      doc.addPage();
      addPageHeader();
      addPageFooter(); // Adicionar rodapé após criar a página

      // Agendamentos
      addSectionHeader("Agendamentos");
      addHighlightedValue(
        "Total de Agendamentos:",
        `${data.appointments.length}`
      );

      const serviceCount = {};
      data.appointments.forEach((appointment) => {
        serviceCount[appointment.service?.name] =
          (serviceCount[appointment.service?.name] || 0) + 1;
      });

      addSubHeader("Serviços Mais Populares");

      if (Object.keys(serviceCount).length > 0) {
        // Gráfico visual simples para representar os serviços populares
        const sortedServices = Object.entries(serviceCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        const maxCount = sortedServices[0][1];
        const barHeight = 25;
        const barSpacing = 10;
        const barTop = doc.y;
        const maxBarWidth = 300;

        sortedServices.forEach(([service, count], index) => {
          const barWidth = (count / maxCount) * maxBarWidth;
          const y = barTop + (barHeight + barSpacing) * index;

          // Barra
          doc
            .fillColor(colors.secondary)
            .rect(100, y, barWidth, barHeight)
            .fill();

          // Rótulo do serviço
          doc
            .fillColor(colors.dark)
            .fontSize(10)
            .font("Helvetica")
            .text(service, 50, y + 7, { width: 40, align: "right" });

          // Contagem
          doc
            .fillColor(colors.primary)
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(`${count}`, 100 + barWidth + 5, y + 7);
        });

        doc.y = barTop + (barHeight + barSpacing) * sortedServices.length + 20;
      } else {
        addNormalText("Nenhum agendamento registrado no período.");
      }

      doc.addPage();
      addPageHeader();
      addPageFooter(); // Adicionar rodapé após criar a página

      // Estoque
      addSectionHeader("Estoque");

      const lowStock = data.inventory.filter(
        (product) => product.quantityInStock < 10
      );

      if (lowStock.length > 0) {
        addSubHeader("Produtos com Baixo Estoque");

        // Criar tabela para produtos com baixo estoque
        const tableTop = doc.y;
        const tableHeaders = ["Produto", "Estoque Atual", "Status"];
        const columnWidth = (doc.page.width - 100) / tableHeaders.length;

        // Desenhar cabeçalho da tabela
        doc
          .fillColor(colors.primary)
          .rect(50, tableTop, doc.page.width - 100, 20)
          .fill();

        tableHeaders.forEach((header, i) => {
          doc
            .fillColor("white")
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(header, 50 + columnWidth * i, tableTop + 5, {
              width: columnWidth,
              align: "center",
            });
        });

        // Linhas da tabela
        let rowTop = tableTop + 20;

        lowStock.forEach((product, index) => {
          // Alternar cores de fundo
          if (index % 2 === 0) {
            doc
              .fillColor("#F5F5F5")
              .rect(50, rowTop, doc.page.width - 100, 20)
              .fill();
          }

          // Status color
          const statusColor =
            product.quantityInStock <= 5 ? "#BF0000" : "#FF9900";

          doc
            .fillColor(colors.dark)
            .fontSize(9)
            .font("Helvetica")
            .text(product.name, 50, rowTop + 5, {
              width: columnWidth,
              align: "left",
            })
            .text(
              `${product.quantityInStock} unidades`,
              50 + columnWidth,
              rowTop + 5,
              { width: columnWidth, align: "center" }
            );

          // Status cell with background color
          doc
            .fillColor(statusColor)
            .rect(50 + columnWidth * 2, rowTop, columnWidth, 20)
            .fill()
            .fillColor("white")
            .fontSize(9)
            .font("Helvetica-Bold")
            .text(
              product.quantityInStock <= 5 ? "CRÍTICO" : "BAIXO",
              50 + columnWidth * 2,
              rowTop + 5,
              { width: columnWidth, align: "center" }
            );

          rowTop += 20;
        });

        doc.y = rowTop + 20;
      } else {
        addNormalText("Não há produtos com baixo estoque.");
      }

      // Se houver insights de IA, adicionar uma página para eles
      if (data.aiInsights) {
        doc.addPage();
        addPageHeader();
        addPageFooter(); // Adicionar rodapé após criar a página

        addSectionHeader("Insights Gerados por IA");

        // Processar o texto da IA para formatação adequada
        const aiTextLines = data.aiInsights.split("\n");
        let currentFont = "Helvetica";
        let currentSize = 10;

        // Limitar o tamanho das insights para evitar problemas de memória
        const maxLines = 100; // Limita a quantidade de linhas processadas
        const processedLines = aiTextLines.slice(0, maxLines);

        processedLines.forEach((line) => {
          // Pular linhas vazias mas manter espaço
          if (line.trim() === "") {
            doc.moveDown(0.5);
            return;
          }

          // Tratar cabeçalhos numerados (ex: "1. Resumo executivo")
          if (/^\d+\.\s+.+/.test(line)) {
            doc
              .fillColor(colors.primary)
              .font("Helvetica-Bold")
              .fontSize(14)
              .text(line.trim())
              .moveDown();
            return;
          }

          // Tratar subcabeçalhos (linhas que terminam com ":")
          if (line.trim().endsWith(":") && line.length < 50) {
            doc
              .fillColor(colors.secondary)
              .font("Helvetica-Bold")
              .fontSize(12)
              .text(line.trim())
              .moveDown(0.5);
            return;
          }

          // Tratar texto comum
          doc.fillColor(colors.dark).font("Helvetica").fontSize(10);

          // Texto simples sem formatação complexa para evitar problemas
          doc.text(line.trim());
        });

        // Se truncamos o texto, adicionar uma nota
        if (aiTextLines.length > maxLines) {
          doc
            .fillColor(colors.accent)
            .fontSize(9)
            .font("Helvetica-Italic")
            .text(
              "Nota: O texto completo dos insights foi truncado para otimizar o desempenho."
            );
        }
      }

      doc.end();

      // Esperar o stream terminar de escrever
      await new Promise((resolve) => stream.on("finish", resolve));

      return filePath;
    } catch (error) {
      console.error("Erro no generatePDFReport:", error);
      throw error;
    }
  }
}

export default new ReportService();
