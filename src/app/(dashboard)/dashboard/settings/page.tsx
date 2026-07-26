"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, User, Shield } from "lucide-react";
import { authService } from "@/services/auth";

export default function SettingsPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const user = authService.getCachedUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    } else {
      setName("User");
      setEmail("user@example.com");
    }

    // Load persisted settings from database
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.theme) setTheme(data.data.theme);
          if (data.data.emailNotifications !== undefined) {
            setEmailNotifications(data.data.emailNotifications);
          }
        }
      })
      .catch((err) => console.error("Failed to load settings", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, emailNotifications }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your profile information, password keys, and workspace preferences."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <form onSubmit={handleSave}>
          <Card className="glassmorphism">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">Account Information</CardTitle>
              </div>
              <CardDescription>Update your personal details and contact address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  disabled
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground opacity-70 transition-colors focus:outline-none"
                  value={name}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  disabled
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground opacity-70 transition-colors focus:outline-none"
                  value={email}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Workspace Theme
                </label>
                <select
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Preference</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="h-4 w-4 rounded border-border bg-background/50 text-primary focus:ring-primary"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <label
                  htmlFor="emailNotifications"
                  className="cursor-pointer text-xs font-semibold text-muted-foreground"
                >
                  Receive email notifications for ATS scans & exports
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border/20 pt-4">
              <span className="h-4 text-xs font-medium text-emerald-500">
                {saved && "Changes saved successfully!"}
              </span>
              <Button type="submit" className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="glassmorphism">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-base text-foreground">Security & Privacy</CardTitle>
            </div>
            <CardDescription>
              Update passwords and configure two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
