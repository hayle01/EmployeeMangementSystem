import { Request } from "express";
import { IUserDocument } from "../models/User";

export interface AppRequest extends Request {
  user?: IUserDocument;
  validatedData?: unknown;
}