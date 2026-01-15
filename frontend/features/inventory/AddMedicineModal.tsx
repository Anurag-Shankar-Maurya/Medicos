import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../components/common/Toast';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    medicine_type: 'tablet',
    manufacturer: '',
    strength: '',
    pack_size: '',
    purchase_price: '',
    mrp: '',
    selling_price: '',
    quantity_in_stock: '0',
    reorder_level: '10',
    rack_number: '',
    shelf_number: '',
    requires_prescription: false,
    is_active: true
  });

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
      await apiClient.post('/medicines/medicines/', formData);
      addToast('Medicine added successfully!', 'success');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        generic_name: '',
        medicine_type: 'tablet',
        manufacturer: '',
        strength: '',
        pack_size: '',
        purchase_price: '',
        mrp: '',
        selling_price: '',
        quantity_in_stock: '0',
        reorder_level: '10',
        rack_number: '',
        shelf_number: '',
        requires_prescription: false,
        is_active: true
      });
    } catch (error: any) {
      addToast(error.message || 'Failed to add medicine', 'error');
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Medicine</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Medicine Name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Paracetamol" />
            <Input label="Generic Name" name="generic_name" value={formData.generic_name} onChange={handleChange} placeholder="e.g. Acetaminophen" />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select 
                name="medicine_type" 
                value={formData.medicine_type} 
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="injection">Injection</option>
                <option value="ointment">Ointment</option>
                <option value="drops">Drops</option>
                <option value="cream">Cream</option>
                <option value="gel">Gel</option>
                <option value="powder">Powder</option>
                <option value="inhaler">Inhaler</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="e.g. Pfizer" />
            <Input label="Strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
            <Input label="Pack Size" name="pack_size" value={formData.pack_size} onChange={handleChange} placeholder="e.g. 10 tablets" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Input label="Purchase Price" name="purchase_price" type="number" step="0.01" required value={formData.purchase_price} onChange={handleChange} />
            <Input label="MRP" name="mrp" type="number" step="0.01" required value={formData.mrp} onChange={handleChange} />
            <Input label="Selling Price" name="selling_price" type="number" step="0.01" required value={formData.selling_price} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Input label="Quantity in Stock" name="quantity_in_stock" type="number" required value={formData.quantity_in_stock} onChange={handleChange} />
            <Input label="Reorder Level" name="reorder_level" type="number" required value={formData.reorder_level} onChange={handleChange} />
            <Input label="Rack Number" name="rack_number" value={formData.rack_number} onChange={handleChange} placeholder="e.g. A1" />
            <Input label="Shelf Number" name="shelf_number" value={formData.shelf_number} onChange={handleChange} placeholder="e.g. S2" />
          </div>

          <div className="flex items-center space-x-6 border-t border-slate-100 dark:border-slate-800 pt-6">
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="requires_prescription" checked={formData.requires_prescription} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requires Prescription</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
             </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button leftIcon={<Save size={18} />} isLoading={loading} onClick={(e: any) => handleSubmit(e)}>Save Medicine</Button>
        </div>
      </div>
    </div>
  );
};
