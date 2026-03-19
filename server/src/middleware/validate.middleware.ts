import { Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppRequest } from "../types/request";

export const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: AppRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log("zod errors:", result.error.errors);

      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        errors,
      });
    }

    req.validatedData = result.data;
    next();
  };