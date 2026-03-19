import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  getEmployee,
  getEmployeeHistory,
  updateEmployee,
  renewEmployee,
  deleteEmployee,
} from "../controllers/employees.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  employeeSchema,
  renewEmployeeSchema,
} from "../validators/employee.validators";

const router = Router();

router.use(authenticate);

router.get("/", listEmployees);
router.post("/", upload.single("profileImage"), validate(employeeSchema), createEmployee);
router.get("/:id", getEmployee);
router.get("/:id/history", getEmployeeHistory);
router.patch("/:id/renew", upload.single("profileImage"), validate(renewEmployeeSchema), renewEmployee);
router.put("/:id", upload.single("profileImage"), validate(employeeSchema), updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;