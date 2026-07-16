import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

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
    if (!password.trim()) {
      setShake(true);
      return;
    }
    onUnlock(password);
  };

  return (
    <motion.div animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : {}} className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Unlock className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Unlock PDF</p>
          <p className="text-[10px] text-muted-foreground/80">Remove password protection</p>
        </div>
      </div>

      <div className="fn-glass rounded-xl p-3 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground">Enter the current password to remove protection from this PDF.</p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter current password"
            className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition ${
              shake ? 'border-destructive bg-destructive/10' : 'border-border bg-muted/30 focus:border-primary/40'
            }`} />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition cursor-pointer" tabIndex={-1}>
            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <button type="button" onClick={submit} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Remove Protection
      </button>
    </motion.div>
  );
};
