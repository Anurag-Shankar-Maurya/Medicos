import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../components/common/Toast';

import { Medicine } from '../../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicine?: Medicine | null; // If provided, we are in Edit mode
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose, onSuccess, medicine }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  
  const initialData = {
    name: '',
    generic_name: '',
    medicine_type: 'tablet',
    manufacturer: '',
    supplier: '',
    composition: '',
    strength: '',
    pack_size: '',
    purchase_price: '',
    mrp: '',
    selling_price: '',
    wholesale_price: '',
    gst_percentage: '12.00',
    hsn_code: '',
    quantity_in_stock: '0',
    reorder_level: '10',
    max_stock_level: '100',
    rack_number: '',
    shelf_number: '',
    requires_prescription: false,
    is_schedule_h: false,
    is_schedule_x: false,
    side_effects: '',
    usage_instructions: '',
    barcode: '',
    sku: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialData);

  // Sync form data when medicine prop changes (for editing)
  React.useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        medicine_type: medicine.medicine_type || 'tablet',
        manufacturer: medicine.manufacturer || '',
        supplier: medicine.supplier_name || '',
        composition: medicine.composition || '',
        strength: medicine.strength || '',
        pack_size: medicine.pack_size || '',
        purchase_price: medicine.purchase_price || '',
        mrp: medicine.mrp || '',
        selling_price: medicine.selling_price || '',
        wholesale_price: medicine.wholesale_price || '',
        gst_percentage: medicine.gst_percentage?.toString() || '12.00',
        hsn_code: medicine.hsn_code || '',
        quantity_in_stock: medicine.quantity_in_stock?.toString() || '0',
        reorder_level: medicine.reorder_level?.toString() || '10',
        max_stock_level: medicine.max_stock_level?.toString() || '100',
        rack_number: medicine.rack_number || '',
        shelf_number: medicine.shelf_number || '',
        requires_prescription: !!medicine.requires_prescription,
        is_schedule_h: !!medicine.is_schedule_h,
        is_schedule_x: !!medicine.is_schedule_x,
        side_effects: medicine.side_effects || '',
        usage_instructions: medicine.usage_instructions || '',
        barcode: medicine.barcode || '',
        sku: medicine.sku || '',
        is_active: !!medicine.is_active
      });
    } else {
      setFormData(initialData);
    }
  }, [medicine, isOpen]);

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
      if (medicine?.id) {
        await apiClient.put(`/medicines/medicines/${medicine.id}/`, formData);
        addToast('Medicine updated successfully!', 'success');
      } else {
        await apiClient.post('/medicines/medicines/', formData);
        addToast('Medicine added successfully!', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast(error.message || 'Failed to save medicine', 'error');
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
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
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
            <Input label="Supplier" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="e.g. ABC Pharmaceuticals" />
            <Input label="Composition" name="composition" value={formData.composition} onChange={handleChange} placeholder="e.g. Active ingredients" />
            <Input label="Strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
            <Input label="Pack Size" name="pack_size" value={formData.pack_size} onChange={handleChange} placeholder="e.g. 10 tablets" />
            <Input label="HSN Code" name="hsn_code" value={formData.hsn_code} onChange={handleChange} placeholder="e.g. 30049099" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Input label="Purchase Price" name="purchase_price" type="number" step="0.01" required value={formData.purchase_price} onChange={handleChange} />
            <Input label="Selling Price" name="selling_price" type="number" step="0.01" required value={formData.selling_price} onChange={handleChange} />
            <Input label="Wholesale Price" name="wholesale_price" type="number" step="0.01" value={formData.wholesale_price} onChange={handleChange} />
            <Input label="MRP" name="mrp" type="number" step="0.01" required value={formData.mrp} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="GST %" name="gst_percentage" type="number" step="0.01" required value={formData.gst_percentage} onChange={handleChange} />
            <Input label="Barcode" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="e.g. 8901234567890" />
            <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g. PARA500TAB" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Input label="Quantity in Stock" name="quantity_in_stock" type="number" required value={formData.quantity_in_stock} onChange={handleChange} />
            <Input label="Reorder Level" name="reorder_level" type="number" required value={formData.reorder_level} onChange={handleChange} />
            <Input label="Max Stock Level" name="max_stock_level" type="number" value={formData.max_stock_level} onChange={handleChange} />
            <Input label="Rack Number" name="rack_number" value={formData.rack_number} onChange={handleChange} placeholder="e.g. A1" />
            <Input label="Shelf Number" name="shelf_number" value={formData.shelf_number} onChange={handleChange} placeholder="e.g. S2" />
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Side Effects</label>
              <textarea
                name="side_effects"
                value={formData.side_effects}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="e.g. Nausea, dizziness, allergic reactions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Usage Instructions</label>
              <textarea
                name="usage_instructions"
                value={formData.usage_instructions}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="e.g. Take one tablet every 6 hours with food"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="requires_prescription" checked={formData.requires_prescription} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requires Prescription</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="is_schedule_h" checked={formData.is_schedule_h} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule H</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="is_schedule_x" checked={formData.is_schedule_x} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule X</span>
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
