import { Router } from "express";
import {
  register,
  login,
  githubLogin,
} from "../controllers/sessions.controller.js";
import passport from "passport"; //Acá también lo vamos a usar.
import { passportCall } from "../config/passport.config.js";
import { authorization } from "../config/middlewares.js"; //Importo sólo la función.

const sessionRouter = Router();

sessionRouter.get("/viewLogin", (req, res) => res.render("templates/login"));
sessionRouter.get("/viewRegister", (req, res) =>
  res.render("templates/register")
);
sessionRouter.post("/login", passport.authenticate("login"), login);
sessionRouter.post(
  "/register",
  passport.authenticate("register", { session: false }), //ESTO FALLA Y DEVUELVE UNAUTHORIZED
  register
); //Agregué el middleware.

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

//CON ESTO NO ANDA
sessionRouter.get(
  "/current",
  passportCall("jwt"),
  authorization("Admin"),
  (req, res) =>
    //Sólo lo dejo entrar con el rol "Admin".
    res.send(req.user)
);

/* sessionRouter.get("/current", passportCall("jwt"), (req, res) =>
  res.send(req.user)
); */

//CON ESTO IMPRIME SIEMPRE EL MISMO USUARIO
/* sessionRouter.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => res.send(req.user)
); */

export default sessionRouter;
