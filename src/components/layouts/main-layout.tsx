import * as React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Dynamic Sticky Header */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1">{children}</main>

      {/* Footer Area */}
      <Footer />
    </div>
  );
}
