import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppRequest } from "../types/request";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: AppRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
