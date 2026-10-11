import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { TeamId } from '../types.ts';
import { AsafaLogo } from '../components/AsafaLogo.tsx';
import {
  Mail,
  Key,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  LogIn,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login method tab: 'email' | 'memberId' (as in the screenshot!)
  const [loginMethod, setLoginMethod] = useState<'email' | 'memberId'>('email');

  // Form states
  const [identifier, setIdentifier] = useState<string>('admin@asafa.mg');
  const [password, setPassword] = useState<string>('AdminPassword123!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register form fields
  const [name, setName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [teamId, setTeamId] = useState<TeamId>('soalia');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showQuickAccounts, setShowQuickAccounts] = useState<boolean>(false);

  // Handle Login or Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(identifier.trim(), password);
      } else {
        await register({
          name: name.trim(),
          email: regEmail.trim(),
          password,
          phone: phone.trim(),
          teamId,
        });
        setSuccessMsg(
          'Fangatahana voaray soa aman-tsara ! Miandry fankatoavan\'ny Admin mba hahazoana ny Karatra sy QR Code. (Demande d\'adhésion soumise avec succès ! En attente d\'approbation).'
        );
        setMode('login');
        setIdentifier(regEmail.trim());
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectLoginMethod = (method: 'email' | 'memberId') => {
    setLoginMethod(method);
    setError(null);
    if (method === 'email') {
      if (identifier.startsWith('ASAFA-')) {
        setIdentifier('admin@asafa.mg');
      }
    } else {
      if (!identifier.startsWith('ASAFA-')) {
        setIdentifier('ASAFA-ADMIN-001');
      }
    }
  };

  const setQuickAccount = (loginId: string, pass: string) => {
    setIdentifier(loginId);
    setPassword(pass);
    setError(null);
    setSuccessMsg(null);
    if (loginId.includes('@')) {
      setLoginMethod('email');
    } else {
      setLoginMethod('memberId');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-full">
      {/* 1. Deep Blue Curved Header (Exactly as in screenshot) */}
      <div className="bg-gradient-to-b from-[#0A3370] via-[#0E4191] to-[#124FA6] text-white pt-8 pb-14 px-6 rounded-b-[44px] shadow-lg flex flex-col items-center text-center relative select-none">
        {/* Emblem / Crest */}
        <AsafaLogo className="w-24 h-24 mb-3" />

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-[26px] font-bold tracking-wider text-white leading-tight drop-shadow-sm">
          ASAFA TOLIARA –
        </h1>
        <h2 className="font-serif text-xl sm:text-[22px] font-bold tracking-widest text-white leading-tight">
          MPIKAMBANA
        </h2>

        {/* Subtitle */}
        <p className="italic text-xs text-blue-200 mt-1 font-serif">
          Fiangonana Ara-pilazantsara eto Madagasikara
        </p>

        {/* Welcoming Greeting */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-4 drop-shadow-xs">
          Faly mandray anao !
        </h3>
      </div>

      {/* 2. Floating Tabs Switcher Overlapping Header Bottom (As in screenshot) */}
      <div className="-mt-7 px-6 flex justify-center z-20">
        {mode === 'login' ? (
          <div className="bg-white rounded-full p-1.5 shadow-xl border border-slate-100 flex items-center gap-1 w-full max-w-xs">
            <button
              type="button"
              onClick={() => handleSelectLoginMethod('email')}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email'
                  ? 'bg-[#0E4191] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectLoginMethod('memberId')}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'memberId'
                  ? 'bg-[#0E4191] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Code Membre</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-full p-1.5 shadow-xl border border-slate-100 flex items-center gap-1 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[#0E4191] text-white shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>S'inscrire</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Form Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-start max-w-md w-full mx-auto space-y-4">
        {/* Error or Success notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'login' ? (
              <>
                {/* Field 1: Email or Member Code */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    {loginMethod === 'email' ? 'ADRESSE EMAIL' : 'CODE MEMBRE'}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      {loginMethod === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type={loginMethod === 'email' ? 'email' : 'text'}
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder={
                        loginMethod === 'email'
                          ? 'exemple@asafa.mg'
                          : 'ASAFA-2026-SOA-001'
                      }
                      className="w-full bg-[#EAF1FA] hover:bg-[#E4ECF7] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Field 2: Mot de passe */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    MOT DE PASSE
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#EAF1FA] hover:bg-[#E4ECF7] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-11 py-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-[#0D4194] to-[#1565C0] hover:from-[#0B357B] hover:to-[#0D4194] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{t('sign_in')}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Registration Mode */
              <>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    ANARANA FENO (NOM COMPLET) *
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Nirina Rabe"
                      className="w-full bg-[#EAF1FA] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    ADRESSE EMAIL *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="votre.email@asafa.mg"
                      className="w-full bg-[#EAF1FA] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    LAHARANA FINDAY (TÉLÉPHONE)
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+261 34 00 000 00"
                      className="w-full bg-[#EAF1FA] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    EKIPA HANGATAHANA IDIRANA (ÉQUIPE) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['soalia', 'mpiantsa', 'tomima', 'asafa'] as TeamId[]).map(tId => (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setTeamId(tId)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                          teamId === tId
                            ? 'bg-[#0E4191] text-white border-[#0E4191] shadow-xs'
                            : 'bg-[#EAF1FA] text-slate-600 border-transparent hover:bg-slate-200'
                        }`}
                      >
                        {tId}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    MOT DE PASSE *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#EAF1FA] focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl pl-11 pr-11 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-[#0D4194] to-[#1565C0] hover:from-[#0B357B] hover:to-[#0D4194] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{t('submit_registration')}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Toggle between Login and Register */}
          <div className="pt-2 text-center border-t border-slate-100">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-[#0E4191] hover:underline"
              >
                Mbola tsy mpikambana ? Misorata anarana (S'inscrire)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs font-bold text-[#0E4191] hover:underline"
              >
                Efa manana kaonty ? Midira eto (Se connecter)
              </button>
            )}
          </div>
        </div>

        {/* 4. Quick Login Drawer (Testing accounts - preserves all demo testing) */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowQuickAccounts(!showQuickAccounts)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#0E4191] hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0E4191]" />
              <span>{t('quick_login_title')}</span>
            </div>
            {showQuickAccounts ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showQuickAccounts && (
            <div className="p-3 bg-slate-50/80 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setQuickAccount('admin@asafa.mg', 'AdminPassword123!')}
                className="bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                👑 {t('quick_admin')}
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('president.soalia@asafa.mg', 'President123!')}
                className="bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                👔 {t('quick_pres_soa')}
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('president.mpiantsa@asafa.mg', 'President123!')}
                className="bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                👔 {t('quick_pres_mpi')}
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('president.tomima@asafa.mg', 'President123!')}
                className="bg-white hover:bg-sky-50 text-sky-900 border border-sky-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                👔 {t('quick_pres_tom')}
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('member.soalia@asafa.mg', 'Member123!')}
                className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                👤 {t('quick_member')} (Email)
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('ASAFA-2026-SOA-001', 'Member123!')}
                className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate"
              >
                🔑 Code: SOA-001
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('tovo.nantenaina@asafa.mg', 'Member123!')}
                className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-xl text-left font-bold shadow-2xs truncate col-span-2"
              >
                ⏳ {t('quick_pending')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
