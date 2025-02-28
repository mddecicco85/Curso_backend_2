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

const cartRouter = Router();

cartRouter.get("/:cid", getCart);
cartRouter.post("/", createCart);
cartRouter.post("/:cid/products/:pid", insertProductCart);
cartRouter.put("/:cid", updateProductCart);
cartRouter.put("/:cid/products/:pid", updateQuantityProductCart);
cartRouter.delete("/:cid/products/:pid", deleteProductCart);
cartRouter.delete("/:cid", deleteCart);

export default cartRouter;
