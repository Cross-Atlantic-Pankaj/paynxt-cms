'use client';

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import Cookies from "js-cookie";

// === Context for sharing navbar data across all pages ===
const NavbarContext = createContext();
export const useNavbar = () => useContext(NavbarContext);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  const [navbarPages, setNavbarPages] = useState([]);
  const [loadingNavbar, setLoadingNavbar] = useState(true);

  // === Fetch logged-in admin info ===
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.email) {
          Cookies.set("admin_name", data.name, { expires: 7 });
          Cookies.set("admin_email", data.email, { expires: 7 });
          Cookies.set("admin_role", data.role, { expires: 7 });
        }
      });
  }, []);

  // === Fetch navbar pages globally (runs once on app load) ===
  useEffect(() => {
    const fetchNavbarPages = async () => {
      try {
        const res = await fetch("/api/navbar");
        const data = await res.json();
        if (data.success) {
          const pages = [];
          data.data.forEach((section) => {
            section.links.forEach((link) => {
              pages.push({
                title: link.title,
                url: link.url,
                section: section.section,
              });
            });
          });
          setNavbarPages(pages);
        }
      } catch (err) {
        console.error("Error fetching navbar pages:", err);
      } finally {
        setLoadingNavbar(false);
      }
    };

    fetchNavbarPages();
  }, []);

  // === If login page, don’t wrap with sidebar/topbar ===
  if (isLogin) return children;

  return (
    <NavbarContext.Provider value={{ navbarPages, loadingNavbar }}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </NavbarContext.Provider>
  );
}
