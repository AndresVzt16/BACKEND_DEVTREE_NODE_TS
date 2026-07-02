import User from "../models/User";
import formidable from "formidable";
import slug from "slug";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { hashPassword, checkPassword } from "../utils/auth";
import { sendMessage } from "../services/email.services";
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
    return res.status(201).json({
      message: `Usuario creado exitosamente, se han emitido las instrucciones al correo:
        ${newUser.email}`,
      user: newUser,
    });
  } catch (e) {
    const error = new Error("Error al crear el usuario");
    return res.status(500).json({ error: error.message });
  }
};

const activateAccount = async (req: Request, res: Response) => {
  const token = req.params.token;
  try {
    const user = await getUserByParameter("token", token);
    if (!user) {
      const error = new Error("Token no valido");
      return res.status(404).json({ error: error.message });
    }
    user.confirmed = true;
    user.token = null;
    await user.save();
    return res.status(200).json({ message: "Cuenta activada correctamente." });
  } catch (e) {
    const error = new Error("Error al verificar el token");
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userExists = await getUserByParameter("email", email);
    if (!userExists) {
      const error = new Error(genericMessage);
      return res.status(401).json({ error: error.message });
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
    return res.send(token);
  } catch (e) {
    const error = new Error(
      "Ocurrio un error, por favor intente de nuevo mas tarde.",
    );
    return res.status(500).json({ error: error.message });
  }
};

const getUser = async (req: Request, res: Response) => {
  return res.json(req.User);
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { description, handle, name, links, tags, location } = req.body;

    const newHandle = slug(handle, "");
    const handleExists = await getUserByParameter("handle", newHandle);
    /* validar que el usuario no duplique el handle */
    if (handleExists && handleExists.email !== req.User.email) {
      const error = new Error("El handle ya esta en uso.");
      return res.status(401).json({ error: error.message });
    }
    req.User.handle = newHandle;
    req.User.description = description;
    req.User.name = name;
    req.User.links = links;
    req.User.tags = tags;
    req.User.location = location;

    await req.User.save();
    return res
      .status(200)
      .json({ message: "Perfil actualizado correctamente." });
    /* const user = await getUserByParameter('_id',) */
  } catch (e) {
    console.log(e);
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};

const deleteImages = async (publicId: string) => {
  try {
    const idImageOld = publicId;
    if (idImageOld) {
      const result = await cloudinary.uploader.destroy(idImageOld);
      console.log(result);
      return result;
    }
  } catch (error) {
    return error;
  }
};
const uploadImageProfile = async (req: Request, res: Response) => {
  try {
    if (req.User.imageId) {
      deleteImages(req.User.imageId);
    }

    const form = formidable({ multiples: false });

    form.parse(req, (error, field, files) => {
      cloudinary.uploader.upload(
        files.file[0].filepath,
        {
          public_id: generateUIID(),
          transformation: [
            {
              width: 400,
              height: 400,
              crop: "fill",
            },
          ],
        },
        async function (error, result) {
          if (error) {
            const e = new Error("Hubo un error al subir la imagen");
            return res.status(500).json({ error: e.message });
          }
          if (result) {
            req.User.image = result.secure_url;
            req.User.imageId = result.public_id;
            await req.User.save();
            res.status(200).json(req.User);
          }
        },
      );
    });
  } catch (e) {
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const user = await User.findOne({ handle }).select(
      "-password -_v -token -_id",
    );
    if (!user) {
      const error = new Error("No se encontro al usuario");
      return res.status(404).json({ error: error.message });
    }
    return res.json(user);
  } catch (error) {
    const e = new Error("Hubo un error al recuperar el usuario.");
    return res.status(404).json({ error: e.message });
  }
};

const serachByHandle = async (req: Request, res: Response) => {
  try {
    const { handle } = req.body;
    const user = await User.findOne({ handle }).select(
      "-password -token -_v -_id",
    );
    if (user) {
      const error = new Error("El hanlde ya se encuentra en uso");
      return res.status(409).json({ error: error.message });
    }
    return res.send(`${handle} esta disponible, puedes utilizarlo ahora.`);
  } catch {
    const error = new Error("Hubo un problema al realizar la busqueda.");
    return res.status(500).json({ error: error.message });
  }
};

export {
  createAccount,
  login,
  getUser,
  activateAccount,
  updateProfile,
  uploadImageProfile,
  getUserProfile,
  serachByHandle,
};
