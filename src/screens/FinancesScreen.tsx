import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  Trash2,
  X,
  Receipt,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Transaction, FinancialSummary, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const FinancesScreen: React.FC = () => {
  const { user, role, teamId } = useAuth();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>(
    role === 'president' && teamId ? teamId : 'all'
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // New transaction modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<'income' | 'expense' | 'contribution'>('contribution');
  const [formTeamId, setFormTeamId] = useState<TeamId>(
    role === 'president' && teamId ? teamId : 'soalia'
  );
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Latsakemboka / Cotisation');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadFinances = async () => {
    setLoading(true);
    try {
      const effectiveTeam =
        role === 'admin'
          ? selectedTeam !== 'all'
            ? selectedTeam
            : undefined
          : teamId || 'soalia';

      const [txsData, sumData] = await Promise.all([
        api.getFinances({
          teamId: effectiveTeam,
          type: selectedType !== 'all' ? selectedType : undefined,
        }),
        api.getFinancialSummary(effectiveTeam),
      ]);
      setTransactions(txsData);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinances();
  }, [selectedTeam, selectedType]);

  const canCreateTransaction = () => {
    return role === 'admin' || role === 'president';
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Mila vola mitombina (Enter a valid amount)');
      return;
    }

    try {
      await api.createTransaction({
        type: formType,
        teamId: formTeamId,
        amount: amountNum,
        currency: 'MGA',
        category: formCategory,
        description: formDescription,
        date: formDate,
      });
      setIsModalOpen(false);
      setFormAmount('');
      setFormDescription('');
      loadFinances();
    } catch (err: any) {
      alert(err.message || 'Error creating transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tena hofafana ve ity hetsika ara-bola ity ?')) return;
    try {
      await api.deleteTransaction(id);
      loadFinances();
    } catch (err: any) {
      alert(err.message || 'Error deleting transaction');
    }
  };

  return (
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      {/* Header and Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-[#1565C0]" />
            <span>{t('finances_title')}</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            {role === 'admin'
              ? 'Teti-bola sy tatitra ankapobeny'
              : `Teti-bolan'ny Ekipa ${(teamId || '').toUpperCase()}`}
          </p>
        </div>

        {canCreateTransaction() && (
          <button
            onClick={() => {
              setFormTeamId(role === 'president' && teamId ? teamId : 'soalia');
              setIsModalOpen(true);
            }}
            className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Hetsika Vaovao</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="space-y-2">
          {/* Net Balance Main Card */}
          <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200">
                {t('net_balance')} (Solde Net)
              </span>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                {summary.netBalance.toLocaleString()} Ar
              </div>
              <span className="text-[10px] text-blue-200">
                Total hetsika: {summary.transactionCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black">
              MGA
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                <TrendingUp className="w-3 h-3" />
                <span>{t('total_income')}</span>
              </div>
              <div className="text-xs font-black text-slate-800 mt-1">
                {summary.totalIncome.toLocaleString()} Ar
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase">
                <TrendingDown className="w-3 h-3" />
                <span>{t('total_expenses')}</span>
              </div>
              <div className="text-xs font-black text-slate-800 mt-1">
                {summary.totalExpenses.toLocaleString()} Ar
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                <CreditCard className="w-3 h-3" />
                <span>{t('total_contributions')}</span>
              </div>
              <div className="text-xs font-black text-slate-800 mt-1">
                {summary.totalContributions.toLocaleString()} Ar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Filters (Team & Type) */}
      {role === 'admin' && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'soalia', 'mpiantsa', 'tomima', 'asafa'].map(tid => (
            <button
              key={tid}
              onClick={() => setSelectedTeam(tid)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                selectedTeam === tid
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tid === 'all' ? t('all_teams') : tid}
            </button>
          ))}
        </div>
      )}

      {/* Transaction Ledger */}
      <div className="flex-1 overflow-y-auto space-y-2 mt-1">
        <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wide">
          Boky Fitantanam-bola (Transactions)
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {t('loading')}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-200">
            Tsy misy hetsika ara-bola voarakitra.
          </div>
        ) : (
          transactions.map(tx => {
            const isIncome = tx.type === 'income' || tx.type === 'contribution';
            return (
              <div
                key={tx.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.type === 'expense'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="uppercase font-bold text-blue-700">Équipe {tx.teamId}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-black text-xs ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {tx.amount.toLocaleString()} Ar
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">
                      {tx.type}
                    </span>
                  </div>

                  {(role === 'admin' || (role === 'president' && tx.teamId === teamId)) && (
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded ml-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[90vh]">
            <div className="bg-[#1565C0] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">{t('add_transaction')}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Karazana hetsika (Type) *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormType('contribution')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      formType === 'contribution'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-300'
                    }`}
                  >
                    Cotisation
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      formType === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-300'
                    }`}
                  >
                    Recette
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      formType === 'expense'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-600 border-slate-300'
                    }`}
                  >
                    Dépense
                  </button>
                </div>
              </div>

              {role === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ekipa *
                  </label>
                  <select
                    value={formTeamId}
                    onChange={e => setFormTeamId(e.target.value as TeamId)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                  >
                    <option value="soalia">SOALIA</option>
                    <option value="mpiantsa">MPIANTSA</option>
                    <option value="tomima">TOMIMA</option>
                    <option value="asafa">ASAFA</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vola / Montant (Ariary MGA) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  placeholder="Ex: 50000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#1565C0] text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sokajy / Catégorie
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  placeholder="Latsakemboka, Fanatitra, Fampitaovana..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fanazavana (Description) *
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Antsipiriany momba ny hetsika..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daty
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
