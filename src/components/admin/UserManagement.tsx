import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, Clock, XCircle, Pencil, Trash2,
  ShieldCheck, UserCheck, FileDown, History,
} from "lucide-react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import * as XLSX from "xlsx";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
  email_verified: boolean;
}

const cleanStatus = (status: string | null) => (status || "").trim().toLowerCase();

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState("active");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users
    .filter((u) => cleanStatus(u.status) === tab)
    .filter((u) => {
      const match = u.email?.toLowerCase().includes(search.toLowerCase()) ||
                    u.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return match && matchRole;
    });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSelect = (id: string) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  const clearSelected = () => setSelectedIds(new Set());

  const handleBulk = async (updates: Partial<UserProfile>) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .in("id", ids);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Updated", description: "Users updated." });
      fetchUsers();
      clearSelected();
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .in("id", ids);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Users deleted." });
      fetchUsers();
      clearSelected();
    }
  };

  const exportToExcel = () => {
    const rows = filtered.map((u) => ({
      ID: u.id,
      Email: u.email,
      Name: u.full_name,
      Role: u.role,
      Status: u.status,
      Created: u.created_at,
      LastLogin: u.last_sign_in_at,
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Users");
    XLSX.writeFile(book, "users.xlsx");
  };

  const renderUser = (user: UserProfile) => (
    <div key={user.id} className="border rounded p-4 flex justify-between items-center">
      <div>
        <div className="font-medium">{user.full_name || user.email}</div>
        <div className="text-sm text-muted-foreground">Status: {user.status}</div>
        <div className="text-sm text-muted-foreground">Role: {user.role}</div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedIds.has(user.id)}
          onCheckedChange={() => toggleSelect(user.id)}
        />
        <Button size="icon" variant="ghost" onClick={() => toast({ title: "Login history coming soon." })}>
          <History className="w-4 h-4" />
        </Button>
        {cleanStatus(user.status) === "pending" && (
          <Button size="icon" onClick={() => handleBulk({ status: "active" })}>
            <UserCheck className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleBulk({ role: "System Administrator" })}
        >
          <ShieldCheck className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setEditingUser(user)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => setDeletingUser(user)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>User Management</span>
            <div className="flex items-center gap-2">
              <Badge>{users.length} users</Badge>
              <Button size="sm" onClick={exportToExcel}>
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="System Administrator">System Administrator</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 mt-4">
              <TabsTrigger value="active">
                Active{" "}
                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-white">
                  {users.filter((u) => cleanStatus(u.status) === "active").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending{" "}
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-white">
                  {users.filter((u) => cleanStatus(u.status) === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive{" "}
                <Badge className="ml-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white">
                  {users.filter((u) => cleanStatus(u.status) === "inactive").length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulk({ status: "active" })}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulk({ role: "System Administrator" })}>Make Admin</Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
              </div>
            </div>

            <TabsContent value="active" className="space-y-2">{paginated.map(renderUser)}</TabsContent>
            <TabsContent value="pending" className="space-y-2">{paginated.map(renderUser)}</TabsContent>
            <TabsContent value="inactive" className="space-y-2">{paginated.map(renderUser)}</TabsContent>

            <div className="flex justify-center gap-2 mt-4">
              <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} size="sm">Prev</Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} size="sm">Next</Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={fetchUsers}
        />
      )}
      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={fetchUsers}
        />
      )}
    </>
  );
};

export default UserManagement;
