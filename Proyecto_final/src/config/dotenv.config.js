import dotenv from "dotenv";
import { Command } from "commander";
import __dirname from "../path.js";
import path from "path";

const program = new Command();

program
  .option("-d", "Variable para debug", false) //(comando, descripción, valor default)
  .option("-p <port>", "Puerto del servidor", 8080)
  .option("--mode <mode>", "Modo de trabajo", "development")
  //<mode> es el argumento a colocar (ponemos por defecto en modo desarrollo)
  .requiredOption(
    "-u <user>",
    "Usuario utilizando el aplicativo",
    "No se ha declarado un usuario"
  )
  //Para requiredOption el tercer argumento es un mensaje de error en caso de que no se especifique.
  .option("-l, --letters [letters...]", "Letra de prueba para mi app");
program.parse(); //parse se utiliza para cerrar la configuración de comandos.

//console.log(config);
//console.log(program.opts());
const environment = "PRODUCTION";

const options = program.opts();
console.log(options);
//console.log(typeof options); //Es un objeto.
console.log(options.mode);

let mode;

//Validación para que no ingrese valores inexistentes.
if (options.mode === "development" || options.mode === "production") {
  mode = options.mode;
} else {
  mode = "development";
}

//dotenv.config(); //Indicamos a la computadora que cargue las variables del archivo .env

dotenv.config({
  //La constante environment indicará a qué entorno apuntar.
  path:
    //environment === "PRODUCTION" ? "../.env.production" : "../.env.development", // condición ? true : false
    //environment === `../.env.${resultado}`, //No anda.
    path.resolve(__dirname, `../.env.${mode}`),
});

export default {
  user: process.env.USER,
  port: process.env.PORT,
  url_mongo: process.env.URL_MONGO,
  pass_mongo: process.env.PASS_MONGO,
  clientID: process.env.clientID, //Tiene los datos correctos solamente en modo production
  clientSecret: process.env.clientSecret, //Tiene los datos correctos solamente en modo production
  //username: process.env.USERNAME,
  //password: process.env.PASSWORD,
};
