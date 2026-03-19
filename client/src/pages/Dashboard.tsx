import { format, parseISO, startOfMonth } from "date-fns";
import { Users, QrCode, AlertTriangle, Activity } from "lucide-react";
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
  const recentEmployees = employees.slice(0, 5);

  const stats = [
    {
      title: labels.dashboard.totalEmployees,
      value: totalEmployees,
      icon: Users,
      color: "text-primary",
    },
    {
      title: labels.dashboard.activeQrIds,
      value: withQr,
      icon: QrCode,
      color: "text-green-600",
    },
    {
      title: labels.dashboard.pendingRenewals,
      value: expiredCount,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: labels.dashboard.activeStatus,
      value: activeCount,
      icon: Activity,
      color: "text-blue-600",
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

  const departmentData: DepartmentPoint[] = [...departmentMap.entries()].map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const statusData: StatusPoint[] = [
    { status: "Active", count: activeCount },
    { status: "Expired", count: expiredCount },
  ];

  const growthConfig: ChartConfig = {
    total: {
      label: "Total Employees",
      color: "var(--chart-1)",
    },
  };

  const departmentPalette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "oklch(0.72 0.16 145)",
    "oklch(0.78 0.17 85)",
    "oklch(0.66 0.22 25)",
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
    active: {
      label: "Active",
      color: "var(--chart-2)",
    },
    expired: {
      label: "Expired",
      color: "var(--chart-4)",
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {labels.dashboard.employeeGrowthTrend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No data yet
              </p>
            ) : (
              <ChartContainer config={growthConfig} className="h-62.5 w-full">
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    fill="var(--color-total)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {labels.dashboard.departmentBreakdown}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No data yet
              </p>
            ) : (
              <ChartContainer config={departmentConfig} className="h-62.5 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={11}
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
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active vs Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="h-62.5 w-full">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  <Cell fill="var(--chart-2)" />
                  <Cell fill="var(--chart-4)" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {labels.dashboard.latestOnboarding}
            </CardTitle>
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
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.empNo} · {employee.department}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={isActive ? "default" : "destructive"}
                        className={isActive ? "bg-green-500 text-white hover:bg-green-600" : ""}
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