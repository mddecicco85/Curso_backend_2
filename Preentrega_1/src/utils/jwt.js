import jwt from "jsonwebtoken";

const secretKey = "codercoder";

export const generateToken = (user) => {
  //Param1: Objeto a guardar (user en este caso)
  //Param2: clave secreta
  //Param3: tiempo de vida del token.
  //Si no pongo Param3 el token nace ya expirado, no sirve para nada (aunque sí lo descifra)
  const token = jwt.sign({ user }, secretKey, { expiresIn: "1h" }); //"1m" es un minuto, "1d" es un día
  return token;
};

//Hacemos uno de prueba.
/* let tokenGenerado = generateToken({
    first_name: "Francisco",
    last_name: "Peña",
    email: "fran@gmail.com",
    age: 31,
    rol: "Usuario"
}); */

/* let tokenGenerado = generateToken({
  first_name: "Manuel",
  last_name: "Di Muro",
  email: "manu@gmail.com",
  age: 21,
  rol: "Usuario",
});
console.log(tokenGenerado); */
