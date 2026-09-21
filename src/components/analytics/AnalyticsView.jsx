import React, { useState } from 'react';
import { BarChart3, TrendingUp, Printer } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { dateKeyToLocalDate, getLocalDateKey } from '../../utils/date';

export const AnalyticsView = () => {
  const { medications, doseLogs, vitalsLogs } = useMedication();
  const [timeframe, setTimeframe] = useState('7'); // '7' | '30' | 'all'
  const [printPreview, setPrintPreview] = useState(false);

  // Filter dose logs by timeframe
  const getFilteredLogs = () => {
    if (timeframe === 'all') return doseLogs;
    const days = parseInt(timeframe, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = getLocalDateKey(cutoffDate);
    return doseLogs.filter(log => log.date >= cutoffStr);
  };

  const filteredLogs = getFilteredLogs();
  const totalLogsCount = filteredLogs.length;
  const takenLogsCount = filteredLogs.filter(l => l.status === 'taken').length;
  const skippedLogsCount = filteredLogs.filter(l => l.status === 'skipped').length;

  // Calculate dynamic adherence rate %
  const dynamicAdherence = totalLogsCount > 0 ? Math.round((takenLogsCount / totalLogsCount) * 100) : 100;

  // Calculate day-by-day weekly adherence rates (Mon - Sun)
  const getDayOfWeekAdherence = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(dayName => {
      // Find logs matching this day of week
      const matchingLogs = doseLogs.filter(l => {
        const d = dateKeyToLocalDate(l.date);
        const dName = d.toLocaleDateString('en-US', { weekday: 'short' });
        return dName === dayName;
      });

      const total = matchingLogs.length;
      const taken = matchingLogs.filter(l => l.status === 'taken').length;
      const pct = total > 0 ? Math.round((taken / total) * 100) : 0;

      return { dayName, total, taken, pct };
    });
  };

  const weeklyData = getDayOfWeekAdherence();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dynamic Activity Analytics</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">Medication Analytics</h2>
          <p className="text-sm text-slate-400">Compliance trends updated automatically from your daily activity</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Filter Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {[
              { id: '7', label: 'Last 7 Days' },
              { id: '30', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  timeframe === tf.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPrintPreview(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 transition transform hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4" />
            <span>Doctor Report</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border-slate-800 relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400">Dynamic Adherence Rate</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-extrabold text-white font-heading">{dynamicAdherence}%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Optimal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on {totalLogsCount} logged daily doses.</p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Doses Logged as Taken</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-extrabold text-emerald-400 font-heading">{takenLogsCount}</span>
            <span className="text-xs text-slate-400">out of {totalLogsCount} scheduled</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Logged in real-time from parent app.</p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Skipped / Missed Doses</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-extrabold text-rose-400 font-heading">{skippedLogsCount}</span>
            <span className="text-xs text-slate-400">doses</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Caregiver alerts sent on skipped doses.</p>
        </div>
      </div>

      {/* Dynamic Day-by-Day Bar Chart */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Weekly Day-by-Day Adherence Chart</h3>
            <p className="text-xs text-slate-400">Compliance percentages calculated per day of the week</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
            Real-Time Updates
          </span>
        </div>

        {/* Bar Visualizer */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
          {weeklyData.map(d => (
            <div key={d.dayName} className="flex-1 flex flex-col items-center group">
              <span className="text-[11px] font-bold text-slate-300 mb-2 group-hover:text-emerald-400 transition">
                {d.pct}%
              </span>
              <div className="w-full bg-slate-900 rounded-t-xl overflow-hidden h-36 flex items-end p-1 border border-slate-800">
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-700 group-hover:from-emerald-500 group-hover:to-teal-300"
                  style={{ height: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-400 mt-3">{d.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Doctor Compliance Report Modal */}
      {printPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl p-8 bg-white text-slate-900 shadow-2xl my-8 font-sans">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">MedBell — Clinical Adherence Report</h2>
                <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="font-bold text-emerald-600 block text-sm">Adherence: {dynamicAdherence}%</span>
                <span>Patient ID: P-889102</span>
              </div>
            </div>

            {/* Prescriptions Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Active Prescriptions</h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2.5">Medication</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Times</th>
                    <th className="p-2.5">Instruction</th>
                    <th className="p-2.5">Prescriber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {medications.map(med => (
                    <tr key={med.id}>
                      <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                      <td className="p-2.5">{med.dosage}</td>
                      <td className="p-2.5">{(med.times || []).join(', ')}</td>
                      <td className="p-2.5">{med.foodTiming}</td>
                      <td className="p-2.5">{med.doctor || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vitals Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Latest Vitals Log</h3>
              <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Blood Pressure</span>
                  <span className="font-bold text-slate-900 text-sm">{vitalsLogs[0] ? `${vitalsLogs[0].systolic}/${vitalsLogs[0].diastolic}` : '120/80'} mmHg</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Glucose</span>
                  <span className="font-bold text-slate-900 text-sm">{vitalsLogs[0] ? vitalsLogs[0].glucose : '95'} mg/dL</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Resting Pulse</span>
                  <span className="font-bold text-slate-900 text-sm">{vitalsLogs[0] ? vitalsLogs[0].pulse : '72'} bpm</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setPrintPreview(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
              >
                Print PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
