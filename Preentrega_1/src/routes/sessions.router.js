import { Router } from "express";
import {
  register,
  login,
  githubLogin,
} from "../controllers/sessions.controller.js";
import passport from "passport"; //Acá también lo vamos a usar.

const sessionRouter = Router();

sessionRouter.post("/login", passport.authenticate("login"), login);
sessionRouter.post("/register", passport.authenticate("register"), register); //Agregué el middleware.

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user: email"] }),
  async (req, res) => {}
);
//A api/sessions/github voy cuando aprieto el botón "Ingresar con Github".
//passport va a mandar la info hacia el callback especificado.

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }), //Si falla, lo manda de nuevo al "login".
  githubLogin
);
//Este callback tiene que coincidir con el seteado en mi aplicación de Github.
//La función githubLogin se encarga de hacer la redirección hacia el "home" (ver en el controlador).

sessionRouter.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => res.send(req.user)
);

export default sessionRouter;
