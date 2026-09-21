// Pre-populated initial mock data for Dr. Pill Clone
import { getLocalDateKey } from '../utils/date';

export const INITIAL_MEDICATIONS = [
  {
    id: 'med-1',
    name: 'Amoxicillin',
    category: 'Antibiotic',
    dosage: '500mg',
    unit: 'capsule',
    quantity: 1,
    shape: 'capsule',
    color: 'emerald',
    stripeColor: 'cyan',
    times: ['08:00', '20:00'],
    timeSlot: 'Morning & Night',
    foodTiming: 'After food',
    stock: 18,
    refillThreshold: 6,
    doctor: 'Dr. Sarah Jenkins (Cardiology)',
    rxNumber: 'RX-99201',
    notes: 'Take full course as prescribed with plenty of water.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    category: 'Blood Pressure',
    dosage: '10mg',
    unit: 'tablet',
    quantity: 1,
    shape: 'tablet',
    color: 'cyan',
    stripeColor: 'white',
    times: ['08:00'],
    timeSlot: 'Morning',
    foodTiming: 'Before food',
    stock: 24,
    refillThreshold: 7,
    doctor: 'Dr. Michael Vance (General)',
    rxNumber: 'RX-44102',
    notes: 'Monitor blood pressure daily in the morning.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-3',
    name: 'Metformin',
    category: 'Diabetes',
    dosage: '850mg',
    unit: 'tablet',
    quantity: 1,
    shape: 'oval',
    color: 'amber',
    stripeColor: 'orange',
    times: ['13:00', '20:00'],
    timeSlot: 'Afternoon & Night',
    foodTiming: 'With food',
    stock: 4, // Low stock trigger test!
    refillThreshold: 8,
    doctor: 'Dr. Elena Rostova (Endocrinology)',
    rxNumber: 'RX-10293',
    notes: 'Take right after meals to avoid stomach upset.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 + K2',
    category: 'Supplement',
    dosage: '5000 IU',
    unit: 'softgel',
    quantity: 1,
    shape: 'oval',
    color: 'amber',
    stripeColor: 'yellow',
    times: ['08:00'],
    timeSlot: 'Morning',
    foodTiming: 'With food',
    stock: 45,
    refillThreshold: 10,
    doctor: 'Wellness Plan',
    rxNumber: 'OTC-552',
    notes: 'Take with healthy fats like avocado or olive oil.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-5',
    name: 'Salbutamol Inhaler',
    category: 'Asthma / Respiratory',
    dosage: '100mcg',
    unit: 'puffs',
    quantity: 2,
    shape: 'inhaler',
    color: 'purple',
    stripeColor: 'pink',
    times: ['14:00'],
    timeSlot: 'Afternoon (As Needed)',
    foodTiming: 'Anytime',
    stock: 120,
    refillThreshold: 20,
    doctor: 'Dr. Robert Miller (Pulmonology)',
    rxNumber: 'RX-88192',
    notes: 'Rinse mouth with water after use.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS = {
  alarmSound: 'gentle',
  soundEnabled: true,
  voiceEnabled: true,
  theme: 'dark',
  snoozeDurationMinutes: 15,
  browserNotifications: true
};

export const INITIAL_VITALS = [
  { id: 'v-1', date: new Date(Date.now() - 86400000 * 2).toISOString(), systolic: 120, diastolic: 80, pulse: 72, glucose: 95, weight: 74.5, notes: 'Felt great morning walk' },
  { id: 'v-2', date: new Date(Date.now() - 86400000).toISOString(), systolic: 124, diastolic: 82, pulse: 75, glucose: 102, weight: 74.4, notes: 'Slight headache after lunch' },
  { id: 'v-3', date: new Date().toISOString(), systolic: 118, diastolic: 78, pulse: 68, glucose: 92, weight: 74.2, notes: 'Optimal pressure' }
];

export const INITIAL_DOSE_LOGS = [
  {
    id: 'log-1',
    medicationId: 'med-1',
    medName: 'Amoxicillin',
    scheduledTime: '08:00',
    takenAt: new Date(new Date().setHours(8, 5, 0, 0)).toISOString(),
    status: 'taken',
    date: getLocalDateKey()
  },
  {
    id: 'log-2',
    medicationId: 'med-2',
    medName: 'Lisinopril',
    scheduledTime: '08:00',
    takenAt: new Date(new Date().setHours(8, 2, 0, 0)).toISOString(),
    status: 'taken',
    date: getLocalDateKey()
  }
];
