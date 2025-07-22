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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, Clock, XCircle, Pencil, Trash2, ShieldCheck, UserCheck,
} from "lucide-react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";

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
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users
    .filter((u) =>
      (u.email?.toLowerCase().includes(search.toLowerCase()) ||
       u.full_name?.toLowerCase().includes(search.toLowerCase()))
    )
    .filter((u) => cleanStatus(u.status) === tab);

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

  const renderUser = (user: UserProfile) => (
    <div key={user.id} className="border rounded p-4 flex justify-between items-center">
      <div>
        <div className="font-medium">{user.full_name || user.email}</div>
        <div className="text-sm text-muted-foreground">Status: {user.status}</div>
        <div className="text-sm text-muted-foreground">Role: {user.role}</div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={selectedIds.has(user.id)} onCheckedChange={() => toggleSelect(user.id)} />
        {cleanStatus(user.status) === "pending" && (
          <Button size="icon" onClick={() => handleBulk({ status: "active" })}>
            <UserCheck className="w-4 h-4" />
          </Button>
        )}
        <Button size="icon" variant="outline" onClick={() => handleBulk({ role: "System Administrator" })}>
          <ShieldCheck className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setEditingUser(user)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="destructive" onClick={() => setDeletingUser(user)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
        <CardContent>
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>User Management</span>
            <Badge>{users.length} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulk({ status: "active" })}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulk({ role: "System Administrator" })}>Make Admin</Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
              </div>
            </div>

            <TabsContent value="active" className="space-y-2">
              {filtered.map(renderUser)}
            </TabsContent>
            <TabsContent value="pending" className="space-y-2">
              {filtered.map(renderUser)}
            </TabsContent>
            <TabsContent value="inactive" className="space-y-2">
              {filtered.map(renderUser)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => fetchUsers()}
        />
      )}
      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={() => fetchUsers()}
        />
      )}
    </>
  );
};

export default UserManagement;
