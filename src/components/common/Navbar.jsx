import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Grid, BarChart3, Activity, Settings, Plus, HeartHandshake, Mic, LogIn, LogOut } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenVoiceRecorderModal,
  onOpenLoginModal
}) => {
  const { settings, activeAlarm, currentUser, logoutUser } = useMedication();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'medications', label: 'Medications', icon: Grid },
    { id: 'caregiver', label: 'Caregiver Monitor', icon: HeartHandshake, highlight: true },
    { id: 'health', label: 'Health Log', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('today')}>
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 glow-emerald">
              <Bell className="w-7 h-7 transform -rotate-12 animate-ring" />
              {activeAlarm && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  MedBell
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CARE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Senior Care & Family Medicine Reminder</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5">
            {/* Live Clock Badge */}
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{timeStr}</span>
            </div>

            {/* Custom Voice Recorder Button */}
            <button
              onClick={onOpenVoiceRecorderModal}
              title="Record Custom Voice Alarm"
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-all duration-200 relative group"
            >
              <Mic className="w-4 h-4 text-rose-400" />
              {settings.alarmSound === 'customVoice' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettingsModal}
              title="App Settings"
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-slate-800 transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Auth & Sign Out Badge */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={onOpenLoginModal}
                  title="Switch User Profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
                >
                  <span className="text-base">{currentUser.avatar}</span>
                  <span className="hidden sm:inline font-bold truncate max-w-[90px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                <button
                  onClick={() => {
                    logoutUser();
                    onOpenLoginModal();
                  }}
                  title="Sign Out Session"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-emerald-400 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Add Medicine CTA */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Medicine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
