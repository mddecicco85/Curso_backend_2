//import bcrypt from 'bcrypt';  //Para encriptar las contraseñas. Importa bcrypt completo.
import { hashSync, compareSync, genSaltSync } from "bcrypt"; //Importo lo que necesito.
//Si no hago esto, tengo que poner siempre bcrypt.hashSync, bcrypt.compareSync, etc.

//hashSync toma el password y hace el hasheo a partir de un Salt.
//genSaltSync genera el string Salt, que hace que el hasheo sea impredecible.
//La función devuelve un String con el password hasheado. El proceso es IRREVERSIBLE.

export const createHash = (password) => hashSync(password, genSaltSync(10));

//compareSync toma el password sin hashear y lo compara con el hasheado en la DB. Devuelve true o false.
export const validatePassword = (passIngresada, passBD) => {
  return compareSync(passIngresada, passBD); //compareSync(ingresado, en la DB)
};

//Probando
/* const pass = createHash("hola");
console.log(pass); //A ver cómo quedó.
console.log(validatePassword("hola", pass)); //Así devuelve undefined (sin el return en la función)
console.log(compareSync("hola", pass)); */
