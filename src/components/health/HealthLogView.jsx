import React, { useState } from 'react';
import { Activity, Heart, Droplet, Scale, Plus, PhoneCall, ShieldAlert, Edit3, Trash2 } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';

export const HealthLogView = () => {
  const { vitalsLogs, addVitalLog, updateVitalLog, deleteVitalLog } = useMedication();

  const [doctors, setDoctors] = useState([
    { id: 'doc-1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology Specialist', phone: '+1 (555) 392-1029', clinic: 'St. Jude Heart Center' },
    { id: 'doc-2', name: 'Dr. Michael Vance', specialty: 'Primary Care Physician', phone: '+1 (555) 840-2210', clinic: 'City Health Medical Clinic' },
    { id: 'doc-3', name: 'Dr. Elena Rostova', specialty: 'Endocrinologist', phone: '+1 (555) 991-4402', clinic: 'Metabolic & Diabetes Care' }
  ]);

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [editingVital, setEditingVital] = useState(null);

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [vitalForm, setVitalForm] = useState({
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    glucose: 95,
    weight: 74,
    notes: ''
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    clinic: ''
  });

  const handleOpenAddVital = () => {
    setEditingVital(null);
    setVitalForm({ systolic: 120, diastolic: 80, pulse: 72, glucose: 95, weight: 74, notes: '' });
    setShowVitalsModal(true);
  };

  const handleOpenEditVital = (log) => {
    setEditingVital(log);
    setVitalForm({
      systolic: log.systolic || 120,
      diastolic: log.diastolic || 80,
      pulse: log.pulse || 72,
      glucose: log.glucose || 95,
      weight: log.weight || 74,
      notes: log.notes || ''
    });
    setShowVitalsModal(true);
  };

  const handleSaveVital = (e) => {
    e.preventDefault();
    if (editingVital) {
      updateVitalLog(editingVital.id, {
        systolic: Number(vitalForm.systolic),
        diastolic: Number(vitalForm.diastolic),
        pulse: Number(vitalForm.pulse),
        glucose: Number(vitalForm.glucose),
        weight: Number(vitalForm.weight),
        notes: vitalForm.notes
      });
    } else {
      addVitalLog({
        systolic: Number(vitalForm.systolic),
        diastolic: Number(vitalForm.diastolic),
        pulse: Number(vitalForm.pulse),
        glucose: Number(vitalForm.glucose),
        weight: Number(vitalForm.weight),
        notes: vitalForm.notes
      });
    }
    setShowVitalsModal(false);
  };

  const handleOpenEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({ name: doc.name, specialty: doc.specialty, phone: doc.phone, clinic: doc.clinic });
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    setDoctors(prev => prev.map(d => (d.id === editingDoctor.id ? { ...d, ...doctorForm } : d)));
    setShowDoctorModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header & Log Vitals CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Vitals & Symptoms</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">Health Log</h2>
          <p className="text-sm text-slate-400">Record and edit blood pressure, glucose, pulse, and doctor contacts</p>
        </div>

        <button
          onClick={handleOpenAddVital}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Record Vitals</span>
        </button>
      </div>

      {/* Quick Vitals Summary Cards (Click to Adjust) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={vitalsLogs[0] ? () => handleOpenEditVital(vitalsLogs[0]) : handleOpenAddVital}
          className="glass-panel glass-panel-hover rounded-3xl p-6 border-slate-800 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300">Blood Pressure</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-heading">
            {vitalsLogs[0] ? `${vitalsLogs[0].systolic}/${vitalsLogs[0].diastolic}` : '120/80'}
            <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              Normal Range
            </span>
            <span className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition">Adjust BP ➔</span>
          </div>
        </div>

        <div
          onClick={vitalsLogs[0] ? () => handleOpenEditVital(vitalsLogs[0]) : handleOpenAddVital}
          className="glass-panel glass-panel-hover rounded-3xl p-6 border-slate-800 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300">Blood Glucose</span>
            <Droplet className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-heading">
            {vitalsLogs[0] ? vitalsLogs[0].glucose : '95'}
            <span className="text-xs font-normal text-slate-400 ml-1">mg/dL</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              Fasting Optimal
            </span>
            <span className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition">Adjust Glucose ➔</span>
          </div>
        </div>

        <div
          onClick={vitalsLogs[0] ? () => handleOpenEditVital(vitalsLogs[0]) : handleOpenAddVital}
          className="glass-panel glass-panel-hover rounded-3xl p-6 border-slate-800 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300">Heart Pulse</span>
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-white font-heading">
            {vitalsLogs[0] ? vitalsLogs[0].pulse : '72'}
            <span className="text-xs font-normal text-slate-400 ml-1">bpm</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              Resting Normal
            </span>
            <span className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition">Adjust Pulse ➔</span>
          </div>
        </div>

        <div
          onClick={vitalsLogs[0] ? () => handleOpenEditVital(vitalsLogs[0]) : handleOpenAddVital}
          className="glass-panel glass-panel-hover rounded-3xl p-6 border-slate-800 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300">Body Weight</span>
            <Scale className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-heading">
            {vitalsLogs[0] ? vitalsLogs[0].weight : '74.2'}
            <span className="text-xs font-normal text-slate-400 ml-1">kg</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              Stable Trend
            </span>
            <span className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition">Adjust Weight ➔</span>
          </div>
        </div>
      </div>

      {/* Doctor Directory Cards (Editable) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-heading text-white">Emergency Contacts & Doctor Directory</h3>
          <button
            onClick={() => alert('Triggering Emergency SOS Notification to primary contact...')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/40 transition"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency SOS Trigger</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-bold text-white">{doc.name}</h4>
                  <button
                    onClick={() => handleOpenEditDoctor(doc)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700 opacity-80 group-hover:opacity-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-cyan-400 font-medium">{doc.specialty}</p>
                <p className="text-xs text-slate-400 mt-1">{doc.clinic}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">{doc.phone}</span>
                <a
                  href={`tel:${doc.phone}`}
                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Vitals Log List (Editable & Deletable) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <h3 className="text-xl font-bold font-heading text-white mb-6">Historical Clinical Records</h3>

        <div className="space-y-3">
          {vitalsLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-slate-800 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">BP: {log.systolic}/{log.diastolic} mmHg</span>
                    <span className="text-xs text-slate-400">• Glucose: {log.glucose} mg/dL</span>
                    <span className="text-xs text-slate-400">• Pulse: {log.pulse} bpm</span>
                    <span className="text-xs text-slate-400">• Weight: {log.weight} kg</span>
                  </div>
                  {log.notes && <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>

                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenEditVital(log)}
                    title="Edit Vitals Entry"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteVitalLog(log.id)}
                    title="Delete Entry"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingVital ? 'Edit Vitals Entry' : 'Record New Vitals'}
            </h3>
            <form onSubmit={handleSaveVital} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Systolic BP (mmHg)</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, systolic: Math.max(50, Number(p.systolic || 120) - 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      value={vitalForm.systolic}
                      onChange={(e) => setVitalForm({ ...vitalForm, systolic: e.target.value })}
                      className="w-full text-center p-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, systolic: Math.min(240, Number(p.systolic || 120) + 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Diastolic BP (mmHg)</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, diastolic: Math.max(30, Number(p.diastolic || 80) - 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      value={vitalForm.diastolic}
                      onChange={(e) => setVitalForm({ ...vitalForm, diastolic: e.target.value })}
                      className="w-full text-center p-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, diastolic: Math.min(160, Number(p.diastolic || 80) + 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Heart Pulse (bpm)</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, pulse: Math.max(30, Number(p.pulse || 72) - 1) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      value={vitalForm.pulse}
                      onChange={(e) => setVitalForm({ ...vitalForm, pulse: e.target.value })}
                      className="w-full text-center p-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, pulse: Math.min(220, Number(p.pulse || 72) + 1) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Glucose (mg/dL)</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, glucose: Math.max(40, Number(p.glucose || 95) - 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      value={vitalForm.glucose}
                      onChange={(e) => setVitalForm({ ...vitalForm, glucose: e.target.value })}
                      className="w-full text-center p-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setVitalForm(p => ({ ...p, glucose: Math.min(600, Number(p.glucose || 95) + 5) }))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Body Weight (kg)</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setVitalForm(p => ({ ...p, weight: (Math.max(10, Number(p.weight || 74) - 0.5)).toFixed(1) }))}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                  >
                    -0.5 kg
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalForm.weight}
                    onChange={(e) => setVitalForm({ ...vitalForm, weight: e.target.value })}
                    className="w-full text-center p-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setVitalForm(p => ({ ...p, weight: (Math.min(300, Number(p.weight || 74) + 0.5)).toFixed(1) }))}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
                  >
                    +0.5 kg
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Symptom / Health Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Mild tiredness after exercise"
                  value={vitalForm.notes}
                  onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Contact Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Edit Doctor Contact</h3>
            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  value={doctorForm.clinic}
                  onChange={(e) => setDoctorForm({ ...doctorForm, clinic: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
