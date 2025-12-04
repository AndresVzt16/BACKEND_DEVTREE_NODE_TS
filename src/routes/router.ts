import { Router } from "express";
import { createAccount } from "../handlers";
const router = Router();

router.post('/auth/register', createAccount);

export default router;