import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useEmployee, useRenewEmployee } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const renewSchema = z
  .object({
    titleEn: z.string().min(1, "English title is required").max(100),
    titleLocal: z.string().min(1, "Local title is required").max(100),
    department: z.string().min(1, "Department is required").max(100),
    mobile: z.string().min(1, "Mobile is required").max(20),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /\S+@\S+\.\S+/.test(value), {
        message: "Valid email is required",
      }),
    nationalId: z.string().min(1, "National ID is required").max(50),
    address: z.string().min(1, "Address is required").max(500),
    district: z.string().min(1, "District is required").max(100),
    issueDate: z.string().min(1, "Issue date is required"),
    expireDate: z.string().min(1, "Expire date is required"),
  })
  .refine(
    (data) => new Date(data.expireDate).getTime() >= new Date(data.issueDate).getTime(),
    {
      path: ["expireDate"],
      message: "Expire date must be on or after issue date",
    },
  );

type RenewFormValues = z.infer<typeof renewSchema>;
type RenewFormErrors = Partial<Record<keyof RenewFormValues, string>>;

const defaultValues: RenewFormValues = {
  titleEn: "",
  titleLocal: "",
  department: "",
  mobile: "",
  email: "",
  nationalId: "",
  address: "",
  district: "",
  issueDate: "",
  expireDate: "",
};

export default function EmployeeRenew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useEmployee(id);
  const renewEmployee = useRenewEmployee();

  const [draftValues, setDraftValues] = useState<RenewFormValues | null>(null);
  const [errors, setErrors] = useState<RenewFormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const employeeValues: RenewFormValues | null = employee
    ? {
        titleEn: employee.titleEn,
        titleLocal: employee.titleLocal,
        department: employee.department,
        mobile: employee.mobile,
        email: employee.email ?? "",
        nationalId: employee.nationalId,
        address: employee.address,
        district: employee.district,
        issueDate: new Date().toISOString().slice(0, 10),
        expireDate: employee.expireDate.slice(0, 10),
      }
    : null;

  const values = draftValues ?? employeeValues ?? defaultValues;
  const currentImagePreview = imagePreview ?? employee?.profileImageUrl ?? null;

  const setFieldValue = <K extends keyof RenewFormValues>(
    field: K,
    value: RenewFormValues[K],
  ) => {
    setDraftValues((prev) => ({
      ...(prev ?? values),
      [field]: value,
    }));

    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = (): boolean => {
    const result = renewSchema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: RenewFormErrors = {};

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in nextErrors)) {
        nextErrors[field as keyof RenewFormValues] = issue.message;
      }
    });

    setErrors(nextErrors);
    toast.error("Please fix the form errors");
    return false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm() || !id) return;

    try {
      await renewEmployee.mutateAsync({
        id,
        ...values,
        profileImage: imageFile,
      });

      toast.success("Employee ID renewed successfully");
      navigate(`/dashboard/employees/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to renew employee";
      toast.error(message);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Loading...</div>;
  }

  if (!employee) {
    return <div className="py-10 text-center text-muted-foreground">Employee not found</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employee
        </Button>
        <h2 className="text-2xl font-bold">Renew Employee</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoField label={labels.employee.employeeNumber} value={employee.empNo} />
          <InfoField label={labels.employee.fullName} value={employee.name} />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Renewal Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted">
                {currentImagePreview ? (
                  <img
                    src={currentImagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              <div>
                <label htmlFor="renew-image-upload" className="cursor-pointer">
                  <div className="flex h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Select File
                  </div>
                </label>
                <input
                  id="renew-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Max 2MB. JPG, PNG supported.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={labels.employee.titleEnglish}
                value={values.titleEn}
                onChange={(value) => setFieldValue("titleEn", value)}
                error={errors.titleEn}
              />
              <Field
                label={labels.employee.titleLocal}
                value={values.titleLocal}
                onChange={(value) => setFieldValue("titleLocal", value)}
                error={errors.titleLocal}
              />
              <Field
                label={labels.employee.department}
                value={values.department}
                onChange={(value) => setFieldValue("department", value)}
                error={errors.department}
              />
              <Field
                label={labels.employee.mobile}
                value={values.mobile}
                onChange={(value) => setFieldValue("mobile", value)}
                error={errors.mobile}
              />
              <Field
                label={labels.employee.email}
                value={values.email}
                onChange={(value) => setFieldValue("email", value)}
                error={errors.email}
              />
              <Field
                label={labels.employee.nationalId}
                value={values.nationalId}
                onChange={(value) => setFieldValue("nationalId", value)}
                error={errors.nationalId}
              />
              <Field
                label={labels.employee.address}
                value={values.address}
                onChange={(value) => setFieldValue("address", value)}
                error={errors.address}
              />
              <Field
                label={labels.employee.district}
                value={values.district}
                onChange={(value) => setFieldValue("district", value)}
                error={errors.district}
              />
              <Field
                label={labels.employee.issueDate}
                type="date"
                value={values.issueDate}
                onChange={(value) => setFieldValue("issueDate", value)}
                error={errors.issueDate}
              />
              <Field
                label={labels.employee.expiryDate}
                type="date"
                value={values.expireDate}
                onChange={(value) => setFieldValue("expireDate", value)}
                error={errors.expireDate}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Renew will create a dedicated renewal history record.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 cursor-pointer"
              onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
            >
              {labels.common.cancel}
            </Button>
            <Button
              type="submit"
              className="h-11 cursor-pointer"
              disabled={renewEmployee.isPending}
            >
              {renewEmployee.isPending ? "Renewing..." : "Renew"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-11 ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}