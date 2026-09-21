// Web Speech API Voice Readout Service

export const speakMedicineReminder = (medName, dosage, instructions = '') => {
  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const text = `Medicine Reminder. Time to take ${dosage || ''} of ${medName}. ${instructions ? 'Instruction: ' + instructions : ''}`;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95; // Slightly slower for clear speech
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    // Pick a clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
