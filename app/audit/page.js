'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Activity, Clock3, Shield } from 'lucide-react';
import { listAuditEvents } from '@/lib/api';

export default function AuditPage() {
  const { state } = useApp();
  const { user } = state;
  const [platformAudit, setPlatformAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    listAuditEvents(user.token)
      .then(data => {
        setPlatformAudit(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user?.token]);

  if (loading) return <p className="text-sm text-h-text-muted">Loading audit trail...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4.5 h-4.5 text-h-blue" />
          <h3 className="section-title mb-0">Full platform audit trail</h3>
          <span className="ml-auto text-xs text-h-text-muted">{platformAudit.length} events</span>
        </div>
        <div className="space-y-1">
          {platformAudit.length === 0 && <p className="text-sm text-h-text-muted">No audit events yet.</p>}
          {platformAudit.map(a => (
            <div key={a.id} className="flex items-center justify-between py-3.5 border-b border-h-border last:border-0 hover:bg-h-bg px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-h-text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-h-text truncate">{a.actor_name || 'Unknown'}</p>
                  <p className="text-xs text-h-text-muted truncate">{a.action}</p>
                  {a.target && <p className="text-xs text-h-text-light truncate">{a.target}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-h-text-light flex-shrink-0 ml-3">
                <Clock3 className="w-3 h-3" />{new Date(a.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
