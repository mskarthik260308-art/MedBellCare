import React, { useState } from 'react';
import { MedicationProvider } from './context/MedicationContext';
import { Navbar } from './components/common/Navbar';
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { MedicationList } from './components/medications/MedicationList';
import { CaregiverView } from './components/caregiver/CaregiverView';
import { HealthLogView } from './components/health/HealthLogView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AlarmOverlay } from './components/common/AlarmOverlay';
import { MedicationModal } from './components/medications/MedicationModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { VoiceRecorderModal } from './components/common/VoiceRecorderModal';
import { LoginModal } from './components/auth/LoginModal';
import { Bell, ShieldCheck } from 'lucide-react';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [medicationModalKey, setMedicationModalKey] = useState(0);

  const handleOpenAddModal = () => {
    setEditingMedication(null);
    setMedicationModalKey(key => key + 1);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (medication) => {
    setEditingMedication(medication);
    setMedicationModalKey(key => key + 1);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300 pb-16 lg:pb-0">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenVoiceRecorderModal={() => setIsVoiceRecorderOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'today' && (
          <TodayDashboard
            onOpenAddModal={handleOpenAddModal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationList
            onOpenAddModal={handleOpenAddModal}
            onEditMedication={handleOpenEditModal}
          />
        )}

        {activeTab === 'caregiver' && (
          <CaregiverView
            onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
          />
        )}

        {activeTab === 'health' && (
          <HealthLogView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}
      </main>

      {/* Modals & Overlays */}
      <AlarmOverlay />

      <MedicationModal
        key={medicationModalKey}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedication(null);
        }}
        editingMedication={editingMedication}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenVoiceRecorderModal={() => setIsVoiceRecorderOpen(true)}
      />

      <VoiceRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        setActiveTab={setActiveTab}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 mb-12 lg:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-400">MedBell — Senior Care & Family Medicine Reminder</span>
          </div>

          <p>© {new Date().getFullYear()} MedBell Health Technologies. All rights reserved.</p>

          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Senior Accessible & Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MedicationProvider>
      <AppContent />
    </MedicationProvider>
  );
}
