'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Topbar() {
	const [userName, setUserName] = useState('');
	const router = useRouter();

	useEffect(() => {
		const updateName = () => setUserName(Cookies.get('admin_name') || 'Admin');
		updateName();
		const interval = setInterval(updateName, 1000);
		return () => clearInterval(interval);
	}, []);

	const handleLogout = () => {
		Cookies.remove('admin_token');
		Cookies.remove('admin_name');
		Cookies.remove('admin_role');
		Cookies.remove('admin_email');
		router.push('/login');
	};

	return (
		<header className="topbar flex justify-end items-center px-6">
			<span className="mr-4 text-gray-700 font-medium">{userName}</span>
			<button
				onClick={handleLogout}
				className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded cursor-pointer"
				style={{ color: '#ef4444' }}
			>
				<FaSignOutAlt /> Logout
			</button>
		</header>
	);
}