// A calendar day belongs to the user's local time zone. ISO strings are UTC
// and therefore unsuitable as keys for daily medication schedules.
export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const dateKeyToLocalDate = (dateKey) => {
  if (typeof dateKey !== 'string') return new Date();
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isMedicationActiveOnDate = (medication, targetDateStr = getLocalDateKey()) => {
  if (!medication) return false;
  if (medication.startDate && targetDateStr < medication.startDate) {
    return false;
  }
  if (medication.endDate && targetDateStr > medication.endDate) {
    return false;
  }
  return true;
};
