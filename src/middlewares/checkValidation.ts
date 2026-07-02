import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";


const checkValidation = [
  body("handle").notEmpty().withMessage("El handle es obligatorio"),
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  // Puedes agregar más validaciones aquí
];

const loginValidation = [
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];


const updateProfileValidation = [
  body("handle").notEmpty().withMessage("El hanlde no puede estar vacio.")
]




const handleErrors = (req: Request, res: Response, next: NextFunction) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


export { checkValidation, loginValidation,updateProfileValidation, handleErrors};
