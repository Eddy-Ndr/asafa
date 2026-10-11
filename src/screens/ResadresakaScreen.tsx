import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Send,
  Plus,
  Search,
  ArrowLeft,
  RefreshCw,
  Menu,
  CheckCheck,
  User as UserIcon,
  X,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { ConversationItem, Message, GroupMessage, User, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AsafaLogo } from '../components/AsafaLogo.tsx';

// Team visual badge styles matching app standard
const teamBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
  tomima: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'TOMIMA' },
  mpiantsa: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: 'MPIANTSA' },
  soalia: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', label: 'SOALIA' },
  asafa: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'ASAFA' },
  all: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', label: 'IOMBONANA' },
};

export const ResadresakaScreen: React.FC = () => {
  const { user, role, teamId } = useAuth();

  const [activeTab, setActiveTab] = useState<'private' | 'groups'>('private');

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data
  const [allMembers, setAllMembers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
  const [privateText, setPrivateText] = useState<string>('');

  // Group / Public Discussions
  const [selectedGroupTeam, setSelectedGroupTeam] = useState<TeamId | 'all'>('all');
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupText, setGroupText] = useState<string>('');

  // Modal to pick a member for a new discussion
  const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load registered members and conversations
  const loadData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [membersData, convsData] = await Promise.all([
        api.getMembers(),
        api.getConversations().catch(() => [] as ConversationItem[]),
      ]);
      setAllMembers(membersData);
      setConversations(convsData);
    } catch (err) {
      console.error('Erreur de chargement des discussions:', err);
    } finally {
      setLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Load messages for active conversation
  const loadActiveConvMessages = async (convId: string) => {
    try {
      const msgs = await api.getConversationMessages(convId);
      setPrivateMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch (err) {
      console.error('Failed to load private messages:', err);
    }
  };

  useEffect(() => {
    if (activeConv) {
      loadActiveConvMessages(activeConv.conversation.id);
      const pollTimer = setInterval(() => {
        loadActiveConvMessages(activeConv.conversation.id);
      }, 5000);
      return () => clearInterval(pollTimer);
    }
  }, [activeConv]);

  // Load group messages
  const loadGroupMessages = async (team: TeamId | 'all') => {
    try {
      const msgs = await api.getGroupMessages(team);
      setGroupMessages(msgs || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch (err) {
      console.error('Failed to load group messages:', err);
      setGroupMessages([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'groups') {
      loadGroupMessages(selectedGroupTeam);
      const groupTimer = setInterval(() => {
        loadGroupMessages(selectedGroupTeam);
      }, 6000);
      return () => clearInterval(groupTimer);
    }
  }, [activeTab, selectedGroupTeam]);

  // Start chat with any member
  const handleStartChatWith = async (targetMember: User) => {
    if (targetMember.id === user?.id) return;
    setIsNewDiscussionModalOpen(false);

    // Check if conversation exists
    const existing = conversations.find(c => c.partner?.id === targetMember.id);
    if (existing) {
      setActiveConv(existing);
      return;
    }

    try {
      const res = await api.createOrGetConversation(targetMember.id);
      const newConvItem: ConversationItem = {
        conversation: res.conversation,
        partner: res.partner || targetMember,
        lastMessage: null,
      };
      setConversations(prev => [newConvItem, ...prev.filter(c => c.conversation.id !== res.conversation.id)]);
      setActiveConv(newConvItem);
    } catch (err: any) {
      alert(err.message || 'Tsy afaka nanomboka resaka');
    }
  };

  // Send private message
  const handleSendPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !privateText.trim()) return;

    const text = privateText.trim();
    setPrivateText('');

    try {
      await api.sendPrivateMessage(activeConv.conversation.id, text);
      await loadActiveConvMessages(activeConv.conversation.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Tsy lasa ny hafatra');
    }
  };

  // Send group message
  const handleSendGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupText.trim()) return;

    const text = groupText.trim();
    setGroupText('');

    try {
      await api.sendGroupMessage(selectedGroupTeam, text);
      await loadGroupMessages(selectedGroupTeam);
    } catch (err: any) {
      alert(err.message || 'Tsy lasa ny hafatra');
    }
  };

  // Registered other members
  const otherMembers = allMembers.filter(m => m.id !== user?.id);

  // Filter conversations by search query
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const partnerName = c.partner?.name?.toLowerCase() || '';
    const lastMsg = c.lastMessage?.content?.toLowerCase() || '';
    return partnerName.includes(q) || lastMsg.includes(q);
  });

  // Filter members in modal
  const filteredModalMembers = otherMembers.filter(m => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.teamId.toLowerCase().includes(q);
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      {/* ==================================================== */}
      {/* 1. TOP HEADER: DEEP NAVY BLUE ROUNDED CONTAINER      */}
      {/* ==================================================== */}
      {!activeConv && (
        <div className="bg-[#163F8A] rounded-b-[36px] px-5 pt-4 pb-6 shadow-md shrink-0">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AsafaLogo className="w-11 h-11 shrink-0" size={44} />
              <div>
                <span className="text-blue-100 text-[11px] font-medium tracking-wide block">
                  Resadresaka
                </span>
                <h1 className="font-serif text-2xl font-bold text-white tracking-tight -mt-0.5">
                  Discussions
                </h1>
              </div>
            </div>

            {/* Top Right Action Icons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewDiscussionModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 transition-all cursor-pointer shadow-xs"
                title="Nouvelle discussion"
              >
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 transition-all cursor-pointer shadow-xs"
                title="Options"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Search bar inside the blue header */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-blue-100/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une discussion..."
              className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/25 rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-blue-100/70 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-100/80 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Options Drawer/Menu (Privé vs Groupe) */}
          {isMenuOpen && (
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-2 animate-in fade-in duration-150">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('private')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'private'
                      ? 'bg-white text-[#163F8A] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  Messages Privés
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'groups'
                      ? 'bg-white text-[#163F8A] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  Discussions de Groupe
                </button>
              </div>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. BODY CONTENT: EMPTY STATE OR CONVERSATIONS LIST   */}
      {/* ==================================================== */}
      {!activeConv ? (
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4 pb-28">
          {/* Group View if activeTab is 'groups' */}
          {activeTab === 'groups' ? (
            <div className="flex-1 flex flex-col space-y-3">
              {/* Channel Selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Iombonana (Tous)' },
                  { id: 'soalia', label: 'SOALIA' },
                  { id: 'mpiantsa', label: 'MPIANTSA' },
                  { id: 'tomima', label: 'TOMIMA' },
                  { id: 'asafa', label: 'ASAFA' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedGroupTeam(ch.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedGroupTeam === ch.id
                        ? 'bg-[#163F8A] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    #{ch.label}
                  </button>
                ))}
              </div>

              {/* Group messages box */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex-1 flex flex-col overflow-hidden min-h-[380px]">
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Channel #{selectedGroupTeam.toUpperCase()}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {groupMessages.length} messages
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {groupMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Aucun message dans ce groupe. Écrivez le premier message !
                    </div>
                  ) : (
                    groupMessages.map(msg => {
                      const isMe = msg.senderId === user?.id;
                      const badge = teamBadges[msg.senderTeam] || teamBadges.asafa;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {!isMe && (
                            <div className="flex items-center gap-1.5 text-[10px] mb-0.5 px-1 font-semibold text-slate-600">
                              <span className="font-bold text-slate-900">{msg.senderName}</span>
                              <span className={`text-[8.5px] font-black uppercase px-1 rounded ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                              isMe
                                ? 'bg-[#163F8A] text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p>{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Group input */}
                <form onSubmit={handleSendGroup} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={groupText}
                    onChange={e => setGroupText(e.target.value)}
                    placeholder={`Message dans #${selectedGroupTeam.toUpperCase()}...`}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#163F8A]/20"
                  />
                  <button
                    type="submit"
                    disabled={!groupText.trim()}
                    className="w-8 h-8 rounded-full bg-[#163F8A] hover:bg-[#11316B] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            /* EXACT EMPTY STATE MATCHING USER IMAGE */
            <div className="flex-1 flex flex-col items-center justify-center my-auto py-12 px-4">
              {/* Circular light-blue icon badge */}
              <div className="w-20 h-20 rounded-full bg-[#E1EDFE] text-[#163F8A] flex items-center justify-center mx-auto mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8 stroke-[1.8]" />
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-1.5">
                Aucune discussion pour le moment
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 max-w-xs">
                Commencez à échanger avec les autres membres.
              </p>

              {/* Pill Button: + Nouvelle discussion */}
              <button
                type="button"
                onClick={() => setIsNewDiscussionModalOpen(true)}
                className="bg-[#163F8A] hover:bg-[#11316B] text-white px-6 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.4]" />
                <span>Nouvelle discussion</span>
              </button>
            </div>
          ) : (
            /* CONVERSATIONS LIST WHEN DISCUSSIONS EXIST */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Discussions récentes ({filteredConversations.length})
                </span>
                <button
                  onClick={() => setIsNewDiscussionModalOpen(true)}
                  className="text-xs font-bold text-[#163F8A] hover:underline"
                >
                  + Nouveau
                </button>
              </div>

              {filteredConversations.map(conv => {
                const partner = conv.partner;
                const badge = partner?.teamId ? (teamBadges[partner.teamId] || teamBadges.asafa) : teamBadges.asafa;
                return (
                  <div
                    key={conv.conversation.id}
                    onClick={() => setActiveConv(conv)}
                    className="bg-white hover:border-[#163F8A]/40 hover:shadow-sm border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={
                            partner?.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={partner?.name || 'Membre'}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                        <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#163F8A] transition-colors truncate">
                            {partner?.name || 'Membre ASAFA'}
                          </h3>
                          {partner?.teamId && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {conv.lastMessage ? (
                            <span>
                              {conv.lastMessage.senderId === user?.id ? 'Vous: ' : ''}
                              {conv.lastMessage.content}
                            </span>
                          ) : (
                            <span className="text-[#163F8A] font-medium">
                              Commencer la discussion...
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ==================================================== */
        /* 3. ACTIVE 1-ON-1 CHAT THREAD VIEW                   */
        /* ==================================================== */
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
          {/* Thread Header in Deep Blue Style */}
          <div className="bg-[#163F8A] px-4 py-3 flex items-center justify-between text-white shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveConv(null)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer"
                title="Retour"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              <div className="relative">
                <img
                  src={
                    activeConv.partner?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={activeConv.partner?.name || 'Membre'}
                  className="w-10 h-10 rounded-full object-cover border border-white/30 shadow-xs"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#163F8A] absolute bottom-0 right-0" />
              </div>

              <div>
                <h2 className="font-bold text-sm text-white leading-tight">
                  {activeConv.partner?.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="font-semibold uppercase">
                    Équipe {activeConv.partner?.teamId}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-300 font-medium">En ligne</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => loadActiveConvMessages(activeConv.conversation.id)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex justify-center my-1">
              <span className="bg-slate-200/70 text-slate-600 text-[10px] font-semibold px-3 py-1 rounded-full">
                Discussion privée et sécurisée
              </span>
            </div>

            {privateMessages.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center my-8 shadow-xs max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#E1EDFE] text-[#163F8A] mx-auto flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-xs text-slate-800">
                  Envoyez un message à {activeConv.partner?.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Les messages envoyés apparaissent instantanément.
                </p>
              </div>
            ) : (
              privateMessages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#163F8A] text-white rounded-br-xs font-normal'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[9.5px] text-slate-400 font-mono">
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#163F8A]" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Dock */}
          <form
            onSubmit={handleSendPrivate}
            className="bg-white border-t border-slate-200/80 p-3 flex items-center gap-2 shadow-xs shrink-0"
          >
            <div className="flex-1 bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white border border-slate-200 rounded-full flex items-center px-4 py-1.5 transition-all focus-within:ring-2 focus-within:ring-[#163F8A]/20 focus-within:border-[#163F8A]">
              <input
                type="text"
                value={privateText}
                onChange={e => setPrivateText(e.target.value)}
                placeholder={`Écrire à ${activeConv.partner?.name || 'un membre'}...`}
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!privateText.trim()}
              className="w-10 h-10 rounded-full bg-[#163F8A] hover:bg-[#11316B] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. CIRCULAR FLOATING ACTION BUTTON (FAB) (+)         */}
      {/* Exactly as shown in user's image in bottom right     */}
      {/* ==================================================== */}
      {!activeConv && (
        <button
          type="button"
          onClick={() => setIsNewDiscussionModalOpen(true)}
          className="fixed right-5 bottom-20 w-14 h-14 rounded-full bg-[#163F8A] hover:bg-[#11316B] text-white flex items-center justify-center shadow-xl shadow-blue-950/30 hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
          title="Nouvelle discussion"
        >
          <Plus className="w-7 h-7 stroke-[2.4]" />
        </button>
      )}

      {/* ==================================================== */}
      {/* 5. MODAL: CHOISIR UN MEMBRE POUR NOUVELLE DISCUSSION */}
      {/* ==================================================== */}
      {isNewDiscussionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#163F8A] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Nouvelle discussion</h3>
                <p className="text-[11px] text-blue-100">Choisissez un membre à contacter</p>
              </div>
              <button
                onClick={() => setIsNewDiscussionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={e => setMemberSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou équipe..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#163F8A]"
                />
              </div>
            </div>

            {/* Modal Members List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredModalMembers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Aucun membre trouvé.
                </div>
              ) : (
                filteredModalMembers.map(m => {
                  const badge = teamBadges[m.teamId] || teamBadges.asafa;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleStartChatWith(m)}
                      className="p-2.5 rounded-2xl border border-slate-200 hover:border-[#163F8A] hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={m.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                          />
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-[#163F8A] transition-colors">
                            {m.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                            {m.role === 'admin' && (
                              <span className="text-[8.5px] bg-red-100 text-red-700 font-bold px-1 rounded uppercase">
                                Admin
                              </span>
                            )}
                            {m.role === 'president' && (
                              <span className="text-[8.5px] bg-purple-100 text-purple-700 font-bold px-1 rounded uppercase">
                                Filoha
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#163F8A] group-hover:translate-x-0.5 transition-transform">
                        Discuter →
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
