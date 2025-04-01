import express from "express";
import publicRoutes from "./routes/public.js";
import privateRoutes from "./routes/private.js";
import productsRoutes from "./routes/products.js";
import financeRoutes from "./routes/finance.js";
import schedulingRoutes from "./routes/scheduling.js";
import reportRoutes from "./routes/reportRoutes.js";
import auth from "./Middleware/auth.js";
import cors from "cors";

const app = express();

// Configuração segura do CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://barber-project-nine.vercel.app/"] // Altere para seu domínio em produção
    : ["http://localhost:5173"]; // Porta do seu frontend (Vite/React)

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true, // Se estiver usando cookies/tokens
  })
);

app.set("trust proxy", 1);

app.use(express.json());
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
