import express from "express";
import { PrismaClient } from "@prisma/client";
import schedulingService from "../services/schedulingService.js";

const prisma = new PrismaClient();
const router = express.Router();

// Listar barbeiros (rota pública)
router.get("/barbers", async (req, res) => {
  try {
    const barbers = await prisma.user.findMany({
      where: { role: "BARBER" },
      select: { id: true, name: true },
    });
    res.json(barbers);
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    res.status(500).json({ error: "Erro ao carregar barbeiros" });
  }
});

// Listar horários disponíveis (rota pública - mostra apenas horários sem detalhes)
router.get("/slots", async (req, res) => {
  try {
    const schedulings = await prisma.scheduling.findMany({
      select: {
        id: true,
        dateTime: true,
        barberId: true,
        status: true,
      },
      orderBy: { dateTime: "asc" },
    });

    // Formatar apenas os dados necessários sem expor detalhes do cliente
    const formattedSchedulings = schedulings.map((s) => ({
      id: s.id,
      dateTime: s.dateTime,
      barberId: s.barberId,
      status: s.status,
    }));

    res.json(formattedSchedulings);
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    res.status(500).json({ error: "Erro ao carregar horários" });
  }
});

// Rota para cliente fazer agendamento (pública, sem autenticação)
router.post("/appointments", async (request, response) => {
  try {
    const { clientName, phone, dateTime, service, barberId } = request.body;

    // Validação básica
    if (!clientName || !phone || !dateTime || !service || !barberId) {
      return response
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // Verificar se o horário já está ocupado
    const existingAppointment = await prisma.scheduling.findFirst({
      where: {
        dateTime: new Date(dateTime),
        barberId: barberId,
      },
    });

    if (existingAppointment) {
      return response.status(400).json({
        error: "Horário já agendado. Por favor, escolha outro horário.",
      });
    }

    // Verificar se o barbeiro existe
    const barber = await prisma.user.findUnique({
      where: { id: barberId, role: "BARBER" },
    });

    if (!barber) {
      return response.status(400).json({ error: "Barbeiro inválido" });
    }

    // Criar o agendamento através do serviço
    const scheduling = await schedulingService.createScheduling({
      clientName,
      dateTime,
      service,
      barberId,
      phone,
    });

    response.status(201).json({
      message:
        "Agendamento realizado com sucesso! Aguarde a confirmação por WhatsApp.",
      scheduling: {
        id: scheduling.id,
        dateTime: scheduling.dateTime,
        service: scheduling.service,
        status: scheduling.status,
      },
    });
  } catch (error) {
    console.error("Erro ao criar agendamento de cliente:", error);
    response.status(500).json({ error: "Erro ao processar seu agendamento." });
  }
});

export default router;
