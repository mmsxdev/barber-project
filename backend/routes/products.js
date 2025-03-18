import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../Middlewares/auth.js";
import { checkRole } from "../Middlewares/role.js";

const prisma = new PrismaClient();
const router = express.Router();
