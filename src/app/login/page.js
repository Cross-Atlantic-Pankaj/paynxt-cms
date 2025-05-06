'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaSignInAlt, FaUser } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessForm, setAccessForm] = useState({ name: '', email: '', password: '' });
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/AdminLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        toast.error(data.error || 'Login failed');
        return;
      }
      Cookies.set('admin_token', data.token, { expires: 7 });
      toast.success('Login successful!');
      setTimeout(() => { router.push('/'); }, 1200);
    } catch {
      setError('Something went wrong.');
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    setAccessError('');
    if (!accessForm.name.trim() || !accessForm.email.trim() || !accessForm.password.trim()) {
      setAccessError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }
    setAccessLoading(true);
    try {
      const response = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setAccessError(data.error || 'Request failed');
        toast.error(data.error || 'Request failed');
        return;
      }
      toast.success(data.message || 'Access request submitted!');
      setShowAccessModal(false);
      setAccessForm({ name: '', email: '', password: '' });
    } catch {
      setAccessError('Something went wrong.');
      toast.error('Something went wrong.');
    } finally {
      setAccessLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eceff1]">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="bg-white rounded shadow-md w-full max-w-md">
        <div className="flex flex-col items-center pt-8">
          <div className="bg-gray-200 rounded-full p-4 mb-2">
            <span className="text-3xl text-gray-700 font-bold">A</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800">
            <span className="font-bold">Admin</span><span className="font-light">Paynxt</span>
          </h1>
        </div>
        <div className="px-8 pt-6 pb-8">
          <h2 className="text-center text-lg mb-4 text-gray-700">Sign in to start your session</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                autoComplete="username"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="mb-4 relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              <FaSignInAlt />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => setShowAccessModal(true)}
            >
              Request for Access
            </button>
          </div>
        </div>
      </div>
      {/* Modal for Request Access */}
      {showAccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#eceff1] bg-opacity-95 z-50">
          <div className="bg-white rounded shadow-md w-full max-w-md p-8 relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowAccessModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-4">
              <div className="bg-gray-200 rounded-full p-2 mb-2">
                <span className="text-3xl text-gray-700 font-bold">A</span>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
            <span className="font-bold">Admin</span><span className="font-light">Paynxt</span>
          </h1>
            </div>
            <form onSubmit={handleAccessSubmit}>
              <div className="mb-4 relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={accessForm.name}
                  onChange={e => setAccessForm({ ...accessForm, name: e.target.value })}
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="mb-4 relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={accessForm.email}
                  onChange={e => setAccessForm({ ...accessForm, email: e.target.value })}
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="mb-4 relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={accessForm.password}
                  onChange={e => setAccessForm({ ...accessForm, password: e.target.value })}
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {accessError && (
                <div className="text-red-500 text-sm text-center mb-4">{accessError}</div>
              )}
              <button
                type="submit"
                disabled={accessLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
              >
                {accessLoading ? 'Requesting...' : 'Request Access'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 