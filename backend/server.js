import express from "express";
import publicRoutes from "./routes/public.js";
import privateRoutes from "./routes/private.js";
import products from "./routes/products.js";
import auth from "./Middleware/auth.js";
import cors from "cors";

const app = express();

// Configuração segura do CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://seu-site-real.com"] // Altere para seu domínio em produção
    : ["http://localhost:5173"]; // Porta do seu frontend (Vite/React)

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true, // Se estiver usando cookies/tokens
  })
);

app.use(express.json());
app.use("/", publicRoutes);
app.use("/", auth, privateRoutes);
app.use("/", auth, products);

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
