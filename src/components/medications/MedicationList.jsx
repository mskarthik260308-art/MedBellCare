import React, { useState } from 'react';
import { Pill, Plus, Search, Edit3, Trash2, Bell, AlertTriangle, RefreshCw, UserCheck, FileText } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { PillGraphic } from '../common/PillGraphic';

export const MedicationList = ({ onOpenAddModal, onEditMedication }) => {
  const { medications, deleteMedication, updateMedication, testAlarmTrigger } = useMedication();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(medications.map(m => m.category || 'General'))];

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.doctor && med.doctor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefill = (medId, currentStock) => {
    updateMedication(medId, { stock: (currentStock || 0) + 30 });
  };

  const handleDelete = (medication) => {
    if (window.confirm(`Delete ${medication.name} and its dose history? This cannot be undone.`)) {
      deleteMedication(medication.id);
    }
  };

  return (
    <div className="space-y-8 pb-16">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">Medications Manager</h2>
          <p className="text-sm text-slate-400">View, edit, and organize your prescriptions & health supplements</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 text-slate-200 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Medications */}
      {filteredMeds.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border-slate-800">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No medications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">Try clearing search filters or add your first prescription.</p>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Add Medication
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => {
            const isLowStock = med.stock <= (med.refillThreshold || 5);

            return (
              <div
                key={med.id}
                className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-800">
                    {med.category || 'General'}
                  </span>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => testAlarmTrigger(med.id)}
                      title="Test Reminder Alarm"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditMedication(med)}
                      title="Edit Medication"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med)}
                      title="Delete Medication"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Medication Visual Header */}
                <div className="flex items-start space-x-4 my-2">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <PillGraphic
                      shape={med.shape}
                      color={med.color}
                      stripeColor={med.stripeColor}
                      size={64}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold font-heading text-white truncate">{med.name}</h3>
                    <p className="text-sm text-emerald-400 font-semibold">{med.dosage} • {med.unit || 'dose'}</p>

                    <div className="mt-2 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-slate-300">Times:</span>
                        <span className="text-slate-200 font-semibold">{(med.times || []).join(', ')}</span>
                      </div>
                      <div>
                        <span>Food: </span>
                        <span className="text-slate-300 font-medium">{med.foodTiming || 'Anytime'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rx & Doctor Info */}
                {(med.doctor || med.rxNumber) && (
                  <div className="my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    {med.doctor && (
                      <div className="flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate">{med.doctor}</span>
                      </div>
                    )}
                    {med.rxNumber && (
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Rx #: {med.rxNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Tracker & Refill Footer */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Stock Inventory</span>
                    <span className={`font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                      {med.stock} pills remaining
                    </span>
                  </div>

                  {/* Stock bar indicator */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${isLowStock ? 'bg-amber-500' : 'bg-emerald-400'
                        }`}
                      style={{ width: `${Math.min(100, (med.stock / 60) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {isLowStock ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low Stock Alert</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Refill at {med.refillThreshold || 5} units</span>
                    )}

                    <button
                      onClick={() => handleRefill(med.id, med.stock)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-slate-800 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>+30 Pills</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
