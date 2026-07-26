import { UserSession } from "@/types";

const COOKIE_NAME = "session_token";

export const authService = {
  // Check if session token exists (client-side helper)
  isAuthenticated(): boolean {
    return authService.getCachedUser() !== null;
  },

  // Retrieve user details from localStorage cache
  getCachedUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("auth_user");
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  },

  // Perform real login
  async login(
    email: string,
    passwordString: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordString }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return { success: false, error: `Server returned HTTP ${res.status}. Please try again.` };
      }
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Invalid email or password." };
      }
      localStorage.setItem("auth_user", JSON.stringify(data.data));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "A network error occurred. Please try again.";
      return { success: false, error: msg };
    }
  },

  // Perform real registration
  async register(
    name: string,
    email: string,
    passwordString: string,
    confirmPasswordString: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: passwordString,
          confirmPassword: confirmPasswordString,
        }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return { success: false, error: `Server returned HTTP ${res.status}. Please try again.` };
      }
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Registration failed." };
      }
      localStorage.setItem("auth_user", JSON.stringify(data.data));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "A network error occurred. Please try again.";
      return { success: false, error: msg };
    }
  },

  // Clear cookie and mock session
  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      window.location.href = "/";
    }
  },
};
