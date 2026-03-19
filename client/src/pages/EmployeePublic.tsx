import { useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Calendar,
  CreditCard,
  Loader2,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useEmployeeBySlug } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployeePublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data: employee, isLoading, error } = useEmployeeBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">Employee Not Found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The employee record you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = new Date(employee.expireDate) >= new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-4 py-8">
      <Card className="w-full max-w-lg overflow-hidden">
        <div className="bg-primary px-6 py-6 text-center text-primary-foreground">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">EmployeeConnect</h1>
          <p className="text-xs opacity-80">Verified Employee Profile</p>
        </div>

        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {employee.profileImageUrl ? (
                <img
                  src={employee.profileImageUrl}
                  alt={employee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-10 w-10 text-primary" />
              )}
            </div>

            <h2 className="text-xl font-bold">{employee.name}</h2>
            <p className="text-sm text-muted-foreground">{employee.titleEn}</p>

            <Badge
              variant={isActive ? "default" : "destructive"}
              className={`mt-2 ${isActive ? "bg-green-400 hover:bg-success/90" : ""}`}>
              {isActive ? labels.common.active : labels.common.expired}
            </Badge>
          </div>

          <div className="space-y-3">
            <DetailRow
              icon={Briefcase}
              label={labels.employee.employeeNumber}
              value={employee.empNo}
            />
            <DetailRow
              icon={Briefcase}
              label={labels.employee.titleEnglish}
              value={employee.titleEn}
            />
            <DetailRow
              icon={Briefcase}
              label={labels.employee.titleLocal}
              value={employee.titleLocal}
            />
            <DetailRow
              icon={Briefcase}
              label={labels.employee.department}
              value={employee.department}
            />
            <DetailRow
              icon={CreditCard}
              label={labels.employee.nationalId}
              value={employee.nationalId}
            />
            <DetailRow
              icon={Calendar}
              label={labels.employee.issueDate}
              value={new Date(employee.issueDate).toLocaleDateString()}
            />
            <DetailRow
              icon={Calendar}
              label={labels.employee.expiryDate}
              value={new Date(employee.expireDate).toLocaleDateString()}
            />
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>© 2026 EmployeeConnect. Verified digital employee profile.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
