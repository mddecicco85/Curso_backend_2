import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./../controllers/products.controller.js";
import { authorization } from "../config/middlewares.js";

const productRouter = Router();

//Tareas que pueden realizar todos los roles.
productRouter.get("/", getProducts); //No va getProducts() con ()
productRouter.get("/:pid", getProduct);
//Tareas que puede realizar sólo un administrador.
productRouter.post("/", authorization("Admin"), createProduct);
productRouter.put("/:pid", authorization("Admin"), updateProduct);
productRouter.delete("/:pid", authorization("Admin"), deleteProduct);

export default productRouter;
