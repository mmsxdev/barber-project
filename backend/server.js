import express from "express";
import publicRoutes from "./routes/public.js";
import privateRoutes from "./routes/private.js";
import productsRoutes from "./routes/products.js";
import financeRoutes from "./routes/finance.js";
import schedulingRoutes from "./routes/scheduling.js";
import reportRoutes from "./routes/reportRoutes.js";
import auth from "./Middleware/auth.js";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
// Configuração segura do CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://barber-project-nine.vercel.app"] // Altere para seu domínio em produção
    : ["http://localhost:5173"]; // Porta do seu frontend (Vite/React)

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Barber Online");
});

// Middleware de segurança
app.use((req, res, next) => {
  res.header("X-Frame-Options", "DENY");
  res.header("Content-Security-Policy", "default-src 'self'");
  res.header("Permissions-Policy", "geolocation=(), microphone=()");
  next();
});

app.use("/", publicRoutes);
app.use("/", auth, privateRoutes);
app.use("/", auth, productsRoutes);
app.use("/", auth, financeRoutes);
app.use("/", auth, schedulingRoutes);
app.use("/reports", auth, reportRoutes);

prisma
  .$connect()
  .then(() => {
    console.log("Banco de dados conectado!!");
  })
  .catch((error) => {
    console.log("Erro ao conectar no banco de dados: ", error);
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
