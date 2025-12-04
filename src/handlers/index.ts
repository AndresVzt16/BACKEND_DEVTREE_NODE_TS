import User from "../models/User";
import { Request, Response } from "express";
import { hashPassword } from "../utils/auth";

const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userExists = await getUserByEmail(email);
    if (userExists) {
      const error = new Error("El usuario ya existe");
      return res.status(400).json({ error: error.message });
    }
    const newUser = new User(req.body);
    newUser.password = await hashPassword(password);
    await newUser.save();
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", user: newUser });
  } catch (e) {
    const error = new Error("Error al crear el usuario");
    res.status(500).json({ error });
  }
};

const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};

export { createAccount, getUserByEmail };
