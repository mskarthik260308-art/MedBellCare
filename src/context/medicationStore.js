import { createContext, useContext } from 'react';

export const MedicationContext = createContext(null);

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};
