import React, { useState } from 'react';

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
    if (!password) return setError('Password required');
    if (password !== confirm) return setError('Passwords do not match');
    onProtect(password, perms);
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password protection</p>
      <div className="space-y-2">
        <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Owner password" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600" />
        <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-green-500" />
          <span className="text-xs text-slate-300 font-semibold">Show password</span>
        </label>
      </div>
      <div className="space-y-2">
        {Object.entries({ print: 'Allow printing', copy: 'Allow copying', edit: 'Allow editing' }).map(([k, label]) => (
          <label key={k} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={(perms as Record<string, boolean>)[k]} onChange={(e) => setPerms((p) => ({ ...p, [k]: e.target.checked }))} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-green-500" />
            <span className="text-xs text-slate-300 font-semibold">{label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-[11px] text-red-400 font-bold">{error}</p>}
      <button type="button" onClick={submit} disabled={disabled} className="w-full py-3 bg-green-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Protect PDF</button>
    </div>
  );
};
