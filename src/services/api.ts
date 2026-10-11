import {
  User,
  Team,
  Song,
  Programme,
  GalleryItem,
  ConversationItem,
  Message,
  GroupMessage,
  Transaction,
  FinancialSummary,
  VerificationData,
  SettingsDoc,
} from '../types.ts';

const TOKEN_KEY = 'asafa_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
};

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password }),
    }),

  register: (payload: { name: string; email: string; password: string; phone?: string; teamId: string }) =>
    request<{ message: string; user: Partial<User> }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: { name?: string; avatarUrl?: string }) =>
    request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Members
  getMembers: () => request<User[]>('/api/members'),

  getPendingMembers: () => request<User[]>('/api/members/pending'),

  approveMember: (id: string) =>
    request<{ message: string; user: User }>(`/api/members/${id}/approve`, {
      method: 'POST',
    }),

  rejectMember: (id: string) =>
    request<{ message: string; user: User }>(`/api/members/${id}/reject`, {
      method: 'POST',
    }),

  updateMemberStatus: (id: string, status: string) =>
    request<{ message: string; user: User }>(`/api/members/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // QR Code Verification
  verifyQrToken: (token: string) =>
    request<VerificationData>(`/api/verify-qr/${token}`),

  // Teams
  getTeams: () => request<Team[]>('/api/teams'),

  // Songs
  getSongs: (params?: { teamId?: string; search?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.teamId) q.set('teamId', params.teamId);
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    return request<Song[]>(`/api/songs?${q.toString()}`);
  },

  createSong: (song: Partial<Song>) =>
    request<Song>('/api/songs', {
      method: 'POST',
      body: JSON.stringify(song),
    }),

  updateSong: (id: string, song: Partial<Song>) =>
    request<Song>(`/api/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(song),
    }),

  deleteSong: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/songs/${id}`, {
      method: 'DELETE',
    }),

  // Programmes
  getProgrammes: (teamId?: string) => {
    const q = teamId ? `?teamId=${teamId}` : '';
    return request<Programme[]>(`/api/programmes${q}`);
  },

  createProgramme: (prog: Partial<Programme>) =>
    request<Programme>('/api/programmes', {
      method: 'POST',
      body: JSON.stringify(prog),
    }),

  deleteProgramme: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/programmes/${id}`, {
      method: 'DELETE',
    }),

  addProgrammeComment: (programmeId: string, content: string) =>
    request<any>(`/api/programmes/${programmeId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  reactToProgramme: (programmeId: string, emoji: string) =>
    request<{ reactions: any[]; userReacted: boolean }>(`/api/programmes/${programmeId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  getProgrammeCotisations: (programmeId: string) =>
    request<{
      programmeId: string;
      programmeTitle: string;
      eventDate: string | null;
      hasCotisation: boolean;
      cotisationTitle: string;
      cotisationAmount: number;
      members: {
        userId: string;
        name: string;
        teamId: any;
        memberId: string | null;
        avatarUrl: string;
        isPaid: boolean;
        amount: number;
        paidAt: string | null;
        markedBy: string | null;
      }[];
      totalCount: number;
      paidCount: number;
      totalCollected: number;
    }>(`/api/programmes/${programmeId}/cotisations`),

  toggleMemberCotisationPaid: (programmeId: string, userId: string, isPaid: boolean, amount?: number) =>
    request<{ message: string; payment: any }>(`/api/programmes/${programmeId}/cotisations/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPaid, amount }),
    }),

  // Gallery
  getGallery: (teamId?: string) => {
    const q = teamId ? `?teamId=${teamId}` : '';
    return request<GalleryItem[]>(`/api/gallery${q}`);
  },

  createGalleryItem: (item: Partial<GalleryItem>) =>
    request<GalleryItem>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  deleteGalleryItem: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/gallery/${id}`, {
      method: 'DELETE',
    }),

  // Messaging (Resadresaka)
  getConversations: () =>
    request<ConversationItem[]>('/api/messages/conversations'),

  createOrGetConversation: (targetUserId: string) =>
    request<{ conversation: any; partner: User }>('/api/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }),

  getConversationMessages: (convId: string) =>
    request<Message[]>(`/api/messages/conversations/${convId}/messages`),

  sendPrivateMessage: (convId: string, content: string) =>
    request<Message>(`/api/messages/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getGroupMessages: (teamId: string) =>
    request<GroupMessage[]>(`/api/messages/groups/${teamId}`),

  sendGroupMessage: (teamId: string, content: string) =>
    request<GroupMessage>(`/api/messages/groups/${teamId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Finances
  getFinances: (params?: { teamId?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.teamId) q.set('teamId', params.teamId);
    if (params?.type) q.set('type', params.type);
    return request<Transaction[]>(`/api/finances?${q.toString()}`);
  },

  getFinancialSummary: (teamId?: string) => {
    const q = teamId ? `?teamId=${teamId}` : '';
    return request<FinancialSummary>(`/api/finances/summary${q}`);
  },

  createTransaction: (tx: Partial<Transaction>) =>
    request<Transaction>('/api/finances', {
      method: 'POST',
      body: JSON.stringify(tx),
    }),

  deleteTransaction: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/finances/${id}`, {
      method: 'DELETE',
    }),

  // Settings
  getSettings: () => request<SettingsDoc>('/api/settings'),

  updateSettings: (settings: Partial<SettingsDoc>) =>
    request<SettingsDoc>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Upload
  uploadMedia: async (file: File): Promise<{ url: string; filename: string }> => {
    const token = getStoredToken();
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
