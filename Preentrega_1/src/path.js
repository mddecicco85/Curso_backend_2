//IMPORTO LIBRERÍAS QUE VOY A USAR EN app.js
import { fileURLToPath } from "url";
import { dirname } from "path";

//fileURLToPath: Esta función garantiza la decodificación correcta de los caracteres codificados en porcentaje,
//así como una cadena de ruta absoluta válida multiplataforma.
const __filename = fileURLToPath(import.meta.url);

//dirname: Devuelve el nombre de directorio de una ruta.
const __dirname = dirname(__filename);

export default __dirname;