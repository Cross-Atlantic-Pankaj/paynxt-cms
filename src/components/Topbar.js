'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Topbar() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Assume user name is stored in a cookie called 'admin_name' after login
    const name = Cookies.get('admin_name') || 'Admin';
    setUserName(name);
  }, []);

  const handleLogout = () => {
    Cookies.remove('admin_token');
    Cookies.remove('admin_name');
    router.push('/login');
  };

  return (
    <header className="topbar flex justify-end items-center px-6">
      <span className="mr-4 text-gray-700 font-medium">{userName}</span>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded"
      >
        <FaSignOutAlt /> Logout
      </button>
    </header>
  );
} 