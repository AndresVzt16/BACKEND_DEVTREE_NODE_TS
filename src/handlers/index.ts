import User from "../models/User";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { hashPassword, checkPassword } from "../utils/auth";
import { sendMessage } from "../services/email.services";
import slug from "slug";
import { generateJWT } from "../utils/jwt";
import { EmailMessage } from "../services/email.services";
import { generateUIID } from "../helpers";

const genericMessage =
  "Las crendenciales ingresadas son incorrectas o el usuario no mantiene una cuenta activa.";

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
      const error = new Error(
        "Ya existe un usuario registrado con el email ingresado.",
      );
      return res.status(400).json({ error: error.message });
    }
    if (handleExists) {
      const error = new Error("El handle ya está en uso");
      return res.status(400).json({ error: error.message });
    }

    const newUser = new User(req.body);

    newUser.password = await hashPassword(password);
    newUser.handle = slug(handle, "");
    newUser.token = generateUIID();

    const subject = "Registro Devtree";
    const dataEmail: EmailMessage = Object.assign({}, newUser.toObject(), {
      subject,
      dateRegister: new Date(),
    });
    const sendInstructions = await sendMessage(dataEmail);
    if (!sendInstructions) {
      const error = new Error(
        "Error al crear la cuenta. Por favor intenta de nuevo mas tarde.",
      );
      return res.status(500).json({ error: error.message });
    }

    await newUser.save();
    res.status(201).json({
      message: `Usuario creado exitosamente, se han emitido las instrucciones al correo:
        ${newUser.email}`,
      user: newUser,
    });
  } catch (e) {
    const error = new Error("Error al crear el usuario");
    res.status(500).json({ error: error.message });
  }
};

const activateAccount = async (req: Request, res: Response) => {
  const token = req.params.token;
  try {
    const user = await getUserByParameter("token", token);
    if (!user) {
      const error = new Error("Token no valido");
      res.status(404).json({ error: error.message });
    }
    user.confirmed = true;
    user.token = null;
    await user.save();
    return res.status(200).json({ message: "Cuenta activada correctamente." });
  } catch (e) {
    const error = new Error("Error al verificar el token");
    res.status(500).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userExists = await getUserByParameter("email", email);
    if (!userExists) {
      const error = new Error(genericMessage);
      res.status(401).json({ error: error.message });
    }
    const isPasswordCorrect = await checkPassword(
      password,
      userExists.password,
    );
    if (!isPasswordCorrect) {
      const error = new Error(genericMessage);
      return res.status(401).json({ error: error.message });
    }

    if (!userExists.confirmed) {
      const error = new Error(genericMessage);
      return res.status(401).json({ error: error.message });
    }
    const token = generateJWT({ id: userExists._id });
    res.send(token);
  } catch (e) {
    const error = new Error(
      "Ocurrio un error, por favor intente de nuevo mas tarde.",
    );
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req: Request, res: Response) => {
  res.json(req.User);
};

export { createAccount, login, getUser, activateAccount };
