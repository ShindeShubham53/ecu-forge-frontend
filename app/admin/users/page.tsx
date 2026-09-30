'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types';
import { api } from '../../../services/api';
import { Users, Search, ShieldCheck, UserX, UserCheck, ChevronLeft } from 'lucide-react';

export default function AdminUserManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data.success) setUsersList(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) fetchUsers();
  }, [user, isAdmin, authLoading, router]);

  const toggleStatus = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: res.data.data.status } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg bg-brand-surface text-brand-silver hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-brand-green font-mono text-xs font-bold uppercase">ADMINISTRATION</span>
            <h1 className="text-3xl font-black text-white uppercase font-sans">User Management</h1>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-brand-silver absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-white text-xs font-mono"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/80 bg-brand-dark text-xs font-mono text-brand-silver uppercase">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-brand-surface-light/50 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-xs">
                    {u.full_name?.charAt(0)}
                  </div>
                  {u.full_name}
                </td>
                <td className="p-4 text-brand-silver">{u.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      u.role === 'ADMIN' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-surface text-brand-silver'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-brand-silver">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(u.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      u.status === 'active'
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
