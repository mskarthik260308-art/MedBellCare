import React, { useState } from 'react';
import { LogIn, UserPlus, User, Mail, Lock, X, AlertCircle, Sparkles } from 'lucide-react';
import { useMedication } from '../../context/medicationStore';

export const LoginModal = ({ isOpen, onClose, setActiveTab }) => {
  const { authenticateAccount, registerAccount } = useMedication();

  const [isRegistering, setIsRegistering] = useState(false); // false = Sign In, true = Create Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('user@medbell.com');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleModeSwitch = (registering) => {
    setIsRegistering(registering);
    setErrorMessage('');
    if (registering) {
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('user@medbell.com');
      setPassword('password123');
    }
  };

  const handleQuickDemoFill = () => {
    setIsRegistering(false);
    setErrorMessage('');
    setEmail('user@medbell.com');
    setPassword('password123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isRegistering) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your Full Name to create an account.');
        return;
      }
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter a valid email and password.');
        return;
      }

      const res = registerAccount({
        name: fullName.trim(),
        email: email.trim(),
        password: password.trim()
      });

      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }

      if (setActiveTab) setActiveTab('today');
      onClose();

    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter both Email and Password to sign in.');
        return;
      }

      const res = authenticateAccount(email.trim(), password.trim());

      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }

      if (setActiveTab) setActiveTab('today');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald">
              {isRegistering ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">
                {isRegistering ? 'Create MedBell Account' : 'Sign In to MedBell'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegistering ? 'Register a new account to manage medications' : 'Access your registered account'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Mode Switcher (Sign In vs Create Account) */}
        <div className="flex items-center justify-between my-5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => handleModeSwitch(false)}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              !isRegistering
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch(true)}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              isRegistering
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Quick Demo Fill Button (In Sign In mode) */}
        {!isRegistering && (
          <div className="mb-4 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Demo Account:</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Fill Demo</span>
            </button>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Input (Required ONLY when registering) */}
          {isRegistering && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="user@medbell.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 text-slate-100 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            {isRegistering ? 'Create Account & Sign In' : 'Sign In Now'}
          </button>
        </form>
      </div>
    </div>
  );
};
