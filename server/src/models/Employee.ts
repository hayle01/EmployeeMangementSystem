import mongoose, { Document, Schema } from "mongoose";

export type EmployeeHistoryActionType = "update" | "renew";

export interface IEmployeeHistoryItem {
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email?: string | null;
  nationalId: string;
  address: string;
  district: string;
  issueDate: Date;
  expireDate: Date;
  profileImageUrl?: string | null;
  qrImageUrl?: string | null;
  publicSlug: string;
  actionType: EmployeeHistoryActionType;
  statusAtThatTime: "Active" | "Expired";
  recordedAt: Date;
}

export interface IEmployee {
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email?: string | null;
  nationalId: string;
  address: string;
  district: string;
  issueDate: Date;
  expireDate: Date;
  profileImageUrl?: string | null;
  profileImagePublicId?: string | null;
  qrImageUrl?: string | null;
  qrImagePublicId?: string | null;
  publicSlug: string;
  history: IEmployeeHistoryItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmployeeDocument extends IEmployee, Document {
  status: "Active" | "Expired";
}

const employeeHistorySchema = new Schema<IEmployeeHistoryItem>(
  {
    empNo: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    titleEn: { type: String, required: true, trim: true },
    titleLocal: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    nationalId: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expireDate: { type: Date, required: true },
    profileImageUrl: { type: String, default: null },
    qrImageUrl: { type: String, default: null },
    publicSlug: { type: String, required: true },
    actionType: {
      type: String,
      enum: ["update", "renew"],
      required: true,
      default: "update",
    },
    statusAtThatTime: {
      type: String,
      enum: ["Active", "Expired"],
      required: true,
    },
    recordedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const employeeSchema = new Schema<IEmployeeDocument>(
  {
    empNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      required: true,
      trim: true,
    },
    titleLocal: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
    qrImageUrl: {
      type: String,
      default: null,
    },
    qrImagePublicId: {
      type: String,
      default: null,
    },
    publicSlug: {
      type: String,
      unique: true,
      required: true,
    },
    history: {
      type: [employeeHistorySchema],
      default: [],
    },
  },
  { timestamps: true },
);

employeeSchema.virtual("status").get(function (this: IEmployeeDocument) {
  return new Date() <= new Date(this.expireDate) ? "Active" : "Expired";
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

export const Employee = mongoose.model<IEmployeeDocument>(
  "Employee",
  employeeSchema,
);