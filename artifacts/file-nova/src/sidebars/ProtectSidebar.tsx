import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface ProtectSidebarProps {
  onProtect: (password: string, permissions: { print: boolean; copy: boolean; edit: boolean }) => void;
  disabled?: boolean;
}

export const ProtectSidebar: React.FC<ProtectSidebarProps> = ({ onProtect, disabled }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [perms, setPerms] = useState({ print: true, copy: false, edit: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    setError('');
    if (!password) return setError('Password is required');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 4) return setError('Password must be at least 4 characters');
    onProtect(password, perms);
  };

  const permissionItems = [
    { key: 'print' as const, label: 'Allow printing' },
    { key: 'copy' as const, label: 'Allow copying' },
    { key: 'edit' as const, label: 'Allow editing' },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Lock className="h-3.5 w-3.5 text-green-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Password Protection</p>
          <p className="text-[10px] text-muted-foreground/80">Secure your PDF with a password</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Owner password"
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition" />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition cursor-pointer" tabIndex={-1}>
            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Permissions</span>
        </div>
        {permissionItems.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={perms[key]} onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
              className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">{label}</span>
          </label>
        ))}
      </div>

      {error && (
        <div className="fn-glass rounded-xl px-3 py-2 border border-destructive/30">
          <p className="text-[11px] text-destructive font-bold">{error}</p>
        </div>
      )}

      <button type="button" onClick={submit} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Protect PDF
      </button>
    </div>
  );
};
