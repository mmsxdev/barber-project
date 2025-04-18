import express from "express";
import publicRoutes from "./routes/public.js";
import privateRoutes from "./routes/private.js";
import productsRoutes from "./routes/products.js";
import financeRoutes from "./routes/finance.js";
import schedulingRoutes from "./routes/scheduling.js";
import publicSchedulingRoutes from "./routes/public-scheduling.js";
import reportRoutes from "./routes/reportRoutes.js";
import webhookRoutes from "./routes/webhook.js";
import servicesRoutes from "./routes/services.js";
import clientsRoutes from "./routes/clients.js";
import commissionsRoutes from "./routes/commissions.js";
import auth from "./Middleware/auth.js";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import whatsappService from "./services/whatsappService.js";

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

// Rate limiting para prevenir sobrecarga
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Cache-Control para respostas estáticas
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
  }
  next();
});

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

// Rotas públicas (sem autenticação)
app.use("/", publicRoutes);
app.use("/public/scheduling", publicSchedulingRoutes);
app.use("/webhook", webhookRoutes);

// Rotas protegidas (com autenticação)
app.use("/", auth, privateRoutes);
app.use("/", auth, productsRoutes);
app.use("/", auth, financeRoutes);
app.use("/", auth, schedulingRoutes);
app.use("/reports", auth, reportRoutes);
app.use("/services", auth, servicesRoutes);
app.use("/clients", auth, clientsRoutes);
app.use("/commissions", auth, commissionsRoutes);

// Rotas
app.use("/api", routes);

prisma
  .$connect()
  .then(() => {
    console.log("Banco de dados conectado!!");
  })
  .catch((error) => {
    console.log("Erro ao conectar no banco de dados: ", error);
  });

// Inicialização do WhatsApp
whatsappService.initialize();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
