import express from "express";
import { checkRole } from "../Middleware/role.js";
import auth from "../Middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.use(auth);

// Criar registro financeiro
router.post(
  "/finances",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    try {
      const { type, value, description, category, productId } = req.body;

      if (!type || !value || !description || !category) {
        return res
          .status(400)
          .json({ error: "Preencha todos os campos obrigatórios." });
      }

      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return res
          .status(400)
          .json({ error: "O valor precisa ser um número válido." });
      }

      // Se for uma venda de produto, verificar e atualizar o estoque
      if (category === "PRODUCT_SALE" && productId) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return res.status(404).json({ error: "Produto não encontrado." });
        }

        if (product.quantityInStock <= 0) {
          return res
            .status(400)
            .json({ error: "Produto sem estoque disponível." });
        }

        // Atualizar o estoque do produto
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantityInStock: {
              decrement: 1,
            },
          },
        });
      }

      const finance = await prisma.finance.create({
        data: {
          type,
          value: parsedValue,
          description,
          category,
          productId: category === "PRODUCT_SALE" ? productId : null,
          userId: req.user.id,
          date: new Date(),
        },
      });

      res.status(201).json(finance);
    } catch (error) {
      console.error("Erro ao criar registro financeiro:", error);
      res.status(500).json({ error: "Erro ao salvar registro financeiro." });
    }
  }
);

// Listar registros financeiros
router.get("/finances", checkRole(["SECRETARY", "ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    // Converter para UTC
    const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;

    const where = {
      ...(startDate &&
        endDate && {
          date: {
            gte: start,
            lte: end,
          },
        }),
      ...(type && { type }),
      ...(category && { category }),
    };

    const finances = await prisma.finance.findMany({
      where,
      include: {
        product: true,
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    res.json(finances);
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    res.status(500).json({ error: "Erro ao carregar registros financeiros." });
  }
});

// Resumo financeiro
router.get(
  "/finances/summary",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Converter para UTC
      const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
      const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;

      const where = {
        ...(startDate &&
          endDate && {
            date: {
              gte: start,
              lte: end,
            },
          }),
      };

      const [incomes, expenses] = await Promise.all([
        prisma.finance.aggregate({
          where: { ...where, type: "INCOME" },
          _sum: { value: true },
        }),
        prisma.finance.aggregate({
          where: { ...where, type: "EXPENSE" },
          _sum: { value: true },
        }),
      ]);

      res.json({
        totalIncome: incomes._sum.value || 0,
        totalExpense: expenses._sum.value || 0,
      });
    } catch (error) {
      console.error("Erro no resumo:", error);
      res.status(500).json({ error: "Erro ao gerar resumo financeiro." });
    }
  }
);

// Atualizar registro financeiro
router.put(
  "/finances/:id",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { type, value, description, category, productId } = req.body;

      // Buscar o registro financeiro atual
      const currentFinance = await prisma.finance.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!currentFinance) {
        return res
          .status(404)
          .json({ error: "Registro financeiro não encontrado." });
      }

      // Se o registro atual é uma venda de produto, restaurar o estoque
      if (
        currentFinance.category === "PRODUCT_SALE" &&
        currentFinance.productId
      ) {
        await prisma.product.update({
          where: { id: currentFinance.productId },
          data: {
            quantityInStock: {
              increment: 1,
            },
          },
        });
      }

      // Se a atualização é para uma venda de produto, verificar e atualizar o estoque
      if (category === "PRODUCT_SALE" && productId) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return res.status(404).json({ error: "Produto não encontrado." });
        }

        if (product.quantityInStock <= 0) {
          return res
            .status(400)
            .json({ error: "Produto sem estoque disponível." });
        }

        // Atualizar o estoque do produto
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantityInStock: {
              decrement: 1,
            },
          },
        });
      }

      const updatedFinance = await prisma.finance.update({
        where: { id },
        data: {
          type,
          value: parseFloat(value),
          description,
          category,
          productId: category === "PRODUCT_SALE" ? productId : null,
        },
      });

      res.json(updatedFinance);
    } catch (error) {
      console.error("Erro ao atualizar registro financeiro:", error);
      res.status(400).json({ error: "Erro ao atualizar registro financeiro." });
    }
  }
);

// Deletar registro financeiro
router.delete(
  "/finances/:id",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    try {
      // Buscar o registro financeiro antes de deletar
      const finance = await prisma.finance.findUnique({
        where: { id: req.params.id },
        include: { product: true },
      });

      if (!finance) {
        return res
          .status(404)
          .json({ error: "Registro financeiro não encontrado." });
      }

      // Se for uma venda de produto, restaurar o estoque
      if (finance.category === "PRODUCT_SALE" && finance.productId) {
        await prisma.product.update({
          where: { id: finance.productId },
          data: {
            quantityInStock: {
              increment: 1,
            },
          },
        });
      }

      await prisma.finance.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      res.status(400).json({
        error: error.message || "Erro ao deletar registro financeiro.",
        details: error.meta?.cause,
      });
    }
  }
);
export default router;
