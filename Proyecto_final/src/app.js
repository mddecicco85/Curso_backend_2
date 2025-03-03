import express from "express";
import handlebars from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import mongoose from "mongoose"; //mongoose trabaja junto a MongoStore
import MongoStore from "connect-mongo";
import path from "path";
import __dirname from "./path.js";
import passport from "passport"; //Se importa acá también.
import local from "passport-local"; //Se importa acá también.
import initializePassport from "./config/passport.config.js";
import config from "./config/dotenv.config.js"; //Importo la configuración de entornos. config es objeto.
import indexRouter from "./routes/index.router.js";

//Muestra los datos del .env correspondiente
console.log(config);

//Atrapa excepciones que no hayan sido consideradas en algún catch.
process.on("uncaughtException", (exception) => {
  console.log("Se ha producido un error inesperado.");
});

//Creo la aplicación
const app = express();

//Configuro middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser("Secret_password")); //Es un middleware. Lo del paréntesis se pone para las firmadas.
//Si tiene una contraseña, se firman; si no, no.

//Configuro handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views")); //Concatena evitando errores.
app.set("view engine", "handlebars");

//console.log(__dirname);

//Hago un home de prueba
app.get("/", (req, res) => {
  res.status(200).send("Hola desde Inicio.");
});

//Configuro SESSSION. //DEBE CONFIGURARSE ANTES DE PASSPORT Y DE LAS RUTAS
app.use(
  session({
    //Otro middleware
    //store: new fileStorage({ path: "./sessions", ttl: 40, retries: 0 }), //path: dónde se guardan las sesiones.
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://mddecicco85:f5vdeijp0bc6hkse@cluster-integrador.8mf0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-integrador",
      ttl: 3600, //Se va a borrar en 3600 segundos.
    }),
    secret: "secretCoder", //Para evitar que alguien copie los ID's de los usuarios.
    resave: true, //Para que la sesión no muera luego de un tiempo de inactividad.
    saveUninitialized: true, //Se guarda el objeto sesión aun cuando esté vacío.
  })
);

//Configuro PASSPORT
initializePassport(); //Inicializo y habilito el acceso para trabajar con sessions.
app.use(passport.initialize());
app.use(passport.session());

//Rutas (indexRouter maneja todas)
app.use("/", indexRouter);

//Es para que se conecte a la DB para crear los usuarios.
mongoose
  .connect(
    "mongodb+srv://mddecicco85:f5vdeijp0bc6hkse@cluster-integrador.8mf0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-integrador"
  )
  .then(() => console.log("Conectado a la DB."))
  .catch((e) => console.log("Error al conectar con la DB: ", e));

//Crear cookies (siempre con GET porque es solo en en navegador, nada se modifica en el servidor)
app.get("/setCookie", (req, res) => {
  res
    .cookie("Primera_cookie", "Esta es mi primera cookie.", { maxAge: 30000 })
    .send("Cookie creada.");
});

//Crear cookies con firma
app.get("/setSignedCookie", (req, res) => {
  res
    .cookie("Cookie_firmada", "Esta es una cookie firmada.", {
      maxAge: 100000,
      signed: true, //Hay que poner esto también para que sea firmada.
    })
    .send("Cookie creada con firma.");
});

//Obtener cookies (sin firma)
app.get("/getCookies", (req, res) => {
  res.send(req.cookies); //Devuelve todas las que tiene el navegador.
  //res.send(req.cookies.Primera_cookie); //Devuelve la que tiene ese nombre.
});

//Obtener cookies con firma (si se modifican, ya no se puede acceder a ellas)
app.get("/getSignedCookie", (req, res) => {
  res.send(req.signedCookies);
});

//Eliminar cookies (también con GET)
app.get("/deleteCookie", (req, res) => {
  res.clearCookie("Primera_cookie").send("Cookie eliminada.");
});

const server = app.listen(8080, () => console.log("Listening on PORT 8080"));
