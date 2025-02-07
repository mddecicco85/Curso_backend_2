import userModel from "../models/users.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";
import { generateToken } from "./../utils/jwt.js";

//Registrarse
export const register = async (req, res) => {
  try {
    if (!req.user) {
      //Este user es el que devuelve passport al crear uno nuevo (por eso va el mismo nombre)
      //Si no existe, es que no lo creó y no devolvió nada.
      res.status(400).send("Ya existe un usuario con ese correo.");
    } else {
      res.status(201).send("Usuario creado correctamente."); //200 es OK, 201 es Created.
    }
  } catch (error) {
    console.log(error);
    //res.status(500).send({status: "Error al crear el usuario: ", error: error});
    res.status(500).send("Error al crear el usuario.");
  }
};

//Iniciar sesión
export const login = async (req, res) => {
  try {
    if (!req.user) {
      //deserializeUser no guardó nada en req.user
      res.status(404).send("Los datos ingresados son incorrectos.");
    }
    //Ahora que ya sé que es un usuario válido,
    const token = generateToken(req.user);
    req.session.user = {
      //Recupera los datos del usuario en req.user, y los guarda en req.session
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
    };
    console.log("token_login:", token);
    //req.session.admin = true; //Si es true, es un administrador.
    //res.status(200).redirect(`/?coderCookie=${token}`); //Lo hacemos de otra manera.
    res.cookie("coderCookie", token, {
      //Creo la cookie con ese nombre, y le guardo el token.
      httpOnly: true,
      secure: false, //Evita errores por https (Hay que ponerlo en true al pasarlo a producción)
      maxAge: 3600000, //Tiempo en milisegundos
    });
    res.status(200).redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al loguear usuario.");
  }
};

//Iniciar sesión con GitHub
export const githubLogin = async (req, res) => {
  try {
    if (!req.user) {
      //Si la estrategia no devuelve al usuario. (CREO QUE ESTO NO HACE FALTA)
      return res.status(401).send("Los datos ingresados son incorrectos.");
    }
    //Agregamos el usuario devuelto al objeto sesión.
    req.session.user = {
      email: req.user.email,
      first_name: req.user.first_name,
    };
    res.status(200).redirect("/"); //Si se logueó correctamente, lo redirijo a la "homepage".
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al loguear usuario.");
  }
};
