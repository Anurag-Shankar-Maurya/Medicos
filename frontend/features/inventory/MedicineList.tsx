import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { Medicine, PaginatedResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { useCart } from '../../app/CartContext';
import { Plus, Search, Filter, MoreHorizontal, AlertCircle, Edit2, Trash2, Eye, ShoppingCart, ChevronDown, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AddMedicineModal } from './AddMedicineModal';
import { MedicineDetailModal } from './MedicineDetailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const MedicineList = () => {
  const { addToCart } = useCart();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Selection States
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Sorting and Filtering States
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    medicine_type: '',
    manufacturer: '',
    stock_status: '',
    requires_prescription: '',
    schedule_h: '',
    schedule_x: '',
    is_active: ''
  });

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
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenDetail = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const handleOpenDelete = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDeleteOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (!selectedMedicine) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/medicines/medicines/${selectedMedicine.id}/`);
      addToast('Medicine deleted successfully', 'success');
      setIsDeleteOpen(false);
      fetchMedicines(currentPage, searchQuery, sortBy, filters);
    } catch (error: any) {
      addToast(error.message || 'Failed to delete medicine', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Get URL Params
  const pageParam = searchParams.get('page');
  const currentPage = pageParam && !isNaN(parseInt(pageParam)) ? Math.max(1, parseInt(pageParam)) : 1;
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchMedicines(currentPage, searchQuery, sortBy, filters);
  }, [currentPage, searchQuery, sortBy, filters]);

  const fetchMedicines = async (page: number, search: string, ordering?: string, filterParams?: any) => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        search: search
      };

      if (ordering) {
        params.ordering = ordering;
      }

      // Add filter parameters
      if (filterParams) {
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key]) {
            params[key] = filterParams[key];
          }
        });
      }

      const res = await apiClient.get<PaginatedResponse<Medicine>>('/medicines/medicines/', params);

      if (res && res.results) {
        setMedicines(res.results);
        setTotalCount(res.count);
      } else {
        // Handle unexpected non-paginated response if necessary
        const results = Array.isArray(res) ? res : [];
        setMedicines(results);
        setTotalCount(results.length);
      }
    } catch (error: any) {
      console.error("Fetch medicines error:", error);
      addToast(error.message || 'Failed to fetch inventory', 'error');
      setMedicines([]);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage medicines, stock levels, and pricing.</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus size={18} />}>Add Medicine</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Sorting and Filtering Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or generic..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors appearance-none pr-8"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="generic_name">Generic Name (A-Z)</option>
                  <option value="-generic_name">Generic Name (Z-A)</option>
                  <option value="medicine_type">Type (A-Z)</option>
                  <option value="-medicine_type">Type (Z-A)</option>
                  <option value="manufacturer">Manufacturer (A-Z)</option>
                  <option value="-manufacturer">Manufacturer (Z-A)</option>
                  <option value="quantity_in_stock">Stock (Low-High)</option>
                  <option value="-quantity_in_stock">Stock (High-Low)</option>
                  <option value="selling_price">Price (Low-High)</option>
                  <option value="-selling_price">Price (High-Low)</option>
                  <option value="calculated_profit_margin">Profit % (Low-High)</option>
                  <option value="-calculated_profit_margin">Profit % (High-Low)</option>
                  <option value="created_at">Date Added (Old-New)</option>
                  <option value="-created_at">Date Added (New-Old)</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
              <Button
                variant="outline"
                leftIcon={<Filter size={18} />}
                onClick={() => setIsFilterModalOpen(true)}
              >
                Filter
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(f => f) && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => value && (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                >
                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setFilters({
                  medicine_type: '',
                  manufacturer: '',
                  stock_status: '',
                  requires_prescription: '',
                  schedule_h: '',
                  schedule_x: '',
                  is_active: ''
                })}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'name' ? '-name' : 'name')}
                >
                  <div className="flex items-center gap-1">
                    Name / Generic
                    {sortBy === 'name' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-name' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'medicine_type' ? '-medicine_type' : 'medicine_type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortBy === 'medicine_type' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-medicine_type' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'manufacturer' ? '-manufacturer' : 'manufacturer')}
                >
                  <div className="flex items-center gap-1">
                    Manufacturer
                    {sortBy === 'manufacturer' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-manufacturer' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'quantity_in_stock' ? '-quantity_in_stock' : 'quantity_in_stock')}
                >
                  <div className="flex items-center gap-1">
                    Stock
                    {sortBy === 'quantity_in_stock' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-quantity_in_stock' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'selling_price' ? '-selling_price' : 'selling_price')}
                >
                  <div className="flex items-center gap-1">
                    Price
                    {sortBy === 'selling_price' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-selling_price' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === 'calculated_profit_margin' ? '-calculated_profit_margin' : 'calculated_profit_margin')}
                >
                  <div className="flex items-center gap-1">
                    Profit %
                    {sortBy === 'calculated_profit_margin' && <ChevronDown size={14} className="rotate-0" />}
                    {sortBy === '-calculated_profit_margin' && <ChevronDown size={14} className="rotate-180" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Quick Add</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                 <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-slate-500">
                        <Spinner className="mx-auto mb-2" />
                        <span>Loading inventory...</span>
                    </td>
                 </tr>
              ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8">
                       <EmptyState
                          title="No medicines found"
                          description={searchQuery ? `No results found for "${searchQuery}"` : "Get started by adding your first medicine to the inventory."}
                          actionLabel={searchQuery ? "Clear Search" : "Add Medicine"}
                          onAction={searchQuery ? () => setSearchParams({page: '1', search: ''}) : undefined}
                       />
                    </td>
                  </tr>
              ) : medicines.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.generic_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.strength} • {item.pack_size}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                      {item.medicine_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {item.manufacturer}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`font-medium ${item.needs_reorder ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {item.quantity_in_stock}
                      </span>
                      {item.needs_reorder && (
                         <span title="Low Stock">
                            <AlertCircle size={14} className="ml-2 text-red-500" />
                         </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Loc: {item.rack_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-white font-medium">${item.selling_price}</div>
                    <div className="text-xs text-slate-500 line-through">${item.mrp}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${item.profit_margin > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.profit_margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.quantity_in_stock <= 0}
                      className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Billing Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === item.id ? null : item.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div className="py-1" role="menu">
                            <button
                              onClick={() => handleOpenDetail(item)}
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              role="menuitem"
                            >
                              <Eye size={16} className="mr-3 text-slate-400" /> View Details
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              role="menuitem"
                            >
                              <Edit2 size={16} className="mr-3 text-slate-400" /> Edit Medicine
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item)}
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

      <AddMedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchMedicines(currentPage, searchQuery, sortBy, filters)}
        medicine={selectedMedicine}
      />

      <MedicineDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        medicine={selectedMedicine}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Medicine"
        message={`Are you sure you want to delete ${selectedMedicine?.name}? This action cannot be undone.`}
      />

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Medicines</h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Medicine Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Medicine Type
                </label>
                <select
                  value={filters.medicine_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, medicine_type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="ointment">Ointment</option>
                  <option value="drops">Drops</option>
                  <option value="powder">Powder</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Manufacturer Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Manufacturer
                </label>
                <Input
                  placeholder="Enter manufacturer name..."
                  value={filters.manufacturer}
                  onChange={(e) => setFilters(prev => ({ ...prev, manufacturer: e.target.value }))}
                />
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stock Status
                </label>
                <select
                  value={filters.stock_status}
                  onChange={(e) => setFilters(prev => ({ ...prev, stock_status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Stock Levels</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="overstock">Overstock</option>
                  <option value="normal">Normal Stock</option>
                </select>
              </div>

              {/* Prescription Required Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prescription Required
                </label>
                <select
                  value={filters.requires_prescription}
                  onChange={(e) => setFilters(prev => ({ ...prev, requires_prescription: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Medicines</option>
                  <option value="true">Prescription Required</option>
                  <option value="false">No Prescription Required</option>
                </select>
              </div>

              {/* Schedule H Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Schedule H
                </label>
                <select
                  value={filters.schedule_h}
                  onChange={(e) => setFilters(prev => ({ ...prev, schedule_h: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Medicines</option>
                  <option value="true">Schedule H Drugs</option>
                  <option value="false">Non-Schedule H Drugs</option>
                </select>
              </div>

              {/* Schedule X Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Schedule X
                </label>
                <select
                  value={filters.schedule_x}
                  onChange={(e) => setFilters(prev => ({ ...prev, schedule_x: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Medicines</option>
                  <option value="true">Schedule X Drugs</option>
                  <option value="false">Non-Schedule X Drugs</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Medicines</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    medicine_type: '',
                    manufacturer: '',
                    stock_status: '',
                    requires_prescription: '',
                    schedule_h: '',
                    schedule_x: '',
                    is_active: ''
                  });
                }}
              >
                Clear All
              </Button>
              <Button onClick={() => setIsFilterModalOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
