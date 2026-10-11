import React from 'react';
import { ArrowLeft, Bell, Menu, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenBadge: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onOpenMenu,
  onOpenNotifications,
  onOpenBadge,
}) => {
  const { user, role, teamId } = useAuth();
  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-[#0A3370] via-[#0E4191] to-[#124FA6] text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-20 border-b border-blue-400/20 select-none">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all mr-1"
            title="Retour à l'accueil"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-white text-xs shadow-xs">
          A
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-wide leading-tight truncate">
            {title || 'ASAFA'}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
            <span className="uppercase font-bold tracking-wider">{teamId}</span>
            <span>•</span>
            <span className="capitalize">{role}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenBadge}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all"
          title="Mon Badge & QR"
        >
          <QrCode className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={onOpenNotifications}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={onOpenMenu}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all"
          title="Menu Paramètres"
        >
          <Menu className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};
