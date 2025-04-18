import express from "express";
import { checkRole } from "../Middleware/role.js";
import auth from "../Middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Criar agendamento (rota protegida)
router.post(
  "/schedulings",
  auth, // Middleware de autenticação aplicado individualmente
  checkRole(["SECRETARY", "ADMIN", "BARBER"]),
  async (req, res) => {
    try {
      const { clientName, dateTime, service, barberId, clientId, phone, email } = req.body;

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

      // Verificar se o serviço existe
      const serviceObj = await prisma.service.findFirst({
        where: { name: service }
      });

      if (!serviceObj) {
        return res.status(400).json({ error: "Serviço inválido" });
      }

      // Usar transação para criar cliente e agendamento em uma única operação
      const result = await prisma.$transaction(async (tx) => {
        // Criar ou conectar o cliente
        let client;
        if (clientId) {
          // Se o clientId foi fornecido, verificar se o cliente existe
          client = await tx.client.findUnique({
            where: { id: clientId }
          });
          
          if (!client) {
            throw new Error("Cliente não encontrado");
          }
        } else {
          // Se não foi fornecido clientId, criar um novo cliente
          client = await tx.client.create({
            data: {
              name: clientName,
              phone: phone || null,
              email: email || null
            }
          });
        }

        // Criar agendamento
        const scheduling = await tx.scheduling.create({
          data: {
            clientId: client.id,
            clientName: clientName,
            dateTime: new Date(dateTime),
            serviceId: serviceObj.id,
            barberId,
            userId: req.user.id,
            status: "CONFIRMED",
            phone: phone || null,
          },
          include: {
            barber: { select: { name: true } },
            createdBy: { select: { name: true } },
            client: { select: { name: true, phone: true, email: true } },
            service: { select: { name: true, price: true, duration: true } }
          },
        });

        return scheduling;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      if (error.message === "Cliente não encontrado") {
        return res.status(400).json({ error: "Cliente não encontrado" });
      }
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

    // Fazer uma única consulta otimizada com todos os relacionamentos necessários
    const schedulings = await prisma.scheduling.findMany({
      where,
      include: {
        barber: { select: { name: true } },
        createdBy: { select: { name: true } },
        client: true,
        service: true,
      },
      orderBy: { dateTime: "asc" },
    });

    // Processar os resultados para garantir valores padrão
    const processedSchedulings = schedulings.map(scheduling => ({
      ...scheduling,
      clientName: scheduling.clientName || 
                 (scheduling.client ? scheduling.client.name : "Cliente sem nome"),
      barber: scheduling.barber || { name: "Barbeiro não identificado" },
      createdBy: scheduling.createdBy || { name: "Usuário não identificado" },
      service: scheduling.service || { name: "Serviço não identificado", price: 0, duration: 30 }
    }));

    res.json(processedSchedulings);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
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
      const { status, clientName, service, dateTime, barberId, clientId, phone, email } = req.body;

      // Verificar se o agendamento existe
      const existingScheduling = await prisma.scheduling.findUnique({
        where: { id }
      });

      if (!existingScheduling) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      // Verificar se o serviço existe
      let serviceId = existingScheduling.serviceId;
      if (service) {
        const serviceObj = await prisma.service.findFirst({
          where: { name: service }
        });

        if (!serviceObj) {
          return res.status(400).json({ error: "Serviço inválido" });
        }
        serviceId = serviceObj.id;
      }

      // Verificar se o barbeiro existe
      if (barberId) {
        const barber = await prisma.user.findUnique({
          where: { id: barberId, role: "BARBER" },
        });

        if (!barber) {
          return res.status(400).json({ error: "Barbeiro inválido" });
        }
      }

      // Usar transação para atualizar cliente e agendamento
      const result = await prisma.$transaction(async (tx) => {
        // Atualizar ou criar cliente se necessário
        let clientIdToUse = existingScheduling.clientId;
        if (clientName && !clientId) {
          // Criar novo cliente
          const newClient = await tx.client.create({
            data: {
              name: clientName,
              phone: phone || null,
              email: email || null
            }
          });
          clientIdToUse = newClient.id;
        } else if (clientId) {
          // Verificar se o cliente existe
          const client = await tx.client.findUnique({
            where: { id: clientId }
          });
          
          if (!client) {
            throw new Error("Cliente não encontrado");
          }
          clientIdToUse = clientId;
        }

        // Atualizar o agendamento
        const scheduling = await tx.scheduling.update({
          where: { id },
          data: {
            status,
            clientId: clientIdToUse,
            clientName: clientName || undefined,
            serviceId,
            dateTime: dateTime ? new Date(dateTime) : undefined,
            barberId,
            phone: phone || undefined,
          },
          include: {
            barber: { select: { name: true } },
            createdBy: { select: { name: true } },
            client: { select: { name: true, phone: true, email: true } },
            service: { select: { name: true, price: true, duration: true } }
          },
        });

        return scheduling;
      });

      res.json(result);
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      if (error.message === "Cliente não encontrado") {
        return res.status(400).json({ error: "Cliente não encontrado" });
      }
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
    const { clientName, phone, email, dateTime, service, barberId } = request.body;

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

    // Verificar se o serviço existe
    const serviceObj = await prisma.service.findFirst({
      where: { name: service }
    });

    if (!serviceObj) {
      return response.status(400).json({ error: "Serviço inválido" });
    }

    // Usar transação para criar cliente e agendamento em uma única operação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o cliente
      const client = await tx.client.create({
        data: {
          name: clientName,
          phone,
          email: email || null
        }
      });

      // Criar o agendamento
      const scheduling = await tx.scheduling.create({
        data: {
          clientId: client.id,
          dateTime: new Date(dateTime),
          serviceId: serviceObj.id,
          status: "PENDING", // Status inicial sempre pendente
          barberId,
          userId: barberId, // Usar o barbeiro como criador
        },
        include: {
          client: { select: { name: true, phone: true, email: true } },
          service: { select: { name: true, price: true, duration: true } },
          barber: { select: { name: true } }
        }
      });

      return scheduling;
    });

    response.status(201).json({
      message: "Agendamento realizado com sucesso! Aguarde a confirmação.",
      scheduling: result,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento de cliente:", error);
    response.status(500).json({ error: "Erro ao processar seu agendamento." });
  }
});

export default router;
