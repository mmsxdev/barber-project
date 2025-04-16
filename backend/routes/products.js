import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middleware/auth.js";
import { checkRole } from "../Middleware/role.js";

const prisma = new PrismaClient();
const router = express.Router();

router.use(auth);

const formatPriceForDatabase = (priceInput) => {
  if (typeof priceInput === "number") return priceInput;

  const priceStr = priceInput.toString();
  const normalized = priceStr.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Math.round(value * 100) / 100;
};

router.get("/produtos", checkRole(["SECRETARY", "ADMIN"]), async (req, res) => {
  try {
    const produtos = await prisma.product.findMany();
    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

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
      const formattedPrice = formatPriceForDatabase(price);

      const novoProduto = await prisma.product.create({
        data: {
          name,
          price: formattedPrice,
          description,
          quantityInStock: parseInt(quantityInStock),
        },
      });
      res.status(201).json(novoProduto);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  }
);

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
      const formattedPrice = formatPriceForDatabase(price);

      const produtoAtualizado = await prisma.product.update({
        where: { id: id },
        data: {
          name,
          price: formattedPrice,
          description,
          quantityInStock: parseInt(quantityInStock),
        },
      });
      res.status(200).json(produtoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }
);

router.delete(
  "/produtos/:id",
  checkRole(["SECRETARY", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.product.delete({
        where: { id: id },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      res.status(500).json({ error: "Erro ao deletar produto" });
    }
  }
);

export default router;
