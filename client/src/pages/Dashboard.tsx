import { format, parseISO, startOfMonth } from "date-fns";
import {
  Users,
  QrCode,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useEmployees } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface GrowthPoint {
  month: string;
  total: number;
  added: number;
}

interface DepartmentPoint {
  name: string;
  value: number;
}

interface StatusPoint {
  status: "Active" | "Expired";
  count: number;
  fill: string;
}

export default function Dashboard() {
  const { data: employees = [] } = useEmployees();

  const totalEmployees = employees.length;
  const activeCount = employees.filter(
    (employee) => new Date(employee.expireDate) >= new Date(),
  ).length;
  const expiredCount = employees.filter(
    (employee) => new Date(employee.expireDate) < new Date(),
  ).length;
  const withQr = employees.filter((employee) => Boolean(employee.qrImageUrl)).length;
  const qrCoverage = totalEmployees > 0 ? Math.round((withQr / totalEmployees) * 100) : 0;
  const recentEmployees = employees.slice(0, 5);

  const stats = [
    {
      title: labels.dashboard.totalEmployees,
      value: totalEmployees,
      subtitle: "Registered staff members",
      icon: Users,
      iconClassName: "text-primary",
      iconBgClassName: "bg-primary/10",
      valueClassName: "text-foreground",
    },
    {
      title: labels.dashboard.activeQrIds,
      value: withQr,
      subtitle: `${qrCoverage}% QR coverage`,
      icon: QrCode,
      iconClassName: "text-emerald-600",
      iconBgClassName: "bg-emerald-500/10",
      valueClassName: "text-emerald-700 dark:text-emerald-400",
    },
    {
      title: labels.dashboard.pendingRenewals,
      value: expiredCount,
      subtitle: "Need immediate renewal",
      icon: AlertTriangle,
      iconClassName: "text-red-600",
      iconBgClassName: "bg-red-500/10",
      valueClassName: "text-red-700 dark:text-red-400",
    },
    {
      title: labels.dashboard.activeStatus,
      value: activeCount,
      subtitle: "Currently valid IDs",
      icon: ShieldCheck,
      iconClassName: "text-green-600",
      iconBgClassName: "bg-green-500/10",
      valueClassName: "text-green-700 dark:text-green-400",
    },
  ];

  const monthMap = new Map<string, number>();
  employees.forEach((employee) => {
    const month = format(startOfMonth(parseISO(employee.createdAt)), "yyyy-MM");
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  });

  const sortedMonths = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  const growthData = sortedMonths.reduce<GrowthPoint[]>((accumulator, [month, count]) => {
    const previousTotal =
      accumulator.length > 0 ? accumulator[accumulator.length - 1].total : 0;

    accumulator.push({
      month: format(parseISO(`${month}-01`), "MMM yyyy"),
      total: previousTotal + count,
      added: count,
    });

    return accumulator;
  }, []);

  const departmentMap = new Map<string, number>();
  employees.forEach((employee) => {
    departmentMap.set(
      employee.department,
      (departmentMap.get(employee.department) || 0) + 1,
    );
  });

  const departmentData: DepartmentPoint[] = [...departmentMap.entries()]
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const statusData: StatusPoint[] = [
    { status: "Active", count: activeCount, fill: "#16a34a" },
    { status: "Expired", count: expiredCount, fill: "#dc2626" },
  ];

  const growthConfig: ChartConfig = {
    total: {
      label: "Total Employees",
      color: "var(--color-primary)",
    },
    added: {
      label: "Added",
      color: "var(--color-chart-2)",
    },
  };

  const departmentPalette = [
    "#2563eb",
    "#7c3aed",
    "#0891b2",
    "#ea580c",
    "#16a34a",
    "#db2777",
    "#ca8a04",
    "#4f46e5",
    "#0f766e",
    "#9333ea",
  ];

  const departmentConfig: ChartConfig = departmentData.reduce<ChartConfig>(
    (accumulator, item, index) => {
      accumulator[item.name] = {
        label: item.name,
        color: departmentPalette[index % departmentPalette.length],
      };

      return accumulator;
    },
    {},
  );

  const statusConfig: ChartConfig = {
    Active: {
      label: "Active",
      color: "#16a34a",
    },
    Expired: {
      label: "Expired",
      color: "#dc2626",
    },
  };

  const topDepartments = departmentData.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6  ">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {labels.dashboard.overview}
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor employee growth, status distribution, QR readiness, and renewals.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            <span>{totalEmployees} employees in the system</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border  ">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.valueClassName}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBgClassName}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconClassName}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">
              {labels.dashboard.employeeGrowthTrend}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cumulative employee onboarding by month.
            </p>
          </CardHeader>
          <CardContent>
            {growthData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No data yet
              </p>
            ) : (
              <ChartContainer config={growthConfig} className="h-[320px] w-full">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="employeeGrowthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    fill="url(#employeeGrowthFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">
              {labels.dashboard.departmentBreakdown}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Department share across the organization.
            </p>
          </CardHeader>
          <CardContent>
            {departmentData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No data yet
              </p>
            ) : (
              <div className="space-y-5">
                <ChartContainer config={departmentConfig} className="h-[260px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                      stroke="var(--color-background)"
                      strokeWidth={2}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={departmentPalette[index % departmentPalette.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="space-y-3">
                  {topDepartments.map((department, index) => (
                    <div
                      key={department.name}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              departmentPalette[index % departmentPalette.length],
                          }}
                        />
                        <span className="text-sm font-medium">{department.name}</span>
                      </div>
                      <Badge variant="secondary">{department.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-7">
        <Card className="xl:col-span-3">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Active vs Expired</CardTitle>
            <p className="text-sm text-muted-foreground">
              Green means valid IDs. Red means expired IDs.
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="h-[300px] w-full">
              <BarChart data={statusData} barCategoryGap={32}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">
              {labels.dashboard.latestOnboarding}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most recently added employee records.
            </p>
          </CardHeader>
          <CardContent>
            {recentEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employees yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEmployees.map((employee) => {
                  const isActive = new Date(employee.expireDate) >= new Date();

                  return (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.empNo} · {employee.department}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.titleEn}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={isActive ? "default" : "destructive"}
                        className={
                          isActive
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }
                      >
                        {isActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}