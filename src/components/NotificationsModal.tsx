import React from 'react';
import { X, Bell, Calendar, BookOpen, Clock, CheckCircle } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProgramme: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProgramme,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Répétition générale samedi',
      description: 'Rendez-vous à 15h au temple central. Soyez ponctuels.',
      time: 'Il y a 2 heures',
      type: 'rehearsal',
    },
    {
      id: '2',
      title: 'Culte Dominical — Dimanche 9h00',
      description: '12 chants au programme avec les 4 équipes.',
      time: 'Il y a 1 jour',
      type: 'event',
    },
    {
      id: '3',
      title: 'Fivoriambe Lehibe ASAFA 2026',
      description: 'Fandaharam-potoana ofisialy voaomana ao amin\'ny Programme.',
      time: 'Il y a 3 jours',
      type: 'programme',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200">
        <div className="bg-[#0E4191] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-sm">Fampandrenesana (Notifications)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto bg-slate-50">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                onClose();
                onNavigateToProgramme();
              }}
              className="bg-white p-3 rounded-2xl border border-slate-200/80 hover:border-blue-300 cursor-pointer shadow-xs transition-all space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-blue-700 uppercase">Vaovao</span>
                <span>{n.time}</span>
              </div>
              <h4 className="font-extrabold text-xs text-slate-800">{n.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{n.description}</p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
