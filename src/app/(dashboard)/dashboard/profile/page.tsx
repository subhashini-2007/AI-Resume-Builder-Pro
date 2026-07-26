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
import { Award, Mail, ShieldCheck, MapPin } from "lucide-react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    setUser(authService.getCachedUser());
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        description="Manage your professional metadata and account credentials."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Card */}
        <Card className="glassmorphism flex flex-col justify-between md:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {user?.name || "Professional User"}
            </h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
              <Award className="h-3 w-3" />
              Pro Member
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/20 pt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/dashboard/settings")}
            >
              Edit Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Details Card */}
        <Card className="glassmorphism md:col-span-2">
          <CardHeader>
            <CardTitle>Professional Account Metadata</CardTitle>
            <CardDescription>Metrics linked to your active resume profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>Primary Email</span>
              </span>
              <span className="font-semibold text-foreground">{user?.email || ""}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location</span>
              </span>
              <span className="font-semibold text-foreground">San Francisco, CA</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Account Status</span>
              </span>
              <span className="font-semibold text-emerald-500">Verified & Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
