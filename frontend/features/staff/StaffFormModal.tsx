import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../components/common/Toast';
import { User } from '../../types';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null; // If provided, we are in Edit mode
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const initialData = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'cashier',
    phone: '',
    address: '',
    employee_id: '',
    password: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialData);

  // Sync form data when user prop changes (for editing)
  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'cashier',
        phone: '', // Phone not in User type yet
        address: '', // Address not in User type yet
        employee_id: '', // Employee ID not in User type yet
        password: '', // Don't populate password for editing
        is_active: user.is_active
      });
    } else {
      setFormData(initialData);
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = { ...formData };

      // Don't send empty password for updates
      if (user?.id && !submitData.password) {
        delete submitData.password;
      }

      // Don't send empty employee_id since it's optional
      if (!submitData.employee_id.trim()) {
        delete submitData.employee_id;
      }

      if (user?.id) {
        await apiClient.put(`/users/users/${user.id}/`, submitData);
        addToast('Staff member updated successfully!', 'success');
      } else {
        await apiClient.post('/users/users/', submitData);
        addToast('Staff member added successfully!', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast(error.message || 'Failed to save staff member', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {user ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. john_doe"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
            />

            <Input
              label="First Name"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              placeholder="e.g. John"
            />
            <Input
              label="Last Name"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              placeholder="e.g. Doe"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="cashier">Cashier</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <Input
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="e.g. EMP001"
            />

            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
            />

            {!user?.id && (
              <Input
                label="Password"
                name="password"
                type="password"
                required={!user?.id}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Enter full address"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-6">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Staff Member</span>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button leftIcon={<Save size={18} />} isLoading={loading} onClick={(e: any) => handleSubmit(e)}>
            {user ? 'Update Staff Member' : 'Add Staff Member'}
          </Button>
        </div>
      </div>
    </div>
  );
};
