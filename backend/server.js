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

const prisma = new PrismaClient();

const app = express();

// Configuração CORS Atualizada (testada em produção)
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://barber-project-nine.vercel.app",
      "http://localhost:5173",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.set("trust proxy", 1);
app.options("*", cors(corsOptions)); // Habilitar preflight para todas as rotas

app.use(express.json());

app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.send("Backend Barber Online");
});
app.use("/", publicRoutes);
app.use("/", auth, privateRoutes);
app.use("/", auth, productsRoutes);
app.use("/", auth, financeRoutes);
app.use("/", auth, schedulingRoutes);
app.use("/reports", auth, reportRoutes);

// Após a configuração do CORS
app.use((req, res, next) => {
  res.header("X-Frame-Options", "DENY");
  res.header("Content-Security-Policy", "default-src 'self'");
  res.header("Permissions-Policy", "geolocation=(), microphone=()");
  next();
});

prisma
  .$connect()
  .then(() => {
    console.log("Banco de dados conectado!!");
  })
  .catch((error) => {
    console.log("Erro ao conectar no banco de dados: ", error);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
