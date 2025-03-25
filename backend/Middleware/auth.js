import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigins = []; // Defina os domínios permitidos se necessário

const auth = (request, response, next) => {
  const token = request.headers.authorization;

  if (!token) {
    return response
      .status(401)
      .header("WWW-Authenticate", 'Bearer realm="Access to admin API"')
      .json({ message: "Acesso Negado!" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      JWT_SECRET,
      { algorithms: ["HS256"] } // Força um algoritmo específico
    );
    // Cria um objeto user para manter os dados do usuário
    request.user = { id: decoded.id, role: decoded.role };
  } catch (error) {
    return response
      .status(401)
      .json({ message: "Token inválido ou expirado!" });
  }

  // Se necessário, verifique a origem da requisição (para produção)
  if (
    process.env.NODE_ENV === "production" &&
    !allowedOrigins.includes(request.headers.origin)
  ) {
    return response.status(403).json({ message: "Acesso não permitido" });
  }

  next();
};

export default auth;
