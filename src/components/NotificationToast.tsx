import React from 'react';
import { useBooking } from '../context/BookingContext.js';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useBooking();

  // Auto-dismiss top notification after 4 seconds
  React.useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dismissNotification(notifications[notifications.length - 1].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications, dismissNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isWarning = notif.type === 'warning';
        const isError = notif.type === 'error';

        const bg = isSuccess
          ? 'bg-slate-900 text-white border-slate-700'
          : isWarning
          ? 'bg-amber-950/90 text-amber-100 border-amber-700'
          : isError
          ? 'bg-rose-950/90 text-rose-100 border-rose-700'
          : 'bg-slate-900 text-slate-100 border-slate-700';

        const Icon = isSuccess
          ? CheckCircle2
          : isWarning
          ? AlertTriangle
          : isError
          ? XCircle
          : Info;

        const iconColor = isSuccess
          ? 'text-emerald-400'
          : isWarning
          ? 'text-amber-400'
          : isError
          ? 'text-rose-400'
          : 'text-sky-400';

        return (
          <div
            key={notif.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold tracking-tight">{notif.title}</h4>
                <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                  {notif.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
                {notif.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
