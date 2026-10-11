import React from 'react';
import { Home, Music, MessageSquare, Calendar, User } from 'lucide-react';

export type NavTab = 'dashboard' | 'chants' | 'resadresaka' | 'programme' | 'galerie' | 'finances' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenMenu }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Accueil', icon: Home, action: () => onTabChange('dashboard') },
    { id: 'chants' as NavTab, label: 'Chants', icon: Music, action: () => onTabChange('chants') },
    { id: 'resadresaka' as NavTab, label: 'Chat', icon: MessageSquare, action: () => onTabChange('resadresaka') },
    { id: 'programme' as NavTab, label: 'Programme', icon: Calendar, action: () => onTabChange('programme') },
    { id: 'settings' as NavTab, label: 'Profil', icon: User, action: onOpenMenu },
  ];

  return (
    <nav className="bg-white rounded-t-[32px] sm:rounded-[32px] border border-slate-100/80 px-3 py-2 flex items-center justify-around sticky bottom-0 z-30 select-none shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className="flex flex-col items-center justify-center cursor-pointer min-w-[58px] transition-all group"
          >
            <div
              className={`w-14 h-8 rounded-2xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#DCE8FC] text-[#163F8A]'
                  : 'text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight tracking-tight mt-1 font-medium ${
                isActive ? 'text-[#163F8A] font-bold' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
