'use client';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
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