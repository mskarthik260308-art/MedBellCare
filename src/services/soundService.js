// Web Audio API Synthesizer & Custom Voice Audio Service

let audioCtx = null;
let currentVoiceAudio = null;
let alarmLoopTimer = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const SOUND_TYPES = {
  GENTLE: 'gentle',
  BEEP: 'beep',
  BELL: 'bell',
  SIREN: 'siren',
  CUSTOM_VOICE: 'customVoice'
};

export const stopCustomVoicePlayback = () => {
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio.currentTime = 0;
    currentVoiceAudio = null;
  }
};

export const stopAlarmLoop = () => {
  if (alarmLoopTimer) {
    clearInterval(alarmLoopTimer);
    alarmLoopTimer = null;
  }
  stopCustomVoicePlayback();
};

export const playCustomVoiceAudio = (dataUrl, loop = false) => {
  try {
    stopCustomVoicePlayback();
    if (!dataUrl) return false;
    currentVoiceAudio = new Audio(dataUrl);
    currentVoiceAudio.loop = loop;
    currentVoiceAudio.play().catch(err => console.warn('Custom voice playback failed:', err));
    return true;
  } catch (err) {
    console.warn('Error playing custom voice audio:', err);
    return false;
  }
};

export const playAlarmSound = (soundType = SOUND_TYPES.GENTLE, customVoiceDataUrl = null) => {
  try {
    if (soundType === SOUND_TYPES.CUSTOM_VOICE && customVoiceDataUrl) {
      const success = playCustomVoiceAudio(customVoiceDataUrl, false);
      if (success) return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (soundType) {
      case SOUND_TYPES.GENTLE:
      case SOUND_TYPES.CUSTOM_VOICE: {
        // Soft ascending arpeggio (C5 - E5 - G5 - C6)
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.65);
        });
        break;
      }

      case SOUND_TYPES.BEEP: {
        // Triple digital beep
        [0, 0.18, 0.36].forEach((startTime) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now + startTime);

          gain.gain.setValueAtTime(0.12, now + startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + startTime);
          osc.stop(now + startTime + 0.12);
        });
        break;
      }

      case SOUND_TYPES.BELL: {
        // Brass bell tone with overtones
        const baseFreq = 440;
        [1, 2.76, 5.4, 8.9].forEach((multiplier, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * multiplier, now);

          const vol = 0.2 / (i + 1);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 / (i + 1));

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.2);
        });
        break;
      }

      case SOUND_TYPES.SIREN: {
        // Energetic pulsing alarm
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        osc.frequency.linearRampToValueAtTime(600, now + 0.5);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

export const startAlarmLoop = (soundType = SOUND_TYPES.GENTLE, customVoiceDataUrl = null) => {
  stopAlarmLoop();

  if (soundType === SOUND_TYPES.CUSTOM_VOICE && customVoiceDataUrl) {
    playCustomVoiceAudio(customVoiceDataUrl, true);
  } else {
    playAlarmSound(soundType, customVoiceDataUrl);
    alarmLoopTimer = setInterval(() => {
      playAlarmSound(soundType, customVoiceDataUrl);
    }, 2200);
  }
};
