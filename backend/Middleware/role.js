// Middlewares/role.js
export const checkRole = (allowedRoles) => (req, res, next) => {
  const userRole = req.userRole; // Obtido do middleware auth

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Acesso não autorizado." });
  }

  next();
};
