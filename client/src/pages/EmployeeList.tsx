import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteEmployee, useEmployees, type Employee } from "@/hooks/useEmployees";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ViewMode = "table" | "card";
type StatusFilter = "Active" | "Expired" | "";

export default function EmployeeList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [view, setView] = useState<ViewMode>("table");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: employees = [], isLoading } = useEmployees({
    search,
    department,
    district,
    status,
  });

  const deleteEmployee = useDeleteEmployee();

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.department))).sort();
  }, [employees]);

  const districts = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.district))).sort();
  }, [employees]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteEmployee.mutateAsync(deleteId);
      toast.success("Employee deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete employee";
      toast.error(message);
    }

    setDeleteId(null);
  };

  const resetFilters = () => {
    setSearch("");
    setDepartment("");
    setDistrict("");
    setStatus("");
  };

  const isActive = (employee: Employee) => new Date(employee.expireDate) >= new Date();

  const departmentLabel = department || "All Departments";
  const districtLabel = district || "All Districts";
  const statusLabel = status || "All Statuses";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage employee records and ID cards
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard/employees/new")}
          className="h-11 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 pl-9"
          />
        </div>

        <FilterDropdown
          label={departmentLabel}
          items={departments}
          onSelect={(value) => setDepartment(value)}
          onClear={() => setDepartment("")}
        />

        <FilterDropdown
          label={districtLabel}
          items={districts}
          onSelect={(value) => setDistrict(value)}
          onClear={() => setDistrict("")}
        />

        <FilterDropdown
          label={statusLabel}
          items={["Active", "Expired"]}
          onSelect={(value) => setStatus(value as StatusFilter)}
          onClear={() => setStatus("")}
          widthClassName="w-[150px]"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={resetFilters}
          className="h-11 w-11 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{employees.length} employee(s) found</p>

        <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
          <TabsList>
            <TabsTrigger value="table" className="cursor-pointer">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="card" className="cursor-pointer">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : view === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Emp No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        name={employee.name}
                        imageUrl={employee.profileImageUrl}
                        size="sm"
                      />
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs">{employee.empNo}</TableCell>
                  <TableCell className="text-xs">{employee.titleEn}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.expireDate).toLocaleDateString()}</TableCell>

                  <TableCell>
                    <Badge
                      variant={isActive(employee) ? "default" : "destructive"}
                      className={isActive(employee) ? "bg-green-600 hover:bg-success/90" : ""}
                    >
                      {isActive(employee) ? "Active" : "Expired"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => navigate(`/dashboard/employees/${employee.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => setDeleteId(employee.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar
                      name={employee.name}
                      imageUrl={employee.profileImageUrl}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.empNo}</p>
                    </div>
                  </div>

                  <Badge
                    variant={isActive(employee) ? "default" : "destructive"}
                    className={isActive(employee) ? "bg-green-600 " : ""}
                  >
                    {isActive(employee) ? labels.common.active : labels.common.expired}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <p>{employee.titleEn}</p>
                  <p>{employee.department}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 flex-1 cursor-pointer"
                    onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 flex-1 cursor-pointer"
                    onClick={() => navigate(`/dashboard/employees/${employee.id}/edit`)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 cursor-pointer"
                    onClick={() => setDeleteId(employee.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  items: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
  widthClassName?: string;
}

function FilterDropdown({
  label,
  items,
  onSelect,
  onClear,
  widthClassName = "w-[180px]",
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger >
        <Button
          variant="outline"
          className={`h-11 cursor-pointer justify-between ${widthClassName}`}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={widthClassName}>
        <DropdownMenuItem className="cursor-pointer" onClick={onClear}>
          All
        </DropdownMenuItem>
        {items.map((item) => (
          <DropdownMenuItem
            key={item}
            className="cursor-pointer"
            onClick={() => onSelect(item)}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface EmployeeAvatarProps {
  name: string;
  imageUrl: string | null;
  size: "sm" | "md";
}

function EmployeeAvatar({ name, imageUrl, size }: EmployeeAvatarProps) {
  const sizeClassName = size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const textClassName = size === "sm" ? "text-xs" : "text-lg";

  if (imageUrl) {
    return (
      <div className={`overflow-hidden rounded-full bg-muted ${sizeClassName}`}>
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${sizeClassName} ${textClassName}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}