"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, CheckCircle, XCircle, Clock } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

function statusIcon(status: string | null) {
  switch (status) {
    case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "trial": return <Clock className="h-4 w-4 text-yellow-500" />;
    case "expired":
    case "canceled": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch (err) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(u => u.id !== id));
      toast({ title: "User deleted", description: `${name} has been removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const updateSubscription = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to update subscription");
      setUsers(users.map(u => u.id === id ? { ...u, subscriptionStatus: status } : u));
      toast({ title: "Updated", description: `Subscription set to "${status}".` });
    } catch {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">User and subscription management</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-wider font-medium text-muted-foreground">
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Subscription</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Created</th>
                    <th className="text-right p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        {user.role === "admin" ? (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Shield className="h-3.5 w-3.5" /> Admin
                          </span>
                        ) : (
                          <span className="capitalize">{user.role}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {statusIcon(user.subscriptionStatus)}
                          <select
                            value={user.subscriptionStatus ?? ""}
                            onChange={(e) => updateSubscription(user.id, e.target.value)}
                            className="bg-transparent border border-border rounded px-2 py-1 text-xs"
                          >
                            <option value="trial">Trial</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteUser(user.id, user.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
