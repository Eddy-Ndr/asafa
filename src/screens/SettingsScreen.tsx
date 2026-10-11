import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sun,
  Moon,
  FileText,
  BookOpen,
  Info,
  LogOut,
  Shield,
  QrCode,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { SettingsDoc, Language } from '../types.ts';

interface SettingsScreenProps {
  onOpenBadge: () => void;
  onOpenVerify: () => void;
  onOpenDiagnostics: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenBadge,
  onOpenVerify,
  onOpenDiagnostics,
}) => {
  const { user, role, teamId, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [settings, setSettings] = useState<SettingsDoc | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'regulations' | 'history' | 'about'>('main');

  // Edit regulations / history (Admin only)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleStartEdit = (type: 'regulations' | 'history') => {
    if (!settings) return;
    setEditContent(type === 'regulations' ? settings.regulations : settings.history);
    setIsEditing(true);
  };

  const handleSaveEdit = async (type: 'regulations' | 'history') => {
    setIsSaving(true);
    try {
      const updated = await api.updateSettings({ [type]: editContent });
      setSettings(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Error updating settings content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4 flex-1 flex flex-col overflow-y-auto">
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
          <span>{t('settings_title')}</span>
        </h2>
        <p className="text-[11px] text-slate-500">
          Fiteny, fitsipika anatiny, tantara sy mombamomba ny ASAFA
        </p>
      </div>

      {activeView === 'main' ? (
        <div className="space-y-3">
          {/* User Profile Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name || 'User'}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
              />
              <div>
                <h3 className="font-extrabold text-xs text-slate-800">{user?.name}</h3>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] uppercase font-black bg-blue-100 text-[#1565C0] px-1.5 py-0.2 rounded">
                    Équipe {user?.teamId}
                  </span>
                  <span className="text-[9px] uppercase font-black bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenBadge}
              className="p-2 rounded-xl bg-blue-50 text-[#1565C0] hover:bg-blue-100 transition-all"
              title={t('my_badge')}
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Globe className="w-4 h-4 text-[#1565C0]" />
              <span>{t('language')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  language === 'fr'
                    ? 'bg-[#1565C0] text-white border-[#1565C0] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('mg')}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  language === 'mg'
                    ? 'bg-[#1565C0] text-white border-[#1565C0] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Malagasy
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  language === 'en'
                    ? 'bg-[#1565C0] text-white border-[#1565C0] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            <button
              onClick={() => setActiveView('regulations')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#1565C0]" />
                <span>{t('regulations')}</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#1565C0]" />
                <span>{t('history')}</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveView('about')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-[#1565C0]" />
                <span>{t('about_asafa')}</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={onOpenDiagnostics}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all text-xs font-bold text-emerald-700"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>{t('diagnostics')}</span>
              </div>
              <span className="text-emerald-500 font-mono text-[11px]">Auto-Test</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>{t('logout')}</span>
          </button>
        </div>
      ) : activeView === 'regulations' ? (
        /* Regulations View */
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveView('main');
                setIsEditing(false);
              }}
              className="text-xs font-bold text-[#1565C0] hover:underline"
            >
              ← Miverina
            </button>
            {role === 'admin' && !isEditing && (
              <button
                onClick={() => handleStartEdit('regulations')}
                className="flex items-center gap-1 text-xs font-bold text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Hanova (Admin)</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex-1 overflow-y-auto">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  rows={16}
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
                    onClick={() => handleSaveEdit('regulations')}
                    disabled={isSaving}
                    className="flex-1 bg-[#1565C0] text-white font-bold py-2 rounded-xl text-xs"
                  >
                    {isSaving ? 'Eo am-pitehirizana...' : 'Tehirizo'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                {settings?.regulations}
              </div>
            )}
          </div>
        </div>
      ) : activeView === 'history' ? (
        /* History View */
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveView('main');
                setIsEditing(false);
              }}
              className="text-xs font-bold text-[#1565C0] hover:underline"
            >
              ← Miverina
            </button>
            {role === 'admin' && !isEditing && (
              <button
                onClick={() => handleStartEdit('history')}
                className="flex items-center gap-1 text-xs font-bold text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Hanova (Admin)</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex-1 overflow-y-auto">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  rows={16}
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
                    onClick={() => handleSaveEdit('history')}
                    disabled={isSaving}
                    className="flex-1 bg-[#1565C0] text-white font-bold py-2 rounded-xl text-xs"
                  >
                    {isSaving ? 'Eo am-pitehirizana...' : 'Tehirizo'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                {settings?.history}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* About View */
        <div className="space-y-3 flex-1 flex flex-col">
          <button
            onClick={() => setActiveView('main')}
            className="text-xs font-bold text-[#1565C0] hover:underline"
          >
            ← Miverina
          </button>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#1565C0] text-white flex items-center justify-center font-black text-3xl mx-auto shadow-md">
                A
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mt-2">ASAFA</h3>
              <p className="text-xs text-slate-500 font-medium">
                SOALIA • MPIANTSA • TOMIMA • ASAFA
              </p>
              <div className="inline-block bg-blue-100 text-[#1565C0] text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1 uppercase">
                Manga sy Fotsy • Bleu et Blanc
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <p>
                <strong>Tanjona :</strong> Fikambanana kristiana sy ara-kolontsaina mampiray ireo ekipa efatra lehibe ho fiderana an'Andriamanitra sy fifampaherezana.
              </p>
              <p>
                <strong>Adiresy Foibe :</strong> {settings?.about.address}
              </p>
              <p>
                <strong>Mailaka :</strong> {settings?.about.contactEmail}
              </p>
              <p>
                <strong>Finday :</strong> {settings?.about.contactPhone}
              </p>
              <p className="text-[11px] text-slate-400 font-mono pt-2">
                Version 1.0.0 (Full-Stack Android Release)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
