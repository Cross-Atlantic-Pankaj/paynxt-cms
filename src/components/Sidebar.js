'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaUsers, FaChevronDown, FaChevronUp, FaUserShield, FaGlobe } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userSectionOpen, setUserSectionOpen] = useState(false);
  const [webPageSectionOpen, setWebPageSectionOpen] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}> 
      <div className="logo flex items-center gap-2 relative">
      <div className="bg-gray-200 rounded-full px-2 py-0 mb-2 mt-2">
            <span className="text-2xl text-gray-700 font-bold">A</span>
          </div>
        {!collapsed && <span>Admin<span className="font-light">Paynxt</span></span>}
        <button
          className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 border border-gray-200 z-20 hover:bg-gray-100 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <FaBars size={22} className="text-gray-700" />
        </button>
      </div>
      <nav className="nav-section mt-8">
        <div
          className={`nav-link cursor-pointer ${userSectionOpen ? 'active' : ''}`}
          onClick={() => setUserSectionOpen((open) => !open)}
        >
          <FaUsers />
          {!collapsed && <span>Users Section</span>}
          {!collapsed && (userSectionOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />)}
        </div>
        {userSectionOpen && !collapsed && (
          <div className="submenu">
            <Link href="/web-users" className={`nav-link ${pathname === '/web-users' ? 'active' : ''}`}>
              <FaUsers />
              <span>Web Users</span>
            </Link>
            <Link href="/admin-panel-users" className={`nav-link ${pathname === '/admin-panel-users' ? 'active' : ''}`}>
              <FaUserShield />
              <span>Admin Panel Users</span>
            </Link>
          </div>
        )}
        <div
          className={`nav-link cursor-pointer ${webPageSectionOpen ? 'active' : ''}`}
          onClick={() => setWebPageSectionOpen((open) => !open)}
        >
          <FaGlobe />
          {!collapsed && <span>Web Page</span>}
          {!collapsed && (webPageSectionOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />)}
        </div>
        {webPageSectionOpen && !collapsed && (
          <div className="submenu">
            <Link href="/home-page" className={`nav-link ${pathname === '/home-page' ? 'active' : ''}`}>
              <FaGlobe />
              <span>Home Page</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
} 