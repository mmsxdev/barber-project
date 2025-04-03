import express from "express";
import reportService from "../services/reportService.js";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/monthly", async (req, res) => {
  console.log("Nova requisição de relatório:", req.body);

  try {
    const { startDate, endDate, format, useAI } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Datas obrigatórias não informadas" });
    }

    let reportData;
    try {
      if (useAI) {
        reportData = await reportService.generateMonthlyReportWithAI(
          startDate,
          endDate
        );
      } else {
        reportData = await reportService.generateMonthlyReport(
          startDate,
          endDate
        );
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      return res.status(500).json({
        error:
          "Erro ao gerar relatório: " + (error.message || "Erro desconhecido"),
      });
    }

    const fileName = `relatorio_${
      new Date().toISOString().split("T")[0]
    }.${format}`;

    let filePath;
    if (format === "excel") {
      filePath = await reportService.generateExcelReport(reportData, fileName);
    } else if (format === "pdf") {
      filePath = await reportService.generatePDFReport(reportData, fileName);
    } else {
      return res.status(400).json({ error: "Formato inválido" });
    }

    res.download(filePath, (err) => {
      if (err) console.error("Erro no download:", err);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Erro ao deletar arquivo:", err);
      });
    });
  } catch (error) {
    console.error("Erro completo na rota:", error);
    res.status(500).json({
      error: "Falha ao gerar relatório",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

export default router;
