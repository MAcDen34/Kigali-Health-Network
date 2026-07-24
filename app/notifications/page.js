'use client';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import { Bell, Pill, ShieldOff, CheckCircle2, AlertTriangle, Activity, BellOff } from 'lucide-react';

const TYPE_CONFIG = {
  prescription: { icon: Pill,          tone:'blue',   bg:'bg-h-blue-light text-h-blue' },
  reminder:     { icon: Pill,          tone:'teal',   bg:'bg-h-teal-light text-h-teal' },
  consent:      { icon: ShieldOff,     tone:'amber',  bg:'bg-h-amber-light text-h-amber' },
  claim:        { icon: CheckCircle2,  tone:'green',  bg:'bg-h-green-light text-h-green' },
  alert:        { icon: AlertTriangle, tone:'red',    bg:'bg-h-red-light text-h-red' },
  system:       { icon: Activity,      tone:'purple', bg:'bg-h-purple-light text-h-purple' },
};

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const notifications = state.notifications.filter(n => n.role === user?.role);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="bg-h-red text-white text-xs font-bold rounded-full px-2 py-0.5">{unread} unread</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => dispatch({ type:'MARK_ALL_READ', payload: user?.role })}
            className="text-xs font-semibold text-h-blue hover:text-h-blue-dark transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <BellOff className="w-10 h-10 text-h-text-light mx-auto mb-3" />
          <p className="text-sm text-h-text-muted">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={n.id}
                onClick={() => dispatch({ type:'MARK_READ', payload:n.id })}
                className={`card p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${!n.read ? 'border-h-blue/25 bg-h-blue-light/20' : ''}`}>
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold text-h-text ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-h-text-light">{n.time}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-h-blue flex-shrink-0" />}
                      </div>
                    </div>
                    <p className="text-xs text-h-text-muted leading-relaxed">{n.body}</p>
                    <Badge tone={cfg.tone} className="mt-2">{n.type}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
