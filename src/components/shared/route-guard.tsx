"use client";

import * as React from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  return <>{children}</>;
}
