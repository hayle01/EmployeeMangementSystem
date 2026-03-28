import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Loader2,
  Pencil,
  QrCode,
  RefreshCcw,
  User as UserIcon,
} from "lucide-react";
import { useEmployee } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useEmployee(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Employee not found
      </div>
    );
  }

  const isActive = employee.status === "Active";
  const history = employee.history ?? [];

  const handleDownloadQr = async () => {
    if (!employee.qrImageUrl) return;

    try {
      const response = await fetch(employee.qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${employee.empNo}-qr-code.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      const anchor = document.createElement("a");
      anchor.href = employee.qrImageUrl;
      anchor.download = `${employee.empNo}-qr-code.png`;
      anchor.click();
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/employees")}
          className="h-10 cursor-pointer px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {labels.employee.backToList}
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/employees/${employee.id}/renew`)}
            className="h-10 cursor-pointer px-4"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Renew
          </Button>

          <Button
            onClick={() => navigate(`/dashboard/employees/${employee.id}/edit`)}
            className="h-10 cursor-pointer px-4"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {labels.common.edit}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                {employee.profileImageUrl ? (
                  <img
                    src={employee.profileImageUrl}
                    alt={employee.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-14 w-14 text-primary" />
                )}
              </div>

              <h3 className="text-center text-xl font-bold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.titleEn}</p>

              <Badge
                variant={isActive ? "default" : "destructive"}
                className={`mt-2 ${
                  isActive
                    ? "bg-green-400 hover:bg-green-500"
                    : "bg-red-400 hover:bg-red-500"
                }`}
              >
                {isActive ? labels.common.active : labels.common.expired}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4" />
                {labels.employee.digitalVerification}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center">
              {employee.qrImageUrl ? (
                <>
                  <img
                    src={employee.qrImageUrl}
                    alt="QR Code"
                    className="h-40 w-40 rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    className="mt-3 h-11 w-full cursor-pointer"
                    onClick={handleDownloadQr}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Package
                  </Button>
                </>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  QR code not yet generated
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {labels.employee.employmentInformation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label={labels.employee.employeeNumber} value={employee.empNo} />
                <InfoField label={labels.employee.fullName} value={employee.name} />
                <InfoField label={labels.employee.titleEnglish} value={employee.titleEn} />
                <InfoField label={labels.employee.titleLocal} value={employee.titleLocal} />
                <InfoField label={labels.employee.department} value={employee.department} />
                <InfoField
                  label="Xaalad / Status / الحالة"
                  value={isActive ? labels.common.active : labels.common.expired}
                />
                <InfoField label={labels.employee.nationalId} value={employee.nationalId} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {labels.employee.contactLocation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label={labels.employee.mobile} value={employee.mobile} />
                <InfoField label={labels.employee.email} value={employee.email ?? "-"} />
                <InfoField label={labels.employee.district} value={employee.district} />
                <InfoField label={labels.employee.address} value={employee.address} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.employee.idValidity}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField
                  label={labels.employee.issueDate}
                  value={new Date(employee.issueDate).toLocaleDateString()}
                />
                <InfoField
                  label={labels.employee.expiryDate}
                  value={new Date(employee.expireDate).toLocaleDateString()}
                />
              </div>

              {!isActive ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This employee&apos;s ID has expired. Please renew the ID card to maintain
                    compliance.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Taariikh Hore / Employee History / السجل السابق
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No previous history found.
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={`${item.recordedAt}-${index}`} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          {item.actionType ? (
                            <p className="text-xs text-muted-foreground capitalize">
                              Action: {item.actionType}
                            </p>
                          ) : null}
                        </div>

                        <Badge variant="outline">
                          {new Date(item.recordedAt).toLocaleDateString()}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoField label={labels.employee.employeeNumber} value={item.empNo} />
                        <InfoField label={labels.employee.titleEnglish} value={item.titleEn} />
                        <InfoField label={labels.employee.titleLocal} value={item.titleLocal} />
                        <InfoField label={labels.employee.department} value={item.department} />
                        <InfoField label={labels.employee.mobile} value={item.mobile} />
                        <InfoField label={labels.employee.email} value={item.email ?? "-"} />
                        <InfoField label={labels.employee.nationalId} value={item.nationalId} />
                        <InfoField label={labels.employee.address} value={item.address} />
                        <InfoField label={labels.employee.district} value={item.district} />
                        <InfoField
                          label={labels.employee.issueDate}
                          value={new Date(item.issueDate).toLocaleDateString()}
                        />
                        <InfoField
                          label={labels.employee.expiryDate}
                          value={new Date(item.expireDate).toLocaleDateString()}
                        />
                        <InfoField
                          label="Xaaladdii Hore / Previous Status / الحالة السابقة"
                          value={item.statusAtThatTime}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value && value.trim() ? value : "-"}</p>
    </div>
  );
}