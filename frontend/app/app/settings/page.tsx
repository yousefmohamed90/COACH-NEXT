"use client"

import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Monitor, User } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" />Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
              <p className="font-medium mt-1">{user?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="font-medium mt-1">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Role</p>
              <Badge variant="outline" className="mt-1 capitalize">{user?.role ?? "—"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Member since</p>
              <p className="font-medium mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5" />Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 p-3 border transition-colors ${theme === "light" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 p-3 border transition-colors ${theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-xs">Dark</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
