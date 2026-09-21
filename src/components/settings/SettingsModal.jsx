import React from 'react';
import { X, Volume2, Mic, Bell, RefreshCw, Download, Upload, Check } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';
import { playAlarmSound, SOUND_TYPES } from '../../services/soundService';

export const SettingsModal = ({ isOpen, onClose, onOpenVoiceRecorderModal }) => {
  const { settings, updateSettings, medications, doseLogs, vitalsLogs, importData, resetToSampleData, resetToDefaultZero } = useMedication();

  if (!isOpen) return null;

  const alarmOptions = [
    { id: SOUND_TYPES.GENTLE, label: 'Gentle Chime (Calm)', desc: 'Soft acoustic ascending bell tones' },
    { id: SOUND_TYPES.BEEP, label: 'Digital Beep (Standard)', desc: 'Crisp triple electronic beep' },
    { id: SOUND_TYPES.BELL, label: 'Brass Bell (Resonant)', desc: 'Rich warm metallic chime' },
    { id: SOUND_TYPES.SIREN, label: 'Medical Pulse (Energetic)', desc: 'High priority dual-tone siren' },
    { id: SOUND_TYPES.CUSTOM_VOICE, label: '🎙️ Custom Recorded Voice Alarm', desc: settings.customVoiceUrl ? 'Personal voice recording active' : 'No voice recording set yet' }
  ];

  const handleExportData = () => {
    const exportObject = {
      medications,
      doseLogs,
      vitalsLogs,
      settings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medbell-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        importData(imported);
        alert('Backup restored successfully.');
      } catch {
        alert('Invalid or incomplete MedBell backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleNotificationToggle = async (enabled) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      updateSettings({ browserNotifications: permission === 'granted' });
      return;
    }
    updateSettings({ browserNotifications: enabled });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">MedBell Settings</h2>
              <p className="text-xs text-slate-400">Audio preferences, voice announcements, and backup</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-6">
          
          {/* Custom Voice Recorder Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Personal Voice Alarm</p>
                <p className="text-[11px] text-slate-300">
                  {settings.customVoiceUrl ? 'Voice recording saved & ready' : 'Record your voice for family medicine reminders'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenVoiceRecorderModal();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow transition"
            >
              {settings.customVoiceUrl ? 'Re-record' : 'Record Now'}
            </button>
          </div>

          {/* Sound Tone Selection */}
          <div>
            <label className="text-sm font-bold text-white block mb-3">Alarm Sound Tone</label>
            <div className="grid grid-cols-1 gap-2.5">
              {alarmOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => updateSettings({ alarmSound: opt.id })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    settings.alarmSound === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      settings.alarmSound === opt.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                    }`}>
                      {settings.alarmSound === opt.id && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[11px] text-slate-400">{opt.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAlarmSound(opt.id, settings.customVoiceUrl);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition"
                  >
                    Test Tone
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Assistant & Notification Toggles */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-3">
                <Mic className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-white">Synthesized Voice Readout</p>
                  <p className="text-[11px] text-slate-400">Reads medicine name and dosage aloud on alarm</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) => updateSettings({ voiceEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-white">Browser Desktop Notifications</p>
                  <p className="text-[11px] text-slate-400">Receive system notifications when tab is in background</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.browserNotifications}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="pt-4 border-t border-slate-800">
            <label className="text-sm font-bold text-white block mb-3">Data Management</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Data (JSON)</span>
              </button>

              <label className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={() => {
                  if (confirm('Reset all medications, dose logs, and vitals for your account back to 0?')) {
                    resetToDefaultZero();
                  }
                }}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Account to 0</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset all data back to default sample medications?')) {
                    resetToSampleData();
                  }
                }}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
