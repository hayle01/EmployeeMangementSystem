import { IUserDocument } from "../models/User";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUserDocument;
    validatedData?: unknown;
  }
}

export {};