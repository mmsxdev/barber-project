import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middleware/auth.js";
import { checkRole } from "../Middleware/role.js";

const prisma = new PrismaClient();
const router = express.Router();

// Middleware de autenticação aplicado a todas as rotas deste arquivo
router.use(auth);

// Rota para listar todos os produtos
router.get("/produtos", checkRole(["SECRETARY", "ADMIN"]), async (req, res) => {
  try {
    const produtos = await prisma.product.findMany();
    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

// Rota para adicionar um novo produto
router.post(
  "/produtos",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    const { name, price, description, quantityInStock } = req.body;

    if (!name || !price || !description || !quantityInStock) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    try {
      const novoProduto = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          description,
          quantityInStock: parseInt(quantityInStock), // Corrigido para quantityInStock
        },
      });
      res.status(201).json(novoProduto);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  }
);

// Rota para atualizar um produto existente
router.put(
  "/produtos/:id",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { name, price, description, quantityInStock } = req.body;

    if (!name || !price || !description || !quantityInStock) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    try {
      const produtoAtualizado = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          price: parseFloat(price),
          description,
          quantityInStock: parseInt(quantityInStock), // Corrigido para quantityInStock
        },
      });
      res.status(200).json(produtoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }
);

// Rota para deletar um produto
router.delete(
  "/produtos/:id",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      res.status(500).json({ error: "Erro ao deletar produto" });
    }
  }
);

export default router;
