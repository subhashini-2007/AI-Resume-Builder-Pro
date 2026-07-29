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
import { Save, User, Shield, Settings, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/toast";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

export default function SettingsPage() {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success) {
          setName(json.data.name || "");
          setEmail(json.data.email || "");
          if (json.data.settings) {
            setTheme(json.data.settings.theme || "system");
            setEmailNotifications(json.data.settings.emailNotifications ?? true);
          }
        }
      } catch (err) {
        console.error("Failed to load user settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Save profile details
      const profileRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const profileJson = await profileRes.json();

      if (!profileJson.success) {
        throw new Error(profileJson.error || "Profile update failed");
      }

      // 2. Save settings preferences
      const settingsRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, emailNotifications }),
      });
      const settingsJson = await settingsRes.json();

      if (!settingsJson.success) {
        throw new Error(settingsJson.error || "Settings update failed");
      }

      // 3. Update localStorage cache
      const cached = authService.getCachedUser();
      if (cached) {
        cached.name = name;
        cached.email = email;
        localStorage.setItem("auth_user", JSON.stringify(cached));
      }

      toast({
        title: "Settings Saved",
        description: "Your account details and preferences have been successfully updated.",
        variant: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings. Please try again.";
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Settings"
          description="Configure your profile information, security, and workspace preferences."
        />
        <div className="flex min-h-[300px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your profile information, security, and workspace preferences."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Account Details Card */}
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
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="glassmorphism">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Settings className="h-5 w-5" />
                <CardTitle className="text-base text-foreground">Workspace Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize your workspace theme and notification parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Theme Mode</label>
                <select
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                  disabled={isSaving}
                >
                  <option value="system">System Preference</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/30 p-4">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email Notifications
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Receive weekly newsletter and ATS audit summaries.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end border-t border-border/20 pt-4">
              <Button type="submit" className="flex items-center gap-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Security Card – Change Password */}
        <Card className="glassmorphism">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-base text-foreground">Security &amp; Privacy</CardTitle>
            </div>
            <CardDescription>
              Update your password below. After a successful change you will be signed out and
              redirected to the login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
