import express from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { checkRole } from "../Middleware/role.js";
import auth from "../Middleware/auth.js";
import { validateCPF } from "../Middleware/cpfValidator.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 20 requisições por IP
});

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//CADASTRO DE USUÁRIO
router.post("/cadastro", apiLimiter, validateCPF, async (request, response) => {
  //Tenta cadastrar um usuário
  try {
    //Recebe os dados do usuário
    const user = request.body;

    //Verifica se o usuário já existe
    const userExists = await prisma.user.findUnique({
      where: { cpf: user.cpf },
    });
    //Se o usuário já existir, exibe a mensagem abaixo
    if (userExists) {
      return response.status(400).json({ error: "Usuário já cadastrado!" });
    }
    //Criptografa da senha do usuário
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);
    //Caso o usuário não exista, cria um novo usuário
    await prisma.user.create({
      data: {
        name: user.name,
        cpf: user.cpf,
        password: hashPassword,
        role: user.role,
      },
    });
    response.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    //Caso ocorra um erro, exibe a mensagem abaixo
    response.status(500).json({ error: "Erro no servidor!" });
  }
});

//LOGIN DE USUÁRIOS
router.post("/login", apiLimiter, validateCPF, async (request, response) => {
  //Tenta logar um usuário
  try {
    const userInfo = request.body;
    const user = await prisma.user.findUnique({
      where: { cpf: userInfo.cpf },
    });
    //Se o usuário não existir, exibe a mensagem abaixo
    if (!user) {
      return response.status(404).json({ error: "Usuário não encontrado!" });
    }
    //Compara a senha digitada com a senha criptografada
    const validPassword = await bcrypt.compare(
      userInfo.password,
      user.password
    );
    //Se a senha for inválida, exibe a mensagem abaixo
    if (!validPassword) {
      return response.status(400).json({ error: "Senha inválida!" });
    }

    //Gera um token de autenticação JWT para o usuário
    const token = jwt.sign(
      { id: user.id, role: user.role.toUpperCase() },
      process.env.JWT_SECRET,
      {
        expiresIn: "20h",
        algorithm: "HS256",
        issuer: "http://localhost:5173",
      }
    );
    response
      .header(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains"
      )
      .status(200)
      .json({ message: "Login realizado com sucesso! Token abaixo:", token });

    //Caso ocorra um erro, exibe a mensagem abaixo
  } catch (error) {
    response.status(500).json({ error: "Erro no servidor!" });
  }
});

export default router;
