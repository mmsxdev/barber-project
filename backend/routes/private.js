import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middleware/auth.js";
import bcrypt from "bcrypt";
import { checkRole } from "../Middleware/role.js";
import { validateCPF } from "../Middleware/cpfValidator.js";

const prisma = new PrismaClient();
const router = express.Router();

// Middleware de autenticação aplicado a todas as rotas deste arquivo
router.use(auth);

// 👇 LISTAR TODOS OS USUÁRIOS (APENAS ADMIN)
router.get("/listar-usuarios", checkRole(["ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        cpf: true,
        role: true, // Garantir que a role é retornada
      },
    });

    res
      .status(200)
      .header("X-Content-Type-Options", "nosniff")
      .json({ message: "Usuários listados com sucesso!", users });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor!" });
  }
});

// 👇 DELETAR USUÁRIO (APENAS ADMIN)
router.delete(
  "/deletar-usuario/:cpf",
  checkRole(["ADMIN"]),
  validateCPF,
  async (req, res) => {
    try {
      const { cpf } = req.params;
      const user = await prisma.user.delete({
        where: { cpf },
        select: { id: true, name: true, cpf: true }, // Não retornar senha
      });

      res.status(200).json({ message: "Usuário deletado com sucesso!", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro no servidor!" });
    }
  }
);

// 👇 EDITAR USUÁRIO (APENAS ADMIN)
router.patch(
  "/editar-usuario/:cpf",
  checkRole(["ADMIN"]),
  validateCPF,
  async (req, res) => {
    try {
      const { cpf } = req.params;
      const { name, password, role } = req.body;

      const validRoles = ["ADMIN", "BARBER", "SECRETARY"];

      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: "Role inválida!" });
      }
      // Valida se a role é válida (opcional, mas recomendado)

      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      const user = await prisma.user.update({
        where: { cpf },
        data: {
          name,
          role, // Permite alterar a role (apenas ADMIN chega aqui)
          ...(hashedPassword && { password: hashedPassword }),
        },
        select: { id: true, name: true, cpf: true, role: true }, // Não retornar senha
      });

      res.status(200).json({ message: "Usuário editado com sucesso!", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro no servidor!" });
    }
  }
);

// 👇 LISTAR UM USUÁRIO ESPECÍFICO (APENAS ADMIN)
router.get(
  "/listar-usuario/:cpf",
  checkRole(["ADMIN"]),
  validateCPF,
  async (req, res) => {
    try {
      const { cpf } = req.params;
      const user = await prisma.user.findUnique({
        where: { cpf },
        select: { id: true, name: true, cpf: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro no servidor!" });
    }
  }
);

export default router;
