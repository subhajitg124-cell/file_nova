import React from 'react';
import { Clock, Shield, Lock, Zap, AlertTriangle, FileText, Database, Eye, Trash2 } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';
import { motion } from 'framer-motion';

export const TrustIndicators: React.FC = () => {
  const { files, ttlRemaining, downloadUrl } = useFileStore();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const expiringSoon = ttlRemaining !== null && ttlRemaining < 120;

  const trustFeatures = [
    {
      icon: Shield,
      label: 'GDPR Compliant',
      description: 'Your data stays private',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Lock,
      label: 'Zero Storage',
      description: 'No server persistence',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      label: 'Auto Delete',
      description: `${ttlRemaining ? `Expires in ${formatTime(ttlRemaining)}` : '30 min expiry'}`,
      color: expiringSoon ? 'text-amber-400' : 'text-violet-400',
      bgColor: expiringSoon ? 'bg-amber-500/10' : 'bg-violet-500/10',
      pulse: expiringSoon,
    },
    {
      icon: Zap,
      label: 'Client-Side',
      description: 'Instant processing',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-2">
      {trustFeatures.map((feature) => (
        <div
          key={feature.label}
          className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border transition-all ${feature.bgColor} ${feature.color} border-current/20`}
        >
          <feature.icon className={`h-3.5 w-3.5 ${feature.pulse ? 'animate-pulse' : ''}`} />
          <span className="font-medium">{feature.label}</span>
          {feature.pulse && (
            <span className="text-[10px] opacity-70">{feature.description}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export const PrivacySection: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-card border border-border rounded-xl">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Eye className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Privacy-First Processing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All files are processed in your browser. We never store, log, or track your documents.
            Temporary processing links expire automatically after 30 minutes.
          </p>
          <div className="flex items-center gap-4 pt-1.5 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-400">
              <Shield className="h-3 w-3" />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Trash2 className="h-3 w-3" />
              <span>Auto-delete in 30 min</span>
            </div>
            <div className="flex items-center gap-1 text-violet-400">
              <Database className="h-3 w-3" />
              <span>No server storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecurityBadges: React.FC = () => {
  const badges = [
    { label: 'SOC 2', icon: Shield, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'GDPR', icon: Lock, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Client-Side', icon: Zap, color: 'bg-violet-500/10 text-violet-400' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color} border border-current/20`}
        >
          <badge.icon className="h-3 w-3" />
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export default TrustIndicators;