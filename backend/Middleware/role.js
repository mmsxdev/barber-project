export const checkRole = (allowedRoles) => (req, res, next) => {
  // Agora usamos req.user.role, pois o auth já define req.user
  const userRole = req.user && req.user.role;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Acesso não autorizado." });
  }

  next();
};
