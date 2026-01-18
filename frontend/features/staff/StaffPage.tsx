import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { User, PaginatedResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { StaffFormModal } from './StaffFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const StaffPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Selection States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const [totalCount, setTotalCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/users/users/${selectedUser.id}/`);
      addToast('Staff member deleted successfully', 'success');
      setIsDeleteOpen(false);
      fetchUsers(currentPage, searchQuery);
    } catch (error: any) {
      addToast(error.message || 'Failed to delete staff member', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const updatedUser = { ...user, is_active: !user.is_active };
      await apiClient.patch(`/users/users/${user.id}/`, { is_active: !user.is_active });
      addToast(`Staff member ${!user.is_active ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers(currentPage, searchQuery);
    } catch (error: any) {
      addToast(error.message || 'Failed to update staff status', 'error');
    }
  };

  // Get URL Params
  const pageParam = searchParams.get('page');
  const currentPage = pageParam && !isNaN(parseInt(pageParam)) ? Math.max(1, parseInt(pageParam)) : 1;
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchUsers = async (page: number, search: string) => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        search: search
      };

      const res = await apiClient.get<PaginatedResponse<User>>('/users/users/', params);

      if (res && res.results) {
        setUsers(res.results);
        setTotalCount(res.count);
      } else {
        const results = Array.isArray(res) ? res : [];
        setUsers(results);
        setTotalCount(results.length);
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      addToast(error.message || 'Failed to fetch staff members', 'error');
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams({ page: '1', search: value });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), search: searchQuery });
  };

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage staff members, roles, and permissions.</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus size={18} />}>Add Staff Member</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Search Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or employee ID..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                        <Spinner className="mx-auto mb-2" />
                        <span>Loading staff members...</span>
                    </td>
                 </tr>
              ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                       <EmptyState
                          title="No staff members found"
                          description={searchQuery ? `No results found for "${searchQuery}"` : "Get started by adding your first staff member."}
                          actionLabel={searchQuery ? "Clear Search" : "Add Staff Member"}
                          onAction={searchQuery ? () => setSearchParams({page: '1', search: ''}) : undefined}
                       />
                    </td>
                  </tr>
              ) : users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-slate-500">@{user.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="text-sm">{user.email}</div>
                    {/* Phone would be added here if available in User type */}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {/* Employee ID would be added here if available in User type */}
                    <span className="text-xs text-slate-400">N/A</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === user.id ? null : user.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div className="py-1" role="menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(user);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              role="menuitem"
                            >
                              <Edit2 size={16} className="mr-3 text-slate-400" /> Edit Staff
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUserStatus(user);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                                user.is_active ? 'text-red-600' : 'text-green-600'
                              }`}
                              role="menuitem"
                            >
                              {user.is_active ? (
                                <>
                                  <UserX size={16} className="mr-3" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={16} className="mr-3" /> Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDelete(user);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              role="menuitem"
                            >
                              <Trash2 size={16} className="mr-3" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchUsers(currentPage, searchQuery)}
        user={selectedUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedUser?.first_name} ${selectedUser?.last_name}? This action cannot be undone.`}
      />
    </div>
  );
};
