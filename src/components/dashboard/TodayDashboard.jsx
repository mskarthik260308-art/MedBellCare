import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Flame, AlertCircle, ChevronRight, CheckCheck } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { PillGraphic } from '../common/PillGraphic';
import { getLocalDateKey, isMedicationActiveOnDate } from '../../utils/date';

export const TodayDashboard = ({ onOpenAddModal, setActiveTab }) => {
  const { medications, doseLogs, markDoseStatus, testAlarmTrigger, currentUser } = useMedication();
  const [selectedSlot, setSelectedSlot] = useState('all');

  const todayStr = getLocalDateKey();

  // Helper to get time slot (Morning: 05:00-11:59, Afternoon: 12:00-16:59, Evening: 17:00-20:59, Night: 21:00-04:59)
  const getTimeSlotCategory = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Compile all doses scheduled for today (only active within Start Date and End Date range)
  const activeTodayMeds = medications.filter(med => isMedicationActiveOnDate(med, todayStr));

  const todayDoses = activeTodayMeds.flatMap(med => {
    return (med.times || ['08:00']).map(time => {
      const existingLog = doseLogs.find(
        l => l.medicationId === med.id && l.scheduledTime === time && l.date === todayStr
      );
      const status = existingLog ? existingLog.status : 'pending';
      return {
        medication: med,
        time,
        slotCategory: getTimeSlotCategory(time),
        status,
        log: existingLog
      };
    });
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Filtered doses
  const filteredDoses = selectedSlot === 'all'
    ? todayDoses
    : todayDoses.filter(d => d.slotCategory === selectedSlot);

  // Stats calculation
  const totalDosesCount = todayDoses.length;
  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const adherencePercentage = totalDosesCount > 0 ? Math.round((takenCount / totalDosesCount) * 100) : 100;

  // Low stock medications
  const lowStockMeds = medications.filter(m => m.stock <= (m.refillThreshold || 5));

  // Find next upcoming dose
  const nowTimeStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const upcomingDose = todayDoses.find(d => d.status === 'pending' && d.time >= nowTimeStr) || todayDoses.find(d => d.status === 'pending');

  const handleTakeAllPending = () => {
    todayDoses.filter(d => d.status === 'pending').forEach(d => {
      markDoseStatus(d.medication.id, d.time, 'taken');
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Adherence Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress & Adherence Ring Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">Daily Adherence</h3>
              <p className="text-xs text-slate-400">Today's completed schedule</p>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>7 Day Streak!</span>
            </div>
          </div>

          <div className="flex items-center justify-around my-4">
            {/* Progress Circular Graphic */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000 ease-out drop-shadow-md"
                  strokeDasharray={`${adherencePercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-heading tracking-tight">{adherencePercentage}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Complete</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 glow-emerald" />
                <span className="text-sm font-semibold text-slate-200">{takenCount} Taken</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold text-slate-200">{totalDosesCount - takenCount} Pending</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="text-sm font-semibold text-slate-400">{totalDosesCount} Scheduled</span>
              </div>
            </div>
          </div>

          {todayDoses.some(d => d.status === 'pending') && (
            <button
              onClick={handleTakeAllPending}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Pending Doses as Taken</span>
            </button>
          )}
        </div>

        {/* Upcoming Dose Banner */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-slate-800 relative overflow-hidden lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Scheduled Dose</span>
              </div>
              {upcomingDose ? (
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white">{upcomingDose.medication.name}</h2>
                  <p className="text-sm text-slate-400">{upcomingDose.medication.dosage} • Scheduled for {upcomingDose.time}</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white">All Doses Completed! 🎉</h2>
                  <p className="text-sm text-slate-400">Great job adhering to your healthcare schedule today.</p>
                </div>
              )}
            </div>

            {upcomingDose && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <PillGraphic
                  shape={upcomingDose.medication.shape}
                  color={upcomingDose.medication.color}
                  stripeColor={upcomingDose.medication.stripeColor}
                  size={56}
                />
              </div>
            )}
          </div>

          {upcomingDose ? (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="text-xs text-slate-400">
                Instruction: <span className="text-slate-200 font-medium">{upcomingDose.medication.foodTiming || 'Take with water'}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => testAlarmTrigger(upcomingDose.medication.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                >
                  Simulate Alarm
                </button>
                <button
                  onClick={() => markDoseStatus(upcomingDose.medication.id, upcomingDose.time, 'taken')}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.02]"
                >
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Take Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Explore all your prescribed medications and schedules.</span>
              <button
                onClick={() => setActiveTab('medications')}
                className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold hover:underline"
              >
                <span>Manage Medications</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Warning Box */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Low Stock Warning for {lowStockMeds.map(m => m.name).join(', ')}</p>
              <p className="text-xs text-amber-400/80">Refill your prescription before you run out.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('medications')}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
          >
            Refill Stock
          </button>
        </div>
      )}

      {/* Main Schedule Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">
            Welcome back, {currentUser ? currentUser.name : 'Senior Parent'}! 👋
          </h2>
          <p className="text-xs text-slate-400">Manage your timed doses for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Time Slot Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Doses' },
            { id: 'morning', label: '🌅 Morning' },
            { id: 'afternoon', label: '☀️ Afternoon' },
            { id: 'evening', label: '🌆 Evening' },
            { id: 'night', label: '🌙 Night' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSlot(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedSlot === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dose Cards List Grid */}
      {filteredDoses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-300">No scheduled doses for this section</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">You can add new medicines or check other time periods.</p>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-2"
          >
            <span>+ Add New Medicine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoses.map((item, idx) => {
            const { medication: med, time, status } = item;

            return (
              <div
                key={`${med.id}-${time}-${idx}`}
                className={`glass-panel glass-panel-hover rounded-3xl p-6 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  status === 'taken'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : status === 'skipped'
                    ? 'border-slate-800 opacity-60'
                    : 'border-slate-800'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{time}</span>
                  </div>

                  {status === 'taken' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Taken</span>
                    </span>
                  )}

                  {status === 'skipped' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                      <XCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Skipped</span>
                    </span>
                  )}

                  {status === 'pending' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Pending</span>
                    </span>
                  )}

                  {status === 'snoozed' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Snoozed</span>
                    </span>
                  )}
                </div>

                {/* Medicine Content */}
                <div className="flex items-start space-x-4 my-2">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex-shrink-0">
                    <PillGraphic
                      shape={med.shape}
                      color={med.color}
                      stripeColor={med.stripeColor}
                      size={52}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate font-heading">{med.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mb-1.5">{med.dosage} • {med.unit || 'dose'}</p>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-semibold border border-slate-800">
                        {med.foodTiming || 'No meal restriction'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-medium border border-slate-800">
                        Stock: {med.stock} left
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {status === 'taken' ? (
                    <button
                      onClick={() => markDoseStatus(med.id, time, 'pending')}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Undo Taken
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full space-x-2">
                      <button
                        onClick={() => markDoseStatus(med.id, time, 'skipped')}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition"
                      >
                        Skip
                      </button>

                      <button
                        onClick={() => markDoseStatus(med.id, time, 'taken')}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition transform active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Mark Taken</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
