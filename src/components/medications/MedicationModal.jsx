import React, { useState } from 'react';
import { X, Plus, Trash2, Pill, Clock, Calendar } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { PillGraphic } from '../common/PillGraphic';
import { getLocalDateKey } from '../../utils/date';

const SHAPES = [
  { id: 'capsule', label: 'Capsule' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'oval', label: 'Oval' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'liquid', label: 'Liquid Bottle' },
  { id: 'injection', label: 'Injection' },
  { id: 'drops', label: 'Drops' },
  { id: 'inhaler', label: 'Inhaler' },
  { id: 'patch', label: 'Patch' }
];

const COLORS = [
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
  { id: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { id: 'amber', hex: '#f59e0b', label: 'Amber' },
  { id: 'crimson', hex: '#f43f5e', label: 'Crimson' },
  { id: 'purple', hex: '#a855f7', label: 'Purple' },
  { id: 'pink', hex: '#ec4899', label: 'Pink' },
  { id: 'blue', hex: '#3b82f6', label: 'Blue' },
  { id: 'silver', hex: '#e2e8f0', label: 'Silver' }
];

const STRIPE_COLORS = [
  { id: 'white', hex: '#ffffff' },
  { id: 'cyan', hex: '#06b6d4' },
  { id: 'emerald', hex: '#10b981' },
  { id: 'amber', hex: '#f59e0b' },
  { id: 'orange', hex: '#f97316' },
  { id: 'yellow', hex: '#fde047' },
  { id: 'crimson', hex: '#f43f5e' },
  { id: 'pink', hex: '#f472b6' }
];

const createFormData = (medication = null) => ({
  name: medication?.name || '',
  category: medication?.category || 'General',
  dosage: medication?.dosage || '500mg',
  unit: medication?.unit || 'tablet',
  quantity: medication?.quantity || 1,
  shape: medication?.shape || 'capsule',
  color: medication?.color || 'emerald',
  stripeColor: medication?.stripeColor || 'cyan',
  times: medication?.times || ['08:00'],
  foodTiming: medication?.foodTiming || 'After food',
  startDate: medication?.startDate || getLocalDateKey(),
  endDate: medication?.endDate || '',
  stock: medication?.stock ?? 30,
  refillThreshold: medication?.refillThreshold ?? 7,
  doctor: medication?.doctor || '',
  rxNumber: medication?.rxNumber || '',
  notes: medication?.notes || ''
});

export const MedicationModal = ({ isOpen, onClose, editingMedication = null }) => {
  const { addMedication, updateMedication } = useMedication();

  const [formData, setFormData] = useState(() => createFormData(editingMedication));

  if (!isOpen) return null;

  const handleAddTime = () => {
    setFormData(prev => ({ ...prev, times: [...prev.times, '12:00'] }));
  };

  const handleRemoveTime = (index) => {
    if (formData.times.length <= 1) return;
    setFormData(prev => ({ ...prev, times: prev.times.filter((_, i) => i !== index) }));
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const handleSetDurationPreset = (days) => {
    if (!days) {
      setFormData(prev => ({ ...prev, endDate: '' }));
      return;
    }
    const baseDate = formData.startDate ? new Date(formData.startDate) : new Date();
    baseDate.setDate(baseDate.getDate() + (days - 1));
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, endDate: `${year}-${month}-${day}` }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const uniqueTimes = [...new Set(formData.times.filter(Boolean))].sort();
    if (!formData.name.trim() || uniqueTimes.length === 0) return;

    const medicationData = {
      ...formData,
      name: formData.name.trim(),
      times: uniqueTimes,
      quantity: Math.max(1, Number(formData.quantity) || 1),
      stock: Math.max(0, Number(formData.stock) || 0),
      refillThreshold: Math.max(1, Number(formData.refillThreshold) || 1)
    };

    if (editingMedication) {
      updateMedication(editingMedication.id, medicationData);
    } else {
      addMedication(medicationData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h2>
              <p className="text-xs text-slate-400">Configure pill visuals, dose frequency, and refill alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          
          {/* Interactive Visual Customizer Preview */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex flex-col items-center">
              <PillGraphic
                shape={formData.shape}
                color={formData.color}
                stripeColor={formData.stripeColor}
                size={72}
              />
              <span className="text-[10px] text-slate-400 mt-2 font-mono uppercase">Live Preview</span>
            </div>

            <div className="flex-1 space-y-3 w-full">
              {/* Shape Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pill Shape</label>
                <div className="flex flex-wrap gap-1.5">
                  {SHAPES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, shape: s.id }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        formData.shape === s.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Color</label>
                  <div className="flex items-center space-x-1.5">
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, color: c.id }))}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          formData.color === c.id ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Accent / Stripe</label>
                  <div className="flex items-center space-x-1.5">
                    {STRIPE_COLORS.map(sc => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, stripeColor: sc.id }))}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          formData.stripeColor === sc.id ? 'border-emerald-400 scale-110' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: sc.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Medication Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="General">General</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Blood Pressure">Blood Pressure</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Supplement">Supplement / Vitamin</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Respiratory">Asthma / Respiratory</option>
                <option value="Cardiology">Cardiology / Heart</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Dosage</label>
              <input
                type="text"
                placeholder="e.g. 500mg, 10ml, 2 puffs"
                value={formData.dosage}
                onChange={(e) => setFormData(p => ({ ...p, dosage: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Meal Instruction</label>
              <select
                value={formData.foodTiming}
                onChange={(e) => setFormData(p => ({ ...p, foodTiming: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="After food">After food</option>
                <option value="Before food">Before food</option>
                <option value="With food">With food</option>
                <option value="On empty stomach">On empty stomach</option>
                <option value="Anytime">No restriction / Anytime</option>
              </select>
            </div>
          </div>

          {/* Treatment Course Period: Start Date & End Date */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Treatment Period (Start Date & End Date)</span>
              </label>

              {/* Quick Duration Presets */}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-500 font-medium mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSetDurationPreset(7)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-emerald-400 border border-slate-800 transition"
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDurationPreset(14)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-cyan-400 border border-slate-800 transition"
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDurationPreset(30)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-purple-400 border border-slate-800 transition"
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDurationPreset(null)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-amber-400 border border-slate-800 transition"
                >
                  Ongoing
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">End Date (Optional for Ongoing)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Schedule Timed Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Scheduled Reminder Times</span>
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Slot</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.times.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="bg-transparent text-slate-200 text-sm font-mono focus:outline-none"
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inventory & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Current Stock Count</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(p => ({ ...p, stock: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.refillThreshold}
                onChange={(e) => setFormData(p => ({ ...p, refillThreshold: parseInt(e.target.value, 10) || 5 }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Doctor & Rx info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Prescribing Doctor</label>
              <input
                type="text"
                placeholder="Dr. Sarah Jenkins"
                value={formData.doctor}
                onChange={(e) => setFormData(p => ({ ...p, doctor: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rx Prescription Number</label>
              <input
                type="text"
                placeholder="RX-99201"
                value={formData.rxNumber}
                onChange={(e) => setFormData(p => ({ ...p, rxNumber: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
            >
              {editingMedication ? 'Save Changes' : 'Create Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
