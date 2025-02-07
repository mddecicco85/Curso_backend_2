import mongoose from "mongoose";
//import { Schema, model } from "mongoose"; //Puedo importar sólo lo que necesito,
//y luego hacer Schema() en vez de mongoose.Schema() (ídem con model)
import cartModel from "./cart.js"; //Lo importo para crear carrito al crear usuario.

const userCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    default: "Usuario",
  },
  //El problema es que cart pertenece a otro modelo.
  cart: {
    type: mongoose.Schema.Types.ObjectId, //Ídem el otro caso en el modelo carrito.
    ref: "carts", //Hace referencia a la colección "carts".
  },
});

//Acá hago POST y no PRE como en el carrito, porque quiero que cree el carrito después de crear al usuario.
userSchema.post("save", async function name(userCreated) {
  try {
    //No llamo a un controlador en un modelo. Por eso no uso el createCart de carts.controller.js
    //El controlador está pensado para trabajar con rutas, y devolver carteles.
    const newCart = await cartModel.create({ products: [] });
    userCreated.cart = newCart._id; //En el atributo cart guardo solamente el id del carrito.
    await userCreated.save(); //Guardo los cambios en el usuario.
  } catch (error) {
    console.log("Error al crear el carrito del usuario ", error);
  }
}); //Posterior a generarse el usuario (con save)

//El model se debe crear después de setear el creado del carrito.
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
