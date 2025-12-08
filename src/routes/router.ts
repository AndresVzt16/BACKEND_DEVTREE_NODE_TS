import { Router } from "express";
import { body } from "express-validator";
import { createAccount, login } from "../handlers";
import { ExpressValidator } from "express-validator";
import {
  checkValidation,
  loginValidation,
  handleErrors,
} from "../middlewares/checkValidation";
const router = Router();

router.post("/auth/register", checkValidation, handleErrors, createAccount);
router.post("/auth/login", loginValidation, handleErrors, login);

export default router;
