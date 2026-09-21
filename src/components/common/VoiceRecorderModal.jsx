import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Check, Trash2, X } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';

export const VoiceRecorderModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useMedication();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(settings.customVoiceUrl || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Store a data URL so the recording remains available after a reload.
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
            clearInterval(timerRef.current);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setErrorMsg('Microphone access denied or unavailable. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePlayPreview = () => {
    if (!audioUrl) return;
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioPreviewRef.current = audio;

    setIsPlayingPreview(true);
    audio.play().catch(() => setIsPlayingPreview(false));
    audio.onended = () => setIsPlayingPreview(false);
  };

  const handleSaveCustomVoice = () => {
    if (audioUrl) {
      updateSettings({
        customVoiceUrl: audioUrl,
        alarmSound: 'customVoice'
      });
      onClose();
    }
  };

  const handleClearRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    updateSettings({ customVoiceUrl: null, alarmSound: 'gentle' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Custom Voice Alarm</h2>
              <p className="text-xs text-slate-400">Record a personal voice message for medicine reminders</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Central Recording Console */}
        <div className="my-8 flex flex-col items-center justify-center text-center">
          
          {/* Pulsing Mic Circle */}
          <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
            isRecording
              ? 'bg-rose-500/20 border-rose-500 shadow-2xl shadow-rose-500/40 animate-pulse scale-105'
              : audioUrl
              ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 border-slate-700'
          }`}>
            <Mic className={`w-12 h-12 ${
              isRecording ? 'text-rose-400 animate-bounce' : audioUrl ? 'text-emerald-400' : 'text-slate-400'
            }`} />

            {isRecording && (
              <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-ping">
                REC
              </span>
            )}
          </div>

          {/* Recording Timer */}
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono text-white tracking-wider">
              00:{String(recordingTime).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {isRecording ? 'Recording voice (Max 30s)...' : audioUrl ? 'Voice Recording Ready' : 'Tap record to start'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-extrabold text-sm shadow-lg shadow-rose-500/20 transition transform hover:-translate-y-0.5"
            >
              <Mic className="w-5 h-5" />
              <span>{audioUrl ? 'Re-record Voice Message' : 'Start Voice Recording'}</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Stop Recording</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePlayPreview}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isPlayingPreview ? 'Playing...' : 'Test Playback'}</span>
              </button>

              <button
                onClick={handleSaveCustomVoice}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Set as Alarm Tone</span>
              </button>
            </div>
          )}

          {audioUrl && !isRecording && (
            <button
              onClick={handleClearRecording}
              className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs text-slate-500 hover:text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Custom Voice Recording</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
