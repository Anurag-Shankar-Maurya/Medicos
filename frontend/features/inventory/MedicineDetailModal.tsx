import React from 'react';
import { X, Package, ShieldCheck, MapPin, DollarSign, Info } from 'lucide-react';
import { Medicine } from '../../types';
import { Button } from '../../components/common/Button';

interface MedicineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

const DetailRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
  <div className="flex items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 mr-4 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
);

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({ isOpen, onClose, medicine }) => {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-primary-600">
          <div className="text-white">
            <h2 className="text-2xl font-bold">{medicine.name}</h2>
            <p className="text-primary-100 text-sm opacity-90">{medicine.generic_name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                 <Info size={16} className="mr-2" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <DetailRow label="Medicine Type" value={medicine.medicine_type} icon={<Package size={18} />} />
                 <DetailRow label="Manufacturer" value={medicine.manufacturer} icon={<ShieldCheck size={18} />} />
                 <DetailRow label="Strength" value={medicine.strength} icon={<Info size={18} />} />
                 <DetailRow label="Pack Size" value={medicine.pack_size} icon={<Package size={18} />} />
              </div>
           </section>

           <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                 <DollarSign size={16} className="mr-2" /> Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <DetailRow label="Selling Price" value={`$${medicine.selling_price}`} icon={<DollarSign size={18} />} />
                 <DetailRow label="MRP" value={`$${medicine.mrp}`} icon={<DollarSign size={18} />} />
                 <DetailRow label="Stock Level" value={medicine.quantity_in_stock} icon={<Package size={18} />} />
              </div>
           </section>

           <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                 <MapPin size={16} className="mr-2" /> Storage & Compliance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <DetailRow label="Rack Location" value={medicine.rack_number} icon={<MapPin size={18} />} />
                 <DetailRow label="Prescription Required" value={medicine.requires_prescription ? 'Yes' : 'No'} icon={<ShieldCheck size={18} />} />
              </div>
           </section>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button onClick={onClose}>Close Details</Button>
        </div>
      </div>
    </div>
  );
};
