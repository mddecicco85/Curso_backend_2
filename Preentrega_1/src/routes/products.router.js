import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./../controllers/products.controller.js";

const productRouter = Router();

productRouter.get("/", getProducts); //No va getProducts() con ()
productRouter.get("/:pid", getProduct);
productRouter.post("/", createProduct);
productRouter.put("/:pid", updateProduct);
productRouter.delete("/:pid", deleteProduct);

export default productRouter;
