import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middleware/auth.js";
import { checkRole } from "../Middleware/role.js";

const prisma = new PrismaClient();
const router = express.Router();

// Middleware de autenticação aplicado a todas as rotas deste arquivo
router.use(auth);
