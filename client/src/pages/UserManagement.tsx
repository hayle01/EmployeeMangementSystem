import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useUsers";
import type { UserRole } from "@/types/user";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function UserManagement() {
  const { user } = useAuth();

  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("staff");

  const handleCreateUser = async () => {
    if (!username || !password) return;

    try {
      await createUser.mutateAsync({ username, password, role });
      toast.success("User created successfully");
      setCreateOpen(false);
      setUsername("");
      setPassword("");
      setRole("staff");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success("User deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage system administrators and access control
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">System Users</CardTitle>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger>
              <Button size="sm" className="h-11 cursor-pointer">
                <Plus className="mr-1 h-6 w-6" />
                {labels.users.createUser}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{labels.users.createUser}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter a username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{labels.users.role}</Label>
                  <Select value={role}  onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full cursor-pointer h-11" onClick={handleCreateUser} disabled={createUser.isPending}>
                  {createUser.isPending ? "Creating..." : labels.users.createUser}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((item) => {
                  const isSelf = user?.id === item.id;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {item.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{item.username}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={item.role === "admin" ? "default" : "secondary"}>
                          {item.role === "admin" ? "Admin" : "Staff"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSelf || deleteUser.isPending}
                          onClick={() => handleDeleteUser(item.id)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}