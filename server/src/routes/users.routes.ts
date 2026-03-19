import { Router } from "express";
import { listUsers, createUser, deleteUser } from "../controllers/users.controller";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/", listUsers);
router.post("/", validate(createUserSchema), createUser);
router.delete("/:id", deleteUser);

export default router;