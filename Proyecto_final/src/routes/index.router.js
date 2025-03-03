import { Router } from "express";
import sessionRouter from "./sessions.router.js";
import productRouter from "./products.router.js";
import cartRouter from "./carts.router.js";
import userRouter from "./users.router.js";
import viewRouter from "./views.router.js";

const indexRouter = Router();

indexRouter.use("/api/sessions", sessionRouter); //Conviene ponerlo después del middleware de session.
indexRouter.use("/api/products", productRouter);
indexRouter.use("/api/carts", cartRouter);
indexRouter.use("/api/users", userRouter);
indexRouter.use("/", viewRouter);

export default indexRouter;
