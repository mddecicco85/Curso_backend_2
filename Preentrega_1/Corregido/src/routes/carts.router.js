import { Router } from "express";
import {
  getCart,
  createCart,
  insertProductCart,
  updateProductCart,
  updateQuantityProductCart,
  deleteProductCart,
  deleteCart,
} from "../controllers/carts.controller.js";
import { authorization } from "../config/middlewares.js";

const cartRouter = Router();

//Tareas que pueden realizar todos los roles.
cartRouter.get("/:cid", getCart);
//Tareas que sólo puede realizar el Usuario (Admin no tiene carrito propio).
cartRouter.post("/", authorization("Usuario"), createCart); //create no lo usamos, se ejecuta solo.
cartRouter.post("/:cid/products/:pid", authorization("Usuario"), insertProductCart);
cartRouter.put("/:cid", authorization("Usuario"), updateProductCart);
cartRouter.put("/:cid/products/:pid", authorization("Usuario"), updateQuantityProductCart);
cartRouter.delete("/:cid/products/:pid", authorization("Usuario"), deleteProductCart);
cartRouter.delete("/:cid", authorization("Usuario"), deleteCart); //Vacía el carrito, no lo elimina.

export default cartRouter;
