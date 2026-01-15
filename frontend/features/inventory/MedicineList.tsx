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
import { Plus, Search, Filter, MoreHorizontal, AlertCircle, Edit2, Trash2, Eye, ShoppingCart } from 'lucide-react';
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
      fetchMedicines(currentPage, searchQuery);
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
    fetchMedicines(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchMedicines = async (page: number, search: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get<PaginatedResponse<Medicine>>('/medicines/medicines/', {
        page: page.toString(),
        search: search
      });
      
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
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by name or generic..." 
              icon={<Search size={18} />} 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>Filter</Button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Name / Generic</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Manufacturer</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Profit %</th>
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
        onSuccess={() => fetchMedicines(currentPage, searchQuery)}
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
    </div>
  );
};
