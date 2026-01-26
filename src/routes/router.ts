import { Router } from "express";
import { body } from "express-validator";
import {
  createAccount,
  login,
  getUser,
  activateAccount,
  updateProfile,
} from "../handlers";
import { ExpressValidator } from "express-validator";
import {
  checkValidation,
  loginValidation,
  handleErrors,
  updateProfileValidation,
} from "../middlewares/checkValidation";
import { authenticate } from "../middlewares/authValidations";
const router = Router();

/* Public routes */
router.post("/auth/register", checkValidation, handleErrors, createAccount);
router.post("/auth/login", loginValidation, handleErrors, login);
router.get("/auth/account-activate/:token", activateAccount);

/* Private routes */
router
  .route("/user")
  .get(authenticate, getUser)
  .patch(updateProfileValidation, handleErrors, authenticate, updateProfile);
router.get("/user", authenticate, getUser);

export default router;
