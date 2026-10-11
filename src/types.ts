export type TeamId = 'soalia' | 'mpiantsa' | 'tomima' | 'asafa';
export type UserRole = 'admin' | 'president' | 'member';
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  teamId: TeamId;
  status: MembershipStatus;
  memberId: string | null;
  qrCodeToken: string | null;
  avatarUrl: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface Team {
  id: TeamId;
  name: string;
  description: string;
  motto: string;
  color: string;
  memberCount?: number;
}

export interface Song {
  id: string;
  title: string;
  teamId: TeamId | 'all';
  category: string;
  number?: string;
  keySignature?: string;
  author: string;
  lyrics: string;
  audioUrl?: string | null;
  duration?: string;
  createdAt: string;
  createdBy: string;
}

export interface ProgrammeComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface ProgrammeAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ProgrammeReaction {
  userId: string;
  userName: string;
  emoji: string; // '❤️' | '👍' | '🙏' | '🔥' | '👏'
  createdAt: string;
}

export interface MemberCotisationPayment {
  userId: string;
  userName: string;
  userTeamId: TeamId;
  userAvatarUrl?: string;
  userMemberId?: string | null;
  amount: number;
  isPaid: boolean;
  paidAt?: string | null;
  markedBy?: string;
}

export interface Programme {
  id: string;
  title: string;
  description: string;
  teamId: TeamId | 'all';
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  eventDate: string | null;
  eventLocation: string | null;
  attachments: ProgrammeAttachment[];
  comments: ProgrammeComment[];
  imageUrl?: string | null;
  backgroundStyle?: string | null; // e.g. 'gradient-blue', 'gradient-purple', 'gradient-sunset', 'solid-navy', 'pattern-dots'
  reactions?: ProgrammeReaction[];
  hasCotisation?: boolean;
  cotisationAmount?: number;
  cotisationTitle?: string;
  cotisationPayments?: Record<string, MemberCotisationPayment>;
  isArchived: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  teamId: TeamId;
  title: string;
  caption: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  uploadedBy: string;
  authorName: string;
  eventDate: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface ConversationItem {
  conversation: {
    id: string;
    participants: [string, string];
    updatedAt: string;
  };
  partner: User | null;
  lastMessage: Message | null;
}

export interface GroupMessage {
  id: string;
  teamId: TeamId | 'all';
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderTeam: TeamId;
  content: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'contribution';
  teamId: TeamId;
  amount: number;
  currency: 'MGA' | 'EUR' | 'USD';
  category: string;
  description: string;
  date: string;
  receiptUrl: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalContributions: number;
  netBalance: number;
  transactionCount: number;
  currency: string;
  teamId: string;
  breakdown?: Record<string, { income: number; expenses: number; contributions: number; balance: number }>;
}

export interface VerificationData {
  valid: boolean;
  organization?: string;
  name?: string;
  memberId?: string | null;
  teamId?: TeamId;
  teamName?: string;
  role?: UserRole;
  status?: string;
  phone?: string;
  approvedAt?: string | null;
  avatarUrl?: string;
  officialSeal?: string;
  verifiedTimestamp?: string;
  message?: string;
  reason?: string;
}

export interface SettingsDoc {
  regulations: string;
  history: string;
  about: {
    title: string;
    description: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export type Language = 'fr' | 'mg' | 'en';
