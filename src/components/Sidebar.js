'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaUsers, FaChevronDown, FaChevronUp, FaUserShield, FaGlobe, FaBox, FaBoxOpen, FaUserAstronaut, FaUserCheck, FaVoicemail, FaFacebookMessenger, FaUpload } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userSectionOpen, setUserSectionOpen] = useState(false);
  const [webPageSectionOpen, setWebPageSectionOpen] = useState(false);
  const [productSectionOpen, setProductSectionOpen] = useState(false);
  const pathname = usePathname();

  const userRole = Cookies.get('admin_role');

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="logo flex items-center gap-2 relative">
        <div className="bg-gray-200 rounded-full px-2 py-0 mb-2 mt-2">
          <span className="text-2xl text-gray-700 font-bold">A</span>
        </div>
        {!collapsed && (
          <span>
            Admin<span className="font-light">Paynxt</span>
          </span>
        )}
        <button
          className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 border border-gray-200 z-20 hover:bg-gray-100 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <FaBars size={22} className="text-gray-700" />
        </button>
      </div>

      <nav className="nav-section mt-8">
        {/* Users Section - visible to superadmin and editor */}
        {userRole === 'superadmin' && (
          <>
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
                <Link href="/admin/orders" className={`nav-link ${pathname === '/admin/orders' ? 'active' : ''}`}>
                  <FaUserCheck />
                  <span>Orders</span>
                </Link>
                <Link href="/EmailTemplateManager" className={`nav-link ${pathname === '/EmailTemplateManager' ? 'active' : ''}`}>
                  <FaFacebookMessenger />
                  <span>Email Template Manager</span>
                </Link>
                <Link href="/admin/navbar" className={`nav-link ${pathname === '/admin/navbar' ? 'active' : ''}`}>
                  <FaUserShield />
                  <span>Navbar</span>
                </Link>
                <Link href="/access-reports" className={`nav-link ${pathname === '/access-reports' ? 'active' : ''}`}>
                  <FaUserShield />
                  <span>Access Reports</span>
                </Link>
                <Link href="/admin/report-upload" className={`nav-link ${pathname === '/admin/report-upload' ? 'active' : ''}`}>
                  <FaUpload />
                  <span>Upload Reports</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Web Page Section - visible only to superadmin */}
        {(userRole === 'superadmin' || userRole === 'editor') && (
          <>
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
                  <FaGlobe /> <span>Home Page</span>
                </Link>
                <Link href="/Product-page" className={`nav-link ${pathname === '/Product-page' ? 'active' : ''}`}>
                  <FaGlobe /> <span>Product Page</span>
                </Link>
                <div className="submenu ml-4">
                  <Link href="/Product-page#banner" className="nav-link"><FaBox /> <span>Banner</span></Link>
                  <Link href="/Product-page#slider" className="nav-link"><FaBox /> <span>Slider</span></Link>
                  <Link href="/Product-page#key-stats" className="nav-link"><FaBox /> <span>Key Stats</span></Link>
                  <Link href="/Product-page#section-three" className="nav-link"><FaBox /> <span>Section Three</span></Link>
                  <Link href="/Product-page#why-paynxt" className="nav-link"><FaBox /> <span>Why PayNXT360</span></Link>
                  <Link href="/Product-page#sector-dynamics" className="nav-link"><FaBox /> <span>Sector Dynamics</span></Link>
                </div>
                <Link href="/blog-page" className={`nav-link ${pathname === '/blog-page' ? 'active' : ''}`}>
                  <FaGlobe /> <span>Blog Page</span>
                </Link>
                <Link href="/reports" className={`nav-link ${pathname === '/reports' ? 'active' : ''}`}>
                  <FaGlobe /> <span>Report Store</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Blogger-only access to Blog Page */}
        {userRole === 'blogger' && (
          <Link href="/blog-page" className={`nav-link ${pathname === '/blog-page' ? 'active' : ''}`}>
            <FaGlobe /> <span>Blog Page</span>
          </Link>
        )}

        {/* Product Categories Section - visible only to superadmin */}
        {(userRole === 'superadmin' || userRole === 'editor') && (
          <>
            <div
              className={`nav-link cursor-pointer ${productSectionOpen ? 'active' : ''}`}
              onClick={() => setProductSectionOpen((open) => !open)}
            >
              <FaBox />
              {!collapsed && <span>Categories</span>}
              {!collapsed && (productSectionOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />)}
            </div>
            {productSectionOpen && !collapsed && (
              <div className="submenu">
                <Link href="/product-category" className={`nav-link ${pathname === '/product-category' ? 'active' : ''}`}>
                  <FaBox />
                  <span>Product Category</span>
                </Link>
                <Link href="/product-subcategory" className={`nav-link ${pathname === '/product-subcategory' ? 'active' : ''}`}>
                  <FaBoxOpen />
                  <span>Product Subcategory</span>
                </Link>
                <Link href="/product-topic" className={`nav-link ${pathname === '/product-topic' ? 'active' : ''}`}>
                  <FaBox />
                  <span>Product Topic</span>
                </Link>
                <Link href="/product-subtopic" className={`nav-link ${pathname === '/product-subtopic' ? 'active' : ''}`}>
                  <FaBoxOpen />
                  <span>Product Subtopic</span>
                </Link>
                <Link href="/repformat" className={`nav-link ${pathname === '/repformat' ? 'active' : ''}`}>
                  <FaBox />
                  <span>Report Country</span>
                </Link>
                <Link href="/repregion" className={`nav-link ${pathname === '/repregion' ? 'active' : ''}`}>
                  <FaBoxOpen />
                  <span>Product Region</span>
                </Link>
                <Link href="/reptype" className={`nav-link ${pathname === '/reptype' ? 'active' : ''}`}>
                  <FaBox />
                  <span>Report Type</span>
                </Link>
              </div>
            )}
          </>
        )}

      </nav>
    </aside>
  );
}