import express from "express";
import reportService from "../services/reportService.js";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/monthly", async (req, res) => {
  console.log("Nova requisição de relatório:", req.body);

  try {
    const { startDate, endDate, format, useAI } = req.body;

    // Validação
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Datas obrigatórias não informadas" });
    }

    // Gerar dados
    const reportData = useAI
      ? await reportService.generateMonthlyReportWithAI(startDate, endDate)
      : await reportService.generateMonthlyReport(startDate, endDate);

    // Gerar arquivo
    const fileName = `relatorio_${
      new Date().toISOString().split("T")[0]
    }.${format}`;
    const filePath =
      format === "excel"
        ? await reportService.generateExcelReport(reportData, fileName)
        : await reportService.generatePDFReport(reportData, fileName);

    // Download e limpeza
    res.download(filePath, async (err) => {
      if (err) {
        console.error("Erro no download:", {
          error: err,
          path: filePath,
          exists: fs.existsSync(filePath),
        });
        return;
      }

      // Limpar arquivo apenas em produção após 5 minutos
      if (process.env.NODE_ENV === "production") {
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Erro na limpeza:", err);
          });
        }, 300000); // 5 minutos
      }
    });
  } catch (error) {
    console.error("Erro completo:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: "Falha ao gerar relatório",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

export default router;
