import express from "express";
import { checkRole } from "../Middleware/role.js";
import auth from "../Middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Criar agendamento (rota protegida)
router.post(
  "/schedulings",
  auth, // Middleware de autenticação aplicado individualmente
  checkRole(["SECRETARY", "ADMIN", "BARBER"]),
  async (req, res) => {
    try {
      const { clientName, dateTime, service, barberId } = req.body;

      if (!clientName || !dateTime || !service || !barberId) {
        return res
          .status(400)
          .json({ error: "Preencha todos os campos obrigatórios" });
      }

      // Verificar se o barbeiro existe
      const barber = await prisma.user.findUnique({
        where: { id: barberId, role: "BARBER" },
      });

      if (!barber) {
        return res.status(400).json({ error: "Barbeiro inválido" });
      }

      // Criar agendamento
      const scheduling = await prisma.scheduling.create({
        data: {
          clientName,
          dateTime: new Date(dateTime),
          service,
          barberId,
          userId: req.user.id,
          status: "CONFIRMED",
        },
        include: {
          barber: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      });

      res.status(201).json(scheduling);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      res.status(500).json({ error: "Erro ao criar agendamento" });
    }
  }
);

// Listar agendamentos (rota protegida)
router.get("/schedulings", auth, async (req, res) => {
  try {
    const { startDate, endDate, barberId, status } = req.query;

    // Converter strings de data para objetos Date
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const where = {
      ...(start &&
        end && {
          dateTime: {
            gte: start,
            lte: end,
          },
        }),
      ...(barberId && { barberId }),
      ...(status && { status }),
    };

    const schedulings = await prisma.scheduling.findMany({
      where,
      include: {
        barber: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    res.json(schedulings);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao carregar agendamentos" });
  }
});

// Listar barbeiros (rota pública)
router.get("/schedulings/barbers", async (req, res) => {
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

// Atualizar agendamento (rota protegida)
router.put(
  "/schedulings/:id",
  auth,
  checkRole(["SECRETARY", "ADMIN", "BARBER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, clientName, service, dateTime, barberId } = req.body;

      const scheduling = await prisma.scheduling.update({
        where: { id },
        data: {
          status,
          clientName,
          service,
          dateTime: dateTime ? new Date(dateTime) : undefined,
          barberId,
        },
        include: {
          barber: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      });

      res.json(scheduling);
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      res.status(400).json({ error: "Erro ao atualizar agendamento" });
    }
  }
);

// Deletar agendamento (rota protegida)
router.delete(
  "/schedulings/:id",
  auth,
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    try {
      await prisma.scheduling.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      res.status(400).json({ error: "Erro ao deletar agendamento" });
    }
  }
);

// Rota para cliente fazer agendamento (pública, sem autenticação)
router.post("/client", async (request, response) => {
  try {
    const { clientName, phone, dateTime, service, barberId, status } =
      request.body;

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

    // Criar o agendamento
    const scheduling = await prisma.scheduling.create({
      data: {
        clientName,
        dateTime: new Date(dateTime),
        service,
        status: "PENDING", // Status inicial sempre pendente
        barberId,
        userId: barberId, // Usar o barbeiro como criador
        phone, // Armazenar o telefone do cliente
      },
    });

    response.status(201).json({
      message: "Agendamento realizado com sucesso! Aguarde a confirmação.",
      scheduling,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento de cliente:", error);
    response.status(500).json({ error: "Erro ao processar seu agendamento." });
  }
});

export default router;
