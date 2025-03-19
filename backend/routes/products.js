import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middlewares/auth.js";
import { checkRole } from "../Middlewares/role.js";

const prisma = new PrismaClient();
const router = express.Router();

// Middleware de autenticação aplicado a todas as rotas deste arquivo
router.use(auth);

// 👇 LISTAR TODOS OS USUÁRIOS (APENAS ADMIN)
router.get("/listar-produtos", checkRole(["ADMIN"]), async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res
      .status(200)
      .json({ message: "Produtos listados com sucesso!", products });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor!" });
  }
});

// 👇 EDITAR PRODUTOS (APENAS ADMIN)
router.patch("/editar-produto/:id", checkRole(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
      },
    });

    res.status(200).json({ message: "Produto editado com sucesso!", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor!" });
  }
});

export default router;
