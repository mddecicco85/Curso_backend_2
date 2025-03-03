export const authorization = (role) => {
  return async (req, res, next) => {
    //Consulto si existe una sesión activa.
    //No aparece nunca porque sale primero el error de que falta el token del login.
    if (!req.user) return res.status(401).send("No autenticado.");
    if (req.user.rol != role) return res.status(403).send("No autorizado.");
    next();
  };
};
