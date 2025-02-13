import express from "express";
import handlebars from "express-handlebars";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users.router.js";
import viewRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import session from "express-session";
import FileStore from "session-file-store";
import mongoose from "mongoose"; //mongoose trabaja junto a MongoStore
import MongoStore from "connect-mongo";
import path from "path";
import __dirname from "./path.js";
import passport from "passport"; //Se importa acá también.
import local from "passport-local"; //Se importa acá también.
import initializePassport from "./config/passport.config.js";

const app = express();
//const fileStorage = FileStore(session); //Conecto session con FileStore

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser("Secret_password")); //Es un middleware. Lo del paréntesis se pone para las firmadas.
//Si tiene una contraseña, se firman; si no, no.
app.use("/api/users", userRouter);

//Configuro handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views")); //Concatena evitando errores.
app.set("view engine", "handlebars");
app.use("/", viewRouter);

//console.log(__dirname);

//Hago un home de prueba
app.get("/", (req, res) => {
  res.status(200).send("Hola desde Inicio.");
});

//Configuro SESSSION
app.use(
  session({
    //Otro middleware
    //store: new fileStorage({ path: "./sessions", ttl: 40, retries: 0 }), //path: dónde se guardan las sesiones.
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://mddecicco85:f5vdeijp0bc6hkse@cluster-integrador.8mf0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-integrador",
      ttl: 15, //Se va a borrar en 15 segundos.
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

app.use("/api/sessions", sessionRouter); //Conviene ponerlo después del middleware de session.
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

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

//Obtener cookies
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

//Crear sesión
app.get("/session", (req, res) => {
  if (req.session.counter) {
    //Si ya existe, incremento.
    req.session.counter++;
    res.send(`Usted visitó el sitio ${req.session.counter} veces.`);
  } else {
    req.session.counter = 1; //Creo la propiedad counter en el objeto session.
    res.send("¡Bienvenido!");
  }
});

//Eliminar sesión (con los datos)
app.get("/logout", (req, res) => {
  //Es más fácil borrar todas las sesiones con destroy, que una sola.
  req.session.destroy((error) => {
    //Se pasa un callback.
    if (!error) {
      res.status(200).send("Se ha deslogueado con éxito.");
    } else {
      res.status(500).send({ status: "Logout error", body: error });
    }
  });
});

//Iniciar sesión
app.get("/login", (req, res) => {
  const { email, password } = req.body;
  if (
    //Pongo dos para poder hacer que uno ingrese al /privado y el otro no.
    (email === "tincho@gmail.com" && password === "1234") ||
    (email === "lolo@gmail.com" && password === "4321")
  ) {
    //Guardo los datos en el objeto session.
    req.session.user = email;
    req.session.admin = true; //Si es true, es un administrador.
    res.status(200).send("Bienvenido.");
  } else {
    res.status(401).send("Los datos ingresados son incorrectos.");
  }
});

//Función middleware para autenticar
function auth(req, res, next) {
  if (!req.session.user) {
    res.status(401).send("Debe iniciar sesión primero.");
  }
  //if (req.session.user === "tincho@gmail.com" && req.session.admin) {
  else if (req.session.user.email === "manu@gmail.com") {
    return next(); //Continúo con la ejecución.
  } else {
    res.status(401).send("Error de autenticación.");
  }
}

//Aplicación del middleware de autenticación
app.get("/privado", auth, (req, res) => {
  //Primero tiene que iniciar sesión con login, para poder comparar los datos.
  res.send("Si estás viendo esto, es porque ya te logueaste.");
});

const server = app.listen(8080, () => console.log("Listening on PORT 8080"));
