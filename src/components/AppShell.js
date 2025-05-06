'use client';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  useEffect(() => {
    // Always refresh user info from backend
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.email) {
          Cookies.set("admin_name", data.name, { expires: 7 });
          Cookies.set("admin_email", data.email, { expires: 7 });
          Cookies.set("admin_role", data.role, { expires: 7 });
        }
      });
  }, []);

  if (isLogin) return children;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 