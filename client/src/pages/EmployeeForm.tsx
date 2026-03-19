import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateEmployee, useEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const employeeSchema = z.object({
  empNo: z.string().min(1, "Employee number is required").max(50),
  name: z.string().min(1, "Name is required").max(100),
  titleEn: z.string().min(1, "English title is required").max(100),
  titleLocal: z.string().min(1, "Local title is required").max(100),
  department: z.string().min(1, "Department is required").max(100),
  mobile: z.string().min(1, "Mobile is required").max(20),
  email: z.string().email("Valid email is required"),
  nationalId: z.string().min(1, "National ID is required").max(50),
  address: z.string().min(1, "Address is required").max(500),
  district: z.string().min(1, "District is required").max(100),
  issueDate: z.string().min(1, "Issue date is required"),
  expireDate: z.string().min(1, "Expire date is required"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;
type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;

const defaultValues: EmployeeFormValues = {
  empNo: "",
  name: "",
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

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: employee, isLoading } = useEmployee(id);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const [draftValues, setDraftValues] = useState<EmployeeFormValues | null>(null);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const employeeValues: EmployeeFormValues | null = employee
    ? {
        empNo: employee.empNo,
        name: employee.name,
        titleEn: employee.titleEn,
        titleLocal: employee.titleLocal,
        department: employee.department,
        mobile: employee.mobile,
        email: employee.email,
        nationalId: employee.nationalId,
        address: employee.address,
        district: employee.district,
        issueDate: employee.issueDate.slice(0, 10),
        expireDate: employee.expireDate.slice(0, 10),
      }
    : null;

  const values = draftValues ?? employeeValues ?? defaultValues;
  const currentImagePreview = imagePreview ?? employee?.profileImageUrl ?? null;

  const setFieldValue = <K extends keyof EmployeeFormValues>(
    field: K,
    value: EmployeeFormValues[K],
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
    const result = employeeSchema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: EmployeeFormErrors = {};

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in nextErrors)) {
        nextErrors[field as keyof EmployeeFormValues] = issue.message;
      }
    });

    setErrors(nextErrors);
    toast.error("Please fix the form errors");
    return false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        ...values,
        profileImage: imageFile,
      };

      console.log("Payload: ", payload)
 
      if (isEditing && id) {
        await updateEmployee.mutateAsync({ id, ...payload });
        toast.success("Employee updated successfully");
      } else {
        await createEmployee.mutateAsync(payload);
        toast.success("Employee created successfully");
      }

      navigate("/dashboard/employees");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save employee";
      toast.error(message);
    }
  };

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  if (isEditing && isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => navigate("/dashboard/employees")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {labels.employee.backToList}
        </Button>
        <h2 className="text-2xl font-bold">
          {isEditing ? labels.employee.editEmployee : labels.employee.addEmployee}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{labels.employee.personalInformation}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted">
                {currentImagePreview ? (
                  <img src={currentImagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              <div>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Select File
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-xs text-muted-foreground">Max 2MB. JPG, PNG supported.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={labels.employee.employeeNumber}
                value={values.empNo}
                onChange={(value) => setFieldValue("empNo", value)}
                placeholder="EMP-001"
                error={errors.empNo}
              />
              <Field
                label={labels.employee.fullName}
                value={values.name}
                onChange={(value) => setFieldValue("name", value)}
                placeholder="John Doe"
                error={errors.name}
              />
              <Field
                label={labels.employee.titleEnglish}
                value={values.titleEn}
                onChange={(value) => setFieldValue("titleEn", value)}
                placeholder="General Director"
                error={errors.titleEn}
              />
              <Field
                label={labels.employee.titleLocal}
                value={values.titleLocal}
                onChange={(value) => setFieldValue("titleLocal", value)}
                placeholder="Agaasimaha Guud"
                error={errors.titleLocal}
              />
              <Field
                label={labels.employee.department}
                value={values.department}
                onChange={(value) => setFieldValue("department", value)}
                placeholder="Administration"
                error={errors.department}
              />
              <Field
                label={labels.employee.mobile}
                value={values.mobile}
                onChange={(value) => setFieldValue("mobile", value)}
                placeholder="+252..."
                error={errors.mobile}
              />
              <Field
                label={labels.employee.email}
                value={values.email}
                onChange={(value) => setFieldValue("email", value)}
                placeholder="name@company.com"
                error={errors.email}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{labels.employee.contactLocation}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label={labels.employee.address}
              value={values.address}
              onChange={(value) => setFieldValue("address", value)}
              placeholder="123 Main St, City"
              error={errors.address}
            />
              <Field
                label={labels.employee.district}
                value={values.district}
                onChange={(value) => setFieldValue("district", value)}
                placeholder="Banadir"
                error={errors.district}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{labels.employee.identityDocumentation}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
               <Field
                label={labels.employee.nationalId}
                value={values.nationalId}
                onChange={(value) => setFieldValue("nationalId", value)}
                placeholder="ID-123456789"
                error={errors.nationalId}
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
                hint="Status will be computed based on this date"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Fields marked with * are mandatory</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 cursor-pointer"
              onClick={() => navigate("/dashboard/employees")}
            >
              {labels.common.cancel}
            </Button>
            <Button type="submit" className="h-11 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : labels.common.save}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  type?: React.HTMLInputTypeAttribute;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  type = "text",
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-11 mt-2 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}