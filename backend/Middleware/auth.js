import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigins = [
  "https://barber-project-nine.vercel.app",
  "http://localhost:5173",
];

const auth = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response
      .status(401)
      .header("WWW-Authenticate", 'Bearer realm="Access to admin API"')
      .json({ message: "Acesso Negado!" });
  }

  try {
    // Verifica se o header começa com "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Token inválido');
    }

    // Remove o prefixo "Bearer " e verifica o token
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    
    // Cria um objeto user para manter os dados do usuário
    request.user = { id: decoded.id, role: decoded.role };
  } catch (error) {
    console.log("Erro na verificação do token:", error);
    return response
      .status(401)
      .json({ message: "Token inválido ou expirado!" });
  }

  // Verifica a origem da requisição
  if (process.env.NODE_ENV === "production") {
    const origin = request.headers.origin;
    if (!allowedOrigins.includes(origin)) {
      console.log("Origem não permitida:", origin);
      return response.status(403).json({ message: "Acesso não permitido" });
    }
  }

  next();
};

export default auth;
