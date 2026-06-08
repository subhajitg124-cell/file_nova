import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface UnlockSidebarProps {
  onUnlock: (password: string) => void;
  disabled?: boolean;
}

export const UnlockSidebar: React.FC<UnlockSidebarProps> = ({ onUnlock, disabled }) => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    setShake(false);
    onUnlock(password);
  };

  return (
    <motion.div animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : {}} className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unlock PDF</p>
      <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter current password" className={`w-full rounded-xl border px-3 py-2.5 text-sm text-white placeholder:text-slate-600 ${shake ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-950'}`} />
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500" />
        <span className="text-xs text-slate-300 font-semibold">Show password</span>
      </label>
      <button type="button" onClick={submit} disabled={disabled} className="w-full py-3 bg-cyan-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Remove protection</button>
    </motion.div>
  );
};
