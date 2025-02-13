import userModel from "../models/users.js";
import { createHash } from "../utils/bcrypt.js";

export const getUser = async (req, res) => {
  try {
    const idUser = req.params.uid;
    const user = await userModel.findById(idUser);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(400).send("Usuario no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    //No pongo if porque no puede haber errores ahí (a lo sumo users está vacío).
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, age, rol, password } = req.body;
    const newUser = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      age: age,
      rol: rol,
      password: createHash(password),
    };
    await userModel.create(newUser);
    res.status(201).send(newUser); //200 es OK, 201 es Created.
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(400).send("Usuario no encontrado.");
    } else {
      const { first_name, last_name, email, age } = req.body;
      const userUpdated = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        age: age,
      };
      await userModel.updateOne({ _id: userId }, userUpdated);
      res.send({ status: "Success", payload: userUpdated }); //Si modifico sólo un campo, devuleve ese solo.
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(400).send("Usuario no encontrado.");
    } else {
      await userModel.deleteOne({ _id: userId });
      res.status(200).send("Usuario eliminado.");
    }
  } catch (error) {
    console.log(error);
    res.status.send(error);
  }
};
