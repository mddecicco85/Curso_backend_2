import { Router } from "express";
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js"; //Importo solamente lo que necesito del controlador.

const router = Router();

router.get("/:uid", getUser); //Pongo directamente las funciones importadas, que ya son asíncronas.
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;
