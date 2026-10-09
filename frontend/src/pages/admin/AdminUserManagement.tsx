import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Trash2, Mail } from 'lucide-react';
import { adminApi } from '../../api/client';
import { User } from '../../types';
import { AdminHeader } from '../../components/common/AdminHeader';
import { SEO } from '../../components/common/SEO';
import { useToast } from '../../context/ToastContext';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { success, error } = useToast();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers({ search: search || undefined });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleToggleStatus = async (id: string, currentStatus: boolean, userEmail: string) => {
    try {
      await adminApi.toggleUserStatus(id);
      success(`User ${userEmail} ${currentStatus ? 'deactivated' : 'activated'}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userEmail}"?`)) return;
    try {
      await adminApi.deleteUser(id);
      success(`User ${userEmail} permanently deleted.`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEO title="User Management" description="Manage platform user accounts, roles, and status." />
      <AdminHeader />

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Activity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading user directory...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{u.name}</p>
                          <span className="text-[10px] text-slate-500">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Member</span>
                      )}
                    </td>
                    <td className="p-4 text-[11px] text-slate-400">
                      {u._count?.watchHistory ?? 0} views • {u._count?.reviews ?? 0} reviews
                    </td>
                    <td className="p-4">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400">
                          <Ban className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive !== false, u.email)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive !== false
                              ? 'text-amber-400 hover:bg-amber-950/30'
                              : 'text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                          title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
