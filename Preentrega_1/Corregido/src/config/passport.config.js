import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import userModel from "../models/users.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";

const localStrategy = local.Strategy; //Defino la estrategia local.
const JWTStrategy = jwt.Strategy; //Defino la estrategia jwt.
const ExtractJWT = jwt.ExtractJwt;

//Defino cookieExtractor
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    //Si recibí petición y además tiene cookies.
    token = req.cookies["coderCookie"]; //Consulto solamente por las cookies con este nombre.
    //console.log(req.cookies);
  }
  console.log("token_passport:", token);
  return token;
};

//Middleware para errores de passport
export const passportCall = (strategy) => {
  return async (req, res, next) => {
    //Vale para cualquier estrategia que venga por parámetro.
    passport.authenticate(
      strategy,
      (function (err, user, info) {
        //console.log(user);
        if (err) {
          return next(err); //Si hay error, lo devuelvo.
        }
        if (!user) {
          //Si el token no tiene el usuario, que muestre mensaje con el error (que no está autenticado, etc)
          return res
            .status(401)
            .send({ error: info.messages ? info.messages : info.toString() });
        }
        req.user = user; //Si está, que lo guarde.
        next();
      })(req, res, next)
    );
  };
};

const initializePassport = () => {
  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        //passReqToCallback permite acceder al objeto req.
        try {
          const { first_name, last_name, email, age, rol, password } = req.body;
          const findUser = await userModel.findOne({ email });
          if (findUser) {
            //console.log("Ya existe un usuario con ese correo.");
            return done(null, false, {
              message: "Ya existe un usuario con ese correo.",
            }); //No hay error pero no creo un nuevo usuario.
          } else {
            //Si no existe, lo crea.
            const newUser = {
              first_name,
              last_name,
              email,
              age,
              rol,
              //password: password, //No se debe almacenar. Lo guardo para que compare.
              password: createHash(password),
            };
            const user = await userModel.create(newUser);
            console.log(user);
            //console.log("Usuario creado correctamente.");
            return done(null, user); //Si devuelvo newUser en vez de user, no tiene generado el _id
          }
        } catch (error) {
          //console.log("Error al crear el usuario."); //Los mensajes van en el controlador.
          return done(error); //Los res.send van en el controlador, no acá. Eso es info para el usuario.
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        //No uso req.body porque los datos ya vienen por parámetro. El res.send va en el controlador.
        try {
          const user = await userModel.findOne({ email: username }); //Reviso si está registrado ese correo.
          if (user && validatePassword(password, user.password)) {
            //Si existe el correo, y la contraseña es correcta.
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Los datos ingresados con incorrectos.",
            });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Para registrarse con GitHub
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv23liE70qnr2V4o57Bv", //NO subir esto a Github, mandar por mensaje al tutor.
        clientSecret: "e4c5aeb23ac610c8bceb5152a7b82021d7d14678", //NO subir esto a Github, mandar por mensaje al tutor.
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile); //Se recomienda ver la toda la información que viene del perfil.
          //console.log(accessToken);
          //console.log(refreshToken);
          let user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            //Si el usuario no existe, lo creamos en la DB.
            let newUser = {
              first_name: profile._json.name, //Nombre del usuario (puede no ser nombre real).
              last_name: " ", //GitHub no tiene el apellido de los usuarios.
              email: profile._json.email,
              age: 18, //Si no viene un dato, lo relleno.
              password: "1234", //Al ser autenticación de terceros, no necesitamos asignar password.
            };
            let result = await userModel.create(newUser);
            done(null, result);
          } else {
            //Si ya existe, devuelvo ese user.
            //Se loguea de nuevo con el mismo email, user= true y no lo vuelvo a registrar.
            done(null, user);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  //Estrategia JWT
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]), //De dónde extraigo el token.
        secretOrKey: "codercoder", //Tiene que ser la misma que se usa para generar el token.
      },
      async (jwt_payload, done) => {
        try {
          //return done(null, jwt_payload); //Si sale bien.
          return done(null, jwt_payload.user); //Por si user viene dentro de otro objeto jwt_payload
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //serializeUser y deserializeUser valen para cualquier estrategia, por eso van fuera de los passport.use()
  /* passport.serializeUser((user, done) => {
    //Se ejecuta al autenticar. Decide qué datos guardar del usuario (en general ID)
    console.log("Serializando usuario:", user);
    if (user?._id) {
      //Si me logueo con la estrategia login, user es el objeto usuario
      done(null, user._id); //Devuelve el ID del usuario.
    } else {
      //Si me logueo con la estrategia jwt, user es un objeto que tiene a nuestro objeto usuario dentro.
      //Por eso se pone dos veces.
      done(null, user.user._id);
    }
  }); */

  passport.serializeUser((user, done) => {
    //Se ejecuta al autenticar. Decide qué datos guardar del usuario (en general ID)
    console.log("Serializando usuario:", user);
    done(null, user._id); //Devuelve el ID del usuario.
  });

  passport.deserializeUser(async (id, done) => {
    //Se ejecuta en solicitudes posteriores, para recuperar los datos del usuario (ej. acceder a /privado)
    //Es async porque busca en la DB.
    try {
      console.log("Deserializando usuario con ID:", id);
      const user = await userModel.findById(id);
      //console.log("usuario: ", user);
      done(null, user); //Devuelve el objeto user que encontró en la DB a partir de su ID.
    } catch (error) {
      done(error);
    }
  });

  /* // serializeUser y deserializeUser valen para cualquier estrategia, por eso van fuera de los passport.use()
  passport.serializeUser((user, done) => {
    console.log("Serializando usuario:", user);
    if (!user._id) {
      console.error("ID de usuario no definido durante la serialización.");
      return done(new Error("ID de usuario no definido"));
    }
    done(null, user._id); // Devuelve el ID del usuario.
  });

  passport.deserializeUser(async (id, done) => {
    console.log("hola");
    console.log("Deserializando usuario con ID:", id);
    try {
      const user = await userModel.findById(id);
      if (!user) {
        console.error("No se encontró el usuario durante la deserialización.");
        return done(new Error("Usuario no encontrado"));
      }
      console.log("Usuario deserializado:", user);
      done(null, user); // Devuelve el objeto user que encontró en la DB a partir de su ID.
    } catch (error) {
      console.error("Error durante la deserialización:", error);
      done(error, null);
    }
  }); */
};

export default initializePassport;
