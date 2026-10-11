import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  QrCode,
  ShieldCheck,
  Globe,
  Coins,
  FileText,
  BookOpen,
  Info,
  LogOut,
  Image as ImageIcon,
  Clock,
  ChevronRight,
  Shield,
  Edit2,
  Camera,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { SettingsDoc } from '../types.ts';
import { NavTab } from './BottomNav.tsx';
import { EditProfileModal } from './EditProfileModal.tsx';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBadge: () => void;
  onOpenVerify: () => void;
  onOpenDiagnostics: () => void;
  onNavigate: (tab: NavTab) => void;
  pendingCount?: number;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenBadge,
  onOpenVerify,
  onOpenDiagnostics,
  onNavigate,
  pendingCount = 0,
}) => {
  const { user, role, teamId, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [docView, setDocView] = useState<'none' | 'regulations' | 'history' | 'about'>('none');
  const [settings, setSettings] = useState<SettingsDoc | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  const fetchSettingsDoc = async (type: 'regulations' | 'history' | 'about') => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setDocView(type);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveDoc = async (type: 'regulations' | 'history') => {
    setIsSaving(true);
    try {
      const updated = await api.updateSettings({ [type]: editContent });
      setSettings(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-250 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#0A3370] via-[#0E4191] to-[#124FA6] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">Paramètres & Profil</h3>
              <p className="text-[10px] text-blue-200">Fikirakirana sy Kaonty</p>
            </div>
          </div>
          <button
            onClick={() => {
              setDocView('none');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {docView === 'none' ? (
            <>
              {/* 1. Profile of Logged Person */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user?.name || 'User'}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0D4194] shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-800 truncate">
                      {user?.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    {user?.phone && (
                      <p className="text-[10px] text-slate-400 font-mono">{user.phone}</p>
                    )}
                  </div>
                </div>

                {/* Badges Bar */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                  <div className="bg-blue-50 text-[#0D4194] font-bold px-2.5 py-1 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[9px]">Équipe:</span>
                    <span className="uppercase font-black">{user?.teamId}</span>
                  </div>
                  <div className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[9px]">Rôle:</span>
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <div className="bg-slate-100 text-slate-700 font-mono font-bold px-2.5 py-1 rounded-xl col-span-2 flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[9px] font-sans">ID Membre:</span>
                    <span className="text-[#0D4194]">{user?.memberId || 'Actif'}</span>
                  </div>
                </div>

                {/* Edit Profile Button (Anyone can edit name and picture) */}
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full bg-slate-50 hover:bg-blue-50 text-[#0D4194] border border-blue-200 py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0D4194]" />
                  <span>Hanova anarana sy sary (Modifier profil)</span>
                </button>
              </div>

              {/* 2. QR Code Badge & Scanner Buttons */}
              <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenBadge();
                  }}
                  className="w-full bg-gradient-to-r from-[#0D4194] to-[#1565C0] hover:from-[#0A3370] hover:to-[#0D4194] text-white py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between transition-all shadow-xs active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">Mon Badge Digital & QR Code</div>
                      <div className="text-[10px] text-blue-200 font-normal">Karatra maha-mpikambana</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-200" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenVerify();
                  }}
                  className="w-full bg-[#EBF2FC] hover:bg-blue-100/70 text-[#0D4194] py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0D4194]" />
                    <span>Vérifier un QR Code de Membre</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              {/* 3. Language Selector */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Globe className="w-4 h-4 text-[#0D4194]" />
                  <span>Fiteny ampiasaina (Langue)</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      language === 'fr'
                        ? 'bg-[#0D4194] text-white border-[#0D4194] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage('mg')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      language === 'mg'
                        ? 'bg-[#0D4194] text-white border-[#0D4194] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Malagasy
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      language === 'en'
                        ? 'bg-[#0D4194] text-white border-[#0D4194] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* 4. Quick Modules & Shortcuts */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('finances');
                  }}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>Fitantanam-bola (Finances)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('galerie');
                  }}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                    <span>Tahiry Sary (Galerie des 4 Équipes)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenDiagnostics();
                  }}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-all text-xs font-bold text-emerald-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Test & Diagnostics</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full">
                    14 Tests
                  </span>
                </button>
              </div>

              {/* 5. Information, Regulations, History */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                <button
                  onClick={() => fetchSettingsDoc('regulations')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#0D4194]" />
                    <span>Fitsipika Anatiny (Règlement Intérieur)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => fetchSettingsDoc('history')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#0D4194]" />
                    <span>Tantaran'ny ASAFA (Histoire)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => fetchSettingsDoc('about')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-[#0D4194]" />
                    <span>Momba ny ASAFA (À propos)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* 6. Logout Button */}
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Hivoaka ny kaonty (Se déconnecter)</span>
              </button>
            </>
          ) : (
            /* Sub-view: Regulations, History, or About */
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setDocView('none')}
                  className="text-xs font-bold text-[#0D4194] hover:underline"
                >
                  ← Miverina amin'ny Paramètre
                </button>
                {role === 'admin' && !isEditing && docView !== 'about' && (
                  <button
                    onClick={() => {
                      setEditContent(
                        docView === 'regulations'
                          ? settings?.regulations || ''
                          : settings?.history || ''
                      );
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D4194] bg-blue-50 px-2.5 py-1 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Hanova</span>
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex-1 overflow-y-auto">
                {isEditing && (docView === 'regulations' || docView === 'history') ? (
                  <div className="space-y-3">
                    <textarea
                      rows={14}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs"
                      >
                        Aoka ihany
                      </button>
                      <button
                        onClick={() => handleSaveDoc(docView as 'regulations' | 'history')}
                        disabled={isSaving}
                        className="flex-1 bg-[#0D4194] text-white font-bold py-2 rounded-xl text-xs"
                      >
                        {isSaving ? 'Eo am-pitehirizana...' : 'Tehirizo'}
                      </button>
                    </div>
                  </div>
                ) : docView === 'regulations' ? (
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {settings?.regulations}
                  </div>
                ) : docView === 'history' ? (
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {settings?.history}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-slate-700">
                    <h4 className="font-extrabold text-sm text-[#0D4194]">ASAFA MADAGASCAR</h4>
                    <p className="text-slate-600">{settings?.about.description}</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                      <div><strong>Adiresy:</strong> {settings?.about.address}</div>
                      <div><strong>Mailaka:</strong> {settings?.about.contactEmail}</div>
                      <div><strong>Finday:</strong> {settings?.about.contactPhone}</div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Version 1.0.0 (Officielle)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
