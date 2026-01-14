import User from "../models/User";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { hashPassword, checkPassword } from "../utils/auth";
import slug from "slug";

const getUserByParameter = async (field: string, value: String) => {
  try {
    const user = await User.findOne({ [field]: value });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};



const createAccount = async (req: Request, res: Response) => {

  try {
    const { email, password, handle } = req.body;
    const userExists = await getUserByParameter("email", email);
    const handleExists = await getUserByParameter("handle", slug(handle, ""));

    if (userExists) {
      const error = new Error("Ya existe un usuario registrado con el email ingresado.");
      return res.status(400).json({ error: error.message });
    }
    if (handleExists) {
      const error = new Error("El handle ya está en uso");
      return res.status(400).json({ error: error.message });
    }

    const newUser = new User(req.body);
    newUser.password = await hashPassword(password);
    newUser.handle = slug(handle, "");
    await newUser.save();
    res.status(201).json({ message: "Usuario creado exitosamente", user: newUser });
  } catch (e) {
    const error = new Error("Error al crear el usuario");
    res.status(500).json({ error: error.message });
  }
};


const login = async (req: Request, res: Response) => {
  const{email, password} = req.body
  try {
    const userExists = await getUserByParameter('email', email )
    if(!userExists){
      const error = new Error("Las crendenciales ingresadas son incorrectas.")
      res.status(401).json({error: error.message})
    }
    const isPasswordCorrect = await checkPassword(password, userExists.password)
    if(!isPasswordCorrect){
      const error = new Error('Las crendenciales ingresadas son incorrectas.')
      return res.status(401).json({error: error.message})
    }
  } catch (e) {
    const error = new Error('Ocurrio un error, por favor intente de nuevo mas tarde.')
    res.status(500).json({error: error.message})
  }

};

export { createAccount, login };
