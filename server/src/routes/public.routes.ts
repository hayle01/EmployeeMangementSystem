import { Router } from "express";
import { getPublicEmployee } from "../controllers/public.controller";

const router = Router();

router.get("/employee/:publicIdOrSlug", getPublicEmployee);

export default router;