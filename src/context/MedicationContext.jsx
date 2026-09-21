import React, { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_MEDICATIONS, INITIAL_SETTINGS, INITIAL_VITALS, INITIAL_DOSE_LOGS } from '../data/initialData';
import { startAlarmLoop, stopAlarmLoop } from '../services/soundService';
import { speakMedicineReminder, stopSpeech } from '../services/speechService';
import { getLocalDateKey } from '../utils/date';
import { MedicationContext } from './medicationStore';

export const MedicationProvider = ({ children }) => {
  // Registered Accounts Database
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('medbell_registered_users');
      return saved ? JSON.parse(saved) : [
        { name: 'MedBell User', email: 'user@medbell.com', password: 'password123', avatar: '💊' }
      ];
    } catch {
      return [
        { name: 'MedBell User', email: 'user@medbell.com', password: 'password123', avatar: '💊' }
      ];
    }
  });

  // Helper for per-user data isolation
  const getUserStorageKey = (email, type) => {
    const safeEmail = (email || 'user@medbell.com').toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `medbell_${type}_${safeEmail}`;
  };

  // Current User Profile State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medbell_user');
      return saved ? JSON.parse(saved) : { name: 'MedBell User', email: 'user@medbell.com', avatar: '💊' };
    } catch {
      return { name: 'MedBell User', email: 'user@medbell.com', avatar: '💊' };
    }
  });

  // Helpers to load user-scoped data (or default 0 for new users)
  const loadInitialUserMeds = (user) => {
    try {
      const key = getUserStorageKey(user?.email, 'medications');
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      if (user?.email === 'user@medbell.com' || user?.email === 'parent@medbell.com' || user?.email === 'child@medbell.com') {
        return INITIAL_MEDICATIONS;
      }
      return [];
    } catch {
      return [];
    }
  };

  const loadInitialUserLogs = (user) => {
    try {
      const key = getUserStorageKey(user?.email, 'dose_logs');
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      if (user?.email === 'user@medbell.com' || user?.email === 'parent@medbell.com' || user?.email === 'child@medbell.com') {
        return INITIAL_DOSE_LOGS;
      }
      return [];
    } catch {
      return [];
    }
  };

  const loadInitialUserVitals = (user) => {
    try {
      const key = getUserStorageKey(user?.email, 'vitals');
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      if (user?.email === 'user@medbell.com' || user?.email === 'parent@medbell.com' || user?.email === 'child@medbell.com') {
        return INITIAL_VITALS;
      }
      return [];
    } catch {
      return [];
    }
  };

  // 1. Medications State
  const [medications, setMedications] = useState(() => loadInitialUserMeds(currentUser));

  // 2. Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('medbell_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 3. Dose Logs State
  const [doseLogs, setDoseLogs] = useState(() => loadInitialUserLogs(currentUser));

  // 4. Vitals State
  const [vitalsLogs, setVitalsLogs] = useState(() => loadInitialUserVitals(currentUser));

  // Active alarm trigger modal state
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [snoozedAlarms, setSnoozedAlarms] = useState([]);
  const activeAlarmRef = useRef(null);
  const doseLogsRef = useRef(doseLogs);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('medbell_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medbell_user', JSON.stringify(currentUser));
      localStorage.setItem(getUserStorageKey(currentUser.email, 'medications'), JSON.stringify(medications));
      localStorage.setItem('medbell_medications', JSON.stringify(medications));
    }
  }, [currentUser, medications]);

  useEffect(() => {
    localStorage.setItem('medbell_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey(currentUser.email, 'dose_logs'), JSON.stringify(doseLogs));
      localStorage.setItem('medbell_dose_logs', JSON.stringify(doseLogs));
    }
  }, [currentUser, doseLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey(currentUser.email, 'vitals'), JSON.stringify(vitalsLogs));
      localStorage.setItem('medbell_vitals', JSON.stringify(vitalsLogs));
    }
  }, [currentUser, vitalsLogs]);

  useEffect(() => {
    doseLogsRef.current = doseLogs;
  }, [doseLogs]);

  const triggerAlarm = useCallback((medication, scheduledTime) => {
    if (!medication || activeAlarmRef.current) return false;

    const alarmObj = {
      id: `${medication.id}-${scheduledTime}-${Date.now()}`,
      medication,
      scheduledTime,
      triggeredAt: new Date().toISOString()
    };
    activeAlarmRef.current = alarmObj;
    setActiveAlarm(alarmObj);

    if (settings.soundEnabled) {
      startAlarmLoop(settings.alarmSound, settings.customVoiceUrl);
    }

    if (settings.voiceEnabled && settings.alarmSound !== 'customVoice') {
      speakMedicineReminder(medication.name, medication.dosage, medication.notes);
    }

    if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🔔 MedBell Reminder: ${medication.name}`, {
        body: `Time to take ${medication.dosage} (${medication.foodTiming || 'No meal restriction'})`,
        icon: '/favicon.svg'
      });
    }
    return true;
  }, [settings]);

  // Alarm Engine - checking at startup and every five seconds while the app is open.
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHH}:${currentMM}`;
      const todayStr = getLocalDateKey(now);

      const readySnooze = snoozedAlarms.find(s => s.until <= Date.now());
      if (readySnooze && !activeAlarmRef.current) {
        const medication = readySnooze.medication || medications.find(m => m.id === readySnooze.medId);
        if (triggerAlarm(medication, readySnooze.time)) {
          setSnoozedAlarms(prev => prev.filter(s => s !== readySnooze));
        }
        return;
      }

      // Check scheduled doses
      for (const med of medications) {
        if (med.times && med.times.includes(currentTimeStr)) {
          const existingLog = doseLogsRef.current.find(
            log => log.medicationId === med.id && log.scheduledTime === currentTimeStr && log.date === todayStr
          );

          if (!existingLog && !activeAlarmRef.current) {
            const snoozed = snoozedAlarms.find(
              s => s.medId === med.id && s.time === currentTimeStr && s.until > Date.now()
            );

            if (!snoozed && triggerAlarm(med, currentTimeStr)) {
              break;
            }
          }
        }
      }
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, [medications, snoozedAlarms, triggerAlarm]);

  // Auth User Actions
  const registerAccount = ({ name, email, password }) => {
    const emailClean = (email || '').trim().toLowerCase();
    const existing = registeredUsers.find(u => u.email.toLowerCase() === emailClean);

    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please Sign In.' };
    }

    const newUser = {
      name: name || 'MedBell User',
      email: emailClean,
      password,
      avatar: '💊'
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    // New user logged into the page -> reset credentials/data to default 0
    setMedications([]);
    setDoseLogs([]);
    setVitalsLogs([]);

    const keyMeds = getUserStorageKey(emailClean, 'medications');
    const keyLogs = getUserStorageKey(emailClean, 'dose_logs');
    const keyVitals = getUserStorageKey(emailClean, 'vitals');
    localStorage.setItem(keyMeds, JSON.stringify([]));
    localStorage.setItem(keyLogs, JSON.stringify([]));
    localStorage.setItem(keyVitals, JSON.stringify([]));

    return { success: true, user: newUser };
  };

  const authenticateAccount = (email, password) => {
    const emailClean = (email || '').trim().toLowerCase();
    const user = registeredUsers.find(
      u => u.email.toLowerCase() === emailClean && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Account not found or password incorrect. Please check your credentials or click "Create Account" to sign up first.'
      };
    }

    setCurrentUser(user);

    // Switch data to user-scoped credentials (0 for new users)
    const userMeds = loadInitialUserMeds(user);
    const userLogs = loadInitialUserLogs(user);
    const userVitals = loadInitialUserVitals(user);

    setMedications(userMeds);
    setDoseLogs(userLogs);
    setVitalsLogs(userVitals);

    return { success: true, user };
  };

  const loginUser = (userData) => {
    setCurrentUser(userData);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('medbell_user');
  };

  // CRUD Actions
  const addMedication = (newMed) => {
    const created = {
      ...newMed,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMedications(prev => [created, ...prev]);
  };

  const updateMedication = (id, updatedFields) => {
    setMedications(prev => prev.map(m => (m.id === id ? { ...m, ...updatedFields } : m)));
  };

  const deleteMedication = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setDoseLogs(prev => prev.filter(log => log.medicationId !== id));
  };

  // Dose Actions
  const markDoseStatus = (medicationId, scheduledTime, status, dateOverride = null) => {
    const todayStr = dateOverride || getLocalDateKey();
    const med = medications.find(m => m.id === medicationId);
    const existingLog = doseLogsRef.current.find(l => (
      l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === todayStr
    ));
    const previousStatus = existingLog?.status || 'pending';
    const nextLogs = status === 'pending'
      ? doseLogsRef.current.filter(l => !(l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === todayStr))
      : [{
          id: existingLog?.id || `log-${Date.now()}`,
          medicationId,
          medName: med ? med.name : 'Medication',
          scheduledTime,
          takenAt: new Date().toISOString(),
          status,
          date: todayStr
        }, ...doseLogsRef.current.filter(l => !(l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === todayStr))];

    doseLogsRef.current = nextLogs;
    setDoseLogs(nextLogs);

    if (med && typeof med.stock === 'number' && previousStatus !== status) {
      const quantity = Number(med.quantity) || 1;
      const stockChange = status === 'taken' ? -quantity : previousStatus === 'taken' ? quantity : 0;
      if (stockChange) {
        setMedications(prev => prev.map(item => item.id === medicationId
          ? { ...item, stock: Math.max(0, item.stock + stockChange) }
          : item));
      }
    }
  };

  const snoozeAlarm = (minutes = 15) => {
    if (!activeAlarm) return;
    stopAlarmLoop();
    stopSpeech();
    const until = Date.now() + minutes * 60 * 1000;
    markDoseStatus(activeAlarm.medication.id, activeAlarm.scheduledTime, 'snoozed');
    setSnoozedAlarms(prev => [
      ...prev.filter(s => !(s.medId === activeAlarm.medication.id && s.time === activeAlarm.scheduledTime)),
      { medId: activeAlarm.medication.id, medication: activeAlarm.medication, time: activeAlarm.scheduledTime, until }
    ]);
    activeAlarmRef.current = null;
    setActiveAlarm(null);
  };

  const takeActiveAlarm = () => {
    if (!activeAlarm) return;
    stopAlarmLoop();
    stopSpeech();
    markDoseStatus(activeAlarm.medication.id, activeAlarm.scheduledTime, 'taken');
    activeAlarmRef.current = null;
    setActiveAlarm(null);
  };

  const dismissActiveAlarm = () => {
    if (!activeAlarm) return;
    stopAlarmLoop();
    stopSpeech();
    markDoseStatus(activeAlarm.medication.id, activeAlarm.scheduledTime, 'skipped');
    activeAlarmRef.current = null;
    setActiveAlarm(null);
  };

  // Vitals Actions
  const addVitalLog = (vitalData) => {
    const newEntry = {
      id: `v-${Date.now()}`,
      date: new Date().toISOString(),
      ...vitalData
    };
    setVitalsLogs(prev => [newEntry, ...prev]);
  };

  const updateVitalLog = (id, updatedData) => {
    setVitalsLogs(prev => prev.map(v => (v.id === id ? { ...v, ...updatedData } : v)));
  };

  const deleteVitalLog = (id) => {
    setVitalsLogs(prev => prev.filter(v => v.id !== id));
  };

  // Settings Action
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const importData = (backup) => {
    if (!backup || typeof backup !== 'object') throw new Error('The backup file is not valid.');
    if (backup.medications !== undefined && !Array.isArray(backup.medications)) throw new Error('Medication data is not valid.');
    if (backup.doseLogs !== undefined && !Array.isArray(backup.doseLogs)) throw new Error('Dose log data is not valid.');
    if (backup.vitalsLogs !== undefined && !Array.isArray(backup.vitalsLogs)) throw new Error('Vitals data is not valid.');
    if (backup.medications) setMedications(backup.medications);
    if (backup.doseLogs) setDoseLogs(backup.doseLogs);
    if (backup.vitalsLogs) setVitalsLogs(backup.vitalsLogs);
    if (backup.settings && typeof backup.settings === 'object') setSettings(prev => ({ ...prev, ...backup.settings }));
  };

  // Test Alarm manual trigger
  const testAlarmTrigger = (medId) => {
    const med = medications.find(m => m.id === medId) || medications[0];
    if (med) {
      const nowStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
      triggerAlarm(med, nowStr);
    }
  };

  // Reset user data back to 0
  const resetToDefaultZero = () => {
    setMedications([]);
    setDoseLogs([]);
    setVitalsLogs([]);
    if (currentUser) {
      const emailClean = currentUser.email.toLowerCase();
      localStorage.setItem(getUserStorageKey(emailClean, 'medications'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(emailClean, 'dose_logs'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(emailClean, 'vitals'), JSON.stringify([]));
    }
  };

  // Reset to default sample data
  const resetToSampleData = () => {
    setMedications(INITIAL_MEDICATIONS);
    setSettings(INITIAL_SETTINGS);
    setDoseLogs(INITIAL_DOSE_LOGS);
    setVitalsLogs(INITIAL_VITALS);
    ['medbell_registered_users', 'medbell_user', 'medbell_medications', 'medbell_settings', 'medbell_dose_logs', 'medbell_vitals'].forEach(key => localStorage.removeItem(key));
  };

  return (
    <MedicationContext.Provider
      value={{
        currentUser,
        loginUser,
        logoutUser,
        registerAccount,
        authenticateAccount,
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        doseLogs,
        markDoseStatus,
        vitalsLogs,
        addVitalLog,
        updateVitalLog,
        deleteVitalLog,
        settings,
        updateSettings,
        importData,
        activeAlarm,
        snoozeAlarm,
        takeActiveAlarm,
        dismissActiveAlarm,
        testAlarmTrigger,
        resetToSampleData,
        resetToDefaultZero
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};
