import React, { useState } from 'react';
import { HeartHandshake, Phone, AlertTriangle, CheckCircle2, Clock, Send, Volume2, Flame } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { PillGraphic } from '../common/PillGraphic';
import { playAlarmSound } from '../../services/soundService';
import { getLocalDateKey } from '../../utils/date';

export const CaregiverView = ({ onOpenVoiceRecorder }) => {
  const { medications, doseLogs, currentUser } = useMedication();
  const [nudgeSent, setNudgeSent] = useState(false);

  const todayStr = getLocalDateKey();

  // Adherence metrics for parent
  const todayDoses = medications.flatMap(med => {
    return (med.times || ['08:00']).map(time => {
      const existingLog = doseLogs.find(
        l => l.medicationId === med.id && l.scheduledTime === time && l.date === todayStr
      );
      return {
        medication: med,
        time,
        status: existingLog ? existingLog.status : 'pending',
        log: existingLog
      };
    });
  });

  const totalToday = todayDoses.length;
  const takenToday = todayDoses.filter(d => d.status === 'taken').length;
  const missedToday = todayDoses.filter(d => d.status === 'skipped').length;
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

  const handleSendNudge = () => {
    setNudgeSent(true);
    playAlarmSound('gentle');
    setTimeout(() => setNudgeSent(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Family Caregiver Remote Monitor</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">Parent Adherence Tracker</h2>
          <p className="text-sm text-slate-400">
            Monitoring medication intake & vitals for {currentUser ? currentUser.name : 'Senior Parent'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenVoiceRecorder}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Record Voice Nudge</span>
          </button>

          <button
            onClick={handleSendNudge}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-slate-950 font-extrabold text-xs shadow-lg transition transform hover:-translate-y-0.5 ${
              nudgeSent ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{nudgeSent ? 'Nudge Ring Sent! 🔔' : 'Send Remote Nudge'}</span>
          </button>
        </div>
      </div>

      {/* Parent Live Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Parent Summary Card */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner">
            {currentUser?.avatar || '👵'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-heading text-white truncate">
                {currentUser ? currentUser.name : 'Senior Parent'}
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Device Active Online" />
            </div>
            <p className="text-xs text-slate-400">Senior Parent • Monitored Device</p>

            <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>7 Day Adherence Streak</span>
            </div>
          </div>
        </div>

        {/* Adherence Percentage Card */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Today's Parent Compliance</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-white font-heading">{adherenceRate}%</span>
              <span className="text-xs text-slate-400">({takenToday}/{totalToday} doses)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Updated in real-time from parent's device</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>

        {/* Emergency Direct Call Button */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Direct Parent Line</span>
          <div className="flex items-center justify-between my-2">
            <div>
              <p className="text-base font-bold text-white">+1 (555) 234-5678</p>
              <p className="text-xs text-slate-400">Home Smart Phone</p>
            </div>
            <a
              href="tel:+15552345678"
              className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-5 h-5 fill-current" />
            </a>
          </div>
        </div>
      </div>

      {/* Missed Dose Warning Notice */}
      {missedToday > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Missed Dose Alert for Senior Parent!</p>
              <p className="text-xs text-rose-300/80">Senior Parent skipped {missedToday} scheduled medication today.</p>
            </div>
          </div>
          <button
            onClick={handleSendNudge}
            className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow"
          >
            Nudge Parent Now
          </button>
        </div>
      )}

      {/* Today's Live Prescription Dose Log Feed */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Live Intake Log for Today</h3>
            <p className="text-xs text-slate-400">Real-time status updates as medicines are taken</p>
          </div>
        </div>

        <div className="space-y-4">
          {todayDoses.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <PillGraphic
                    shape={item.medication.shape}
                    color={item.medication.color}
                    stripeColor={item.medication.stripeColor}
                    size={40}
                  />
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{item.medication.name}</h4>
                  <p className="text-xs text-slate-400">{item.medication.dosage} • Scheduled for {item.time}</p>
                </div>
              </div>

              <div>
                {item.status === 'taken' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Taken on time</span>
                  </span>
                )}
                {item.status === 'pending' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Pending</span>
                  </span>
                )}
                {item.status === 'skipped' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Skipped</span>
                  </span>
                )}
                {item.status === 'snoozed' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Snoozed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Vitals Snapshot */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <h3 className="text-xl font-bold font-heading text-white mb-4">Latest Health Vitals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block">Blood Pressure</span>
            <span className="text-2xl font-bold text-white font-heading">118/78 <span className="text-xs font-normal text-slate-400">mmHg</span></span>
            <span className="block mt-1 text-[10px] text-emerald-400 font-bold">Optimal Range</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block">Blood Glucose</span>
            <span className="text-2xl font-bold text-white font-heading">92 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
            <span className="block mt-1 text-[10px] text-emerald-400 font-bold">Fasting Normal</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block">Resting Heart Rate</span>
            <span className="text-2xl font-bold text-white font-heading">68 <span className="text-xs font-normal text-slate-400">bpm</span></span>
            <span className="block mt-1 text-[10px] text-emerald-400 font-bold">Normal Rhythm</span>
          </div>
        </div>
      </div>

    </div>
  );
};
