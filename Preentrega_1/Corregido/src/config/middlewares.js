export const authorization = (role) => {
    return async (req, res, next) => {
        //Consulto si existe una sesión activa.
        if (!req.user) return res.status(401).send("No auntenticado.");
        if (req.user.rol != role) return res.status(403).send("No autorizado.");
        next();
    }
}