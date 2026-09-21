import React, { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock, XCircle, AlertTriangle, Utensils, Info } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { PillGraphic } from './PillGraphic';
import { stopSpeech } from '../../services/speechService';
import { stopAlarmLoop } from '../../services/soundService';

export const AlarmOverlay = () => {
  const { activeAlarm, takeActiveAlarm, snoozeAlarm, dismissActiveAlarm } = useMedication();

  useEffect(() => {
    return () => {
      stopAlarmLoop();
      stopSpeech();
    };
  }, []);

  if (!activeAlarm) return null;

  const { medication, scheduledTime } = activeAlarm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-slate-900/90 border-2 border-rose-500/60 shadow-2xl shadow-rose-950/50 glow-alarm overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider animate-ring">
            <BellRing className="w-4 h-4 text-rose-400" />
            <span>Medication Due Now • {scheduledTime}</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Central Pill Preview */}
        <div className="flex flex-col items-center text-center my-6">
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 mb-4 animate-float shadow-xl">
            <PillGraphic
              shape={medication.shape}
              color={medication.color}
              stripeColor={medication.stripeColor}
              size={80}
            />
          </div>

          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight mb-1">
            {medication.name}
          </h2>
          
          <div className="inline-flex items-center space-x-2 text-lg font-semibold text-emerald-400 mb-3">
            <span>{medication.dosage}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="capitalize">{medication.unit || 'dose'}</span>
          </div>

          {/* Details Pill badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {medication.foodTiming && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>{medication.foodTiming}</span>
              </span>
            )}

            {medication.stock <= (medication.refillThreshold || 5) && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Low Stock ({medication.stock} left)</span>
              </span>
            )}
          </div>

          {medication.notes && (
            <div className="w-full p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 text-left flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{medication.notes}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 gap-3 mt-6">
          {/* Primary TAKE button */}
          <button
            onClick={() => {
              stopAlarmLoop();
              stopSpeech();
              takeActiveAlarm();
            }}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Take Medication Now</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {/* Snooze 15m */}
            <button
              onClick={() => {
                stopAlarmLoop();
                stopSpeech();
                snoozeAlarm(15);
              }}
              className="flex items-center justify-center space-x-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze (15m)</span>
            </button>

            {/* Snooze 1m Test */}
            <button
              onClick={() => {
                stopAlarmLoop();
                stopSpeech();
                snoozeAlarm(1);
              }}
              className="flex items-center justify-center space-x-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze (1m Test)</span>
            </button>

            {/* Skip Dose */}
            <button
              onClick={() => {
                stopAlarmLoop();
                stopSpeech();
                dismissActiveAlarm();
              }}
              className="flex items-center justify-center space-x-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Skip Dose</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
