import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'asafa_db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export type TeamId = 'soalia' | 'mpiantsa' | 'tomima' | 'asafa';
export type UserRole = 'admin' | 'president' | 'member';
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
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
  emoji: string;
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
  backgroundStyle?: string | null;
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

export interface Conversation {
  id: string;
  participants: [string, string]; // two user IDs
  updatedAt: string;
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

export interface DatabaseSchema {
  users: User[];
  teams: Team[];
  songs: Song[];
  programmes: Programme[];
  gallery: GalleryItem[];
  conversations: Conversation[];
  messages: Message[];
  groupMessages: GroupMessage[];
  transactions: Transaction[];
  settings: SettingsDoc;
}

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('AdminPassword123!', salt);
  const presPass = bcrypt.hashSync('President123!', salt);
  const memberPass = bcrypt.hashSync('Member123!', salt);

  const initialUsers: User[] = [
    {
      id: 'usr-admin-1',
      email: 'admin@asafa.mg',
      passwordHash: adminPass,
      name: 'Directeur Général ASAFA',
      phone: '+261 34 00 123 45',
      role: 'admin',
      teamId: 'asafa',
      status: 'active',
      memberId: 'ASAFA-ADMIN-001',
      qrCodeToken: 'v-tok-admin-001-sec',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2026-01-01T08:00:00.000Z',
      approvedAt: '2026-01-01T08:00:00.000Z',
      approvedBy: 'SYSTEM',
    },
    {
      id: 'usr-pres-soalia',
      email: 'president.soalia@asafa.mg',
      passwordHash: presPass,
      name: 'Rivo Rakotoarisoa (Président Soalia)',
      phone: '+261 32 11 234 56',
      role: 'president',
      teamId: 'soalia',
      status: 'active',
      memberId: 'ASAFA-2026-SOA-PRES',
      qrCodeToken: 'v-tok-soalia-pres-88',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2026-01-05T09:00:00.000Z',
      approvedAt: '2026-01-05T09:00:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-pres-mpiantsa',
      email: 'president.mpiantsa@asafa.mg',
      passwordHash: presPass,
      name: 'Faly Randrianarivelo (Président Mpiantsa)',
      phone: '+261 33 22 345 67',
      role: 'president',
      teamId: 'mpiantsa',
      status: 'active',
      memberId: 'ASAFA-2026-MPI-PRES',
      qrCodeToken: 'v-tok-mpiantsa-pres-77',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: '2026-01-05T09:30:00.000Z',
      approvedAt: '2026-01-05T09:30:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-pres-tomima',
      email: 'president.tomima@asafa.mg',
      passwordHash: presPass,
      name: 'Hasina Rasolofo (Président Tomima)',
      phone: '+261 34 33 456 78',
      role: 'president',
      teamId: 'tomima',
      status: 'active',
      memberId: 'ASAFA-2026-TOM-PRES',
      qrCodeToken: 'v-tok-tomima-pres-66',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      createdAt: '2026-01-05T10:00:00.000Z',
      approvedAt: '2026-01-05T10:00:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-pres-asafa',
      email: 'president.asafa@asafa.mg',
      passwordHash: presPass,
      name: 'Mamy Andrianina (Président Asafa)',
      phone: '+261 34 44 567 89',
      role: 'president',
      teamId: 'asafa',
      status: 'active',
      memberId: 'ASAFA-2026-ASA-PRES',
      qrCodeToken: 'v-tok-asafa-pres-55',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      createdAt: '2026-01-05T10:30:00.000Z',
      approvedAt: '2026-01-05T10:30:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-mem-soalia-1',
      email: 'member.soalia@asafa.mg',
      passwordHash: memberPass,
      name: 'Miora Rabe (Choriste Soalia)',
      phone: '+261 32 55 678 90',
      role: 'member',
      teamId: 'soalia',
      status: 'active',
      memberId: 'ASAFA-2026-SOA-001',
      qrCodeToken: 'v-tok-miora-soa-101',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      createdAt: '2026-01-10T11:00:00.000Z',
      approvedAt: '2026-01-10T12:00:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-mem-mpiantsa-1',
      email: 'member.mpiantsa@asafa.mg',
      passwordHash: memberPass,
      name: 'Lova Razafy (Membre Mpiantsa)',
      phone: '+261 33 66 789 01',
      role: 'member',
      teamId: 'mpiantsa',
      status: 'active',
      memberId: 'ASAFA-2026-MPI-001',
      qrCodeToken: 'v-tok-lova-mpi-202',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: '2026-01-12T08:00:00.000Z',
      approvedAt: '2026-01-12T09:00:00.000Z',
      approvedBy: 'usr-admin-1',
    },
    {
      id: 'usr-mem-pending-1',
      email: 'tovo.nantenaina@asafa.mg',
      passwordHash: memberPass,
      name: 'Tovo Nantenaina',
      phone: '+261 34 77 890 12',
      role: 'member',
      teamId: 'tomima',
      status: 'pending',
      memberId: null,
      qrCodeToken: null,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      createdAt: '2026-02-01T14:20:00.000Z',
      approvedAt: null,
      approvedBy: null,
    },
  ];

  const initialTeams: Team[] = [
    {
      id: 'soalia',
      name: 'SOALIA',
      description: 'Ekipa Soalia — Mpihira sy mpidera, feon-kira feno fahasoavana.',
      motto: 'Midera am-pifaliana sy am-pahamarinana',
      color: '#1565C0',
    },
    {
      id: 'mpiantsa',
      name: 'MPIANTSA',
      description: 'Ekipa Mpiantsa — Hira faneva, fanentanana ara-panahy sy fiombonana.',
      motto: 'Miantso ny rehetra ho amin\'ny famonjena',
      color: '#0D47A1',
    },
    {
      id: 'tomima',
      name: 'TOMIMA',
      description: 'Ekipa Tomima — Tanora mavitrika, asa fitoriana sy fanehoam-pitiavana.',
      motto: 'Miorina mafy amin\'ny finoana sy fanantenana',
      color: '#1976D2',
    },
    {
      id: 'asafa',
      name: 'ASAFA',
      description: 'Ekipa Foibe ASAFA — Firaisankina, fandrindrana ankapobeny sy fitantanana.',
      motto: 'Miaraka mandroso ho voninahitr\'Andriamanitra',
      color: '#0288D1',
    },
  ];

  const initialSongs: Song[] = [
    {
      id: 'sng-img-1',
      title: 'Andriamanitra Tsara',
      teamId: 'tomima',
      category: 'Adoration',
      number: 'TOM-05',
      keySignature: 'Do major (C)',
      author: 'Komity Mpanoratra Tomima',
      lyrics: `Andriamanitra tsara
ito Anao izahay
Misaotra Anao, misaotra Anao
Fa ny fitiavanao
Tsy misy tahaka Anao
Tompo ô, misaotra Anao

Ny fitiavanao lehibe
Mandrakizay tsy miova
Ny fahasoavanao
Tsarovy mandrakariva

Tsara ô
Andriamanitra tsara
ito Anao izahay...

Ny Fahasoavianao ô
Mandrakizay tsy miova
Ny fitiavanao ô
Tsarovy mandrakariva`,
      audioUrl: '/uploads/hymn-tomima.wav',
      duration: '5:03',
      createdAt: '2026-01-08T08:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-img-2',
      title: 'Avia Eto Aminay',
      teamId: 'soalia',
      category: 'Invocation',
      number: 'SOA-12',
      keySignature: 'Sol major (G)',
      author: 'Ekipa Mpihira Soalia',
      lyrics: `Avia ry Fanahy Masina ô
Mitoera eto aminay anio
Fenoy ny fihavanana
Sy ny fitiavana marina
Ny fonay manontolo

Fiv:
Avia, avia Tompo ô
Manazava ny dianay
Tariho izahay hahatoky
Ny teninao masina.`,
      audioUrl: '/uploads/hymn-soalia.wav',
      duration: '4:21',
      createdAt: '2026-01-09T09:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-img-3',
      title: 'Ho an\'ny Tompo',
      teamId: 'mpiantsa',
      category: 'Louange',
      number: 'MPI-08',
      keySignature: 'Re major (D)',
      author: 'Ekipa Mpiantsa',
      lyrics: `Ho an'ny Tompo irery ihany
Ny haja sy ny laza mandrakizay
Midera Azy ny tany sy ny lanitra
Manandratra ny anarany masina.

Fiv:
Haleloia, derao Izy
Izy no Mpanjakan'ny mpanjaka
Ny voninahitra dia Azy
Amen, Amen!`,
      audioUrl: '/uploads/hymn-mpiantsa.wav',
      duration: '3:47',
      createdAt: '2026-01-10T10:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-img-4',
      title: 'Midera Anao',
      teamId: 'tomima',
      category: 'Louange',
      number: 'TOM-09',
      keySignature: 'Fa major (F)',
      author: 'Tanora Tomima',
      lyrics: `Midera Anao izahay Tompo
Am-pifaliana sy am-panajana
Ny asanao mahagaga
Maneho ny herinao lehibe.

Fiv:
Tompo ô, mendrika Ianao
Hahazo ny fisaorana rehetra
Ny foko manontolo no manome
Voninahitra ho Anao.`,
      audioUrl: '/uploads/hymn-tomima.wav',
      duration: '4:32',
      createdAt: '2026-01-11T11:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-img-5',
      title: 'Ny Fahasoavanao',
      teamId: 'asafa',
      category: 'Adoration',
      number: 'ASA-04',
      keySignature: 'Mi bemol (Eb)',
      author: 'Birao Foibe ASAFA Toliara',
      lyrics: `Ny fahasoavanao ry Ray
No nandraisako fiainana
Tsy misy tambiny izany
Fa fitiavana madio sy masina.

Fiv:
Misaotra Tompo ô
Noho ny famindram-ponao
Mitoetra eo anilanao
Mandrakizay doria.`,
      audioUrl: '/uploads/hymn-asafa.wav',
      duration: '5:18',
      createdAt: '2026-01-12T12:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-img-6',
      title: 'Ry Mesia',
      teamId: 'all',
      category: 'Noël',
      number: 'FIA-01',
      keySignature: 'La major (A)',
      author: 'FIARAM Toliara',
      lyrics: `Ry Mesia efa teraka
Ao Betlehema tany
Izy no Mpamonjy lehibe
Tonga hamonjy antsika mpanota.

Fiv:
Noely, Noely, fifaliana
Teraka Ilay Zanak'Andriamanitra
Hiadana ny tany
Voninahitra any amin'ny avo indrindra!`,
      audioUrl: '/uploads/hymn-soalia.wav',
      duration: '4:02',
      createdAt: '2026-01-13T14:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-1',
      title: 'Hira Faneva Soalia — Sambatra ny Olona',
      teamId: 'soalia',
      category: 'Hira Faneva',
      number: 'SOA-01',
      keySignature: 'Do major (C)',
      author: 'Komity Mpanoratra Soalia',
      lyrics: `(1)\nSambatra ny olona izay tsy mandeha\nAmin'ny fisainan'ny ratsy fanahy,\nFa ny lalàn'ny Tompo no mahafaly azy,\nMibanjina izany andro aman'alina.\n\nFiv:\nEny, Soalia, midera am-pifaliana,\nFeo tokana, fo manetry tena,\nNy voninahitra dia ho anao Jehovah,\nMandrakizay doria, Amen!\n\n(2)\nTahaka ny hazo nambolena teo amoron-drano,\nIzay mamoa amin'ny fotoany,\nTsy mba malazo ny raviny,\nAry hambinina izay rehetra ataony.`,
      audioUrl: '/uploads/hymn-soalia.wav',
      duration: '4:15',
      createdAt: '2026-01-10T10:00:00.000Z',
      createdBy: 'usr-admin-1',
    },
    {
      id: 'sng-4',
      title: 'ASAFA — Firaisankina Masina',
      teamId: 'asafa',
      category: 'Hira Faneva Foibe',
      number: 'ASA-01',
      keySignature: 'Fa major (F)',
      author: 'Birao Foibe ASAFA',
      lyrics: `(1)\nSoalia, Mpiantsa, Tomima sy Asafa,\nEkipa efatra mivondrona ao anaty fo iray,\nTsy misy avonavona na fiangarana,\nFa fahasoavana lehibe no mitondra antsika.\n\nFiv:\nASAFA, voninahitra ho an'Andriamanitra!\nManga sy fotsy, fahadiovana sy finoana,\nIombonantsika ny tanjona rehetra,\nHo fijoroana vavolombelona marina.`,
      audioUrl: '/uploads/hymn-asafa.wav',
      duration: '4:40',
      createdAt: '2026-01-12T11:30:00.000Z',
      createdBy: 'usr-admin-1',
    },
  ];

  const initialProgrammes: Programme[] = [
    {
      id: 'prg-1',
      title: 'Fivoriambe Lehibe sy Fampirantiana Iraisam-pirenena ASAFA 2026',
      description: 'Fivorian\'ny ekipa efatra (SOALIA, MPIANTSA, TOMIMA, ASAFA) ao amin\'ny Foibe. Fandinihana ny teti-bola sy fandaharam-potoana ho an\'ny taona 2026. Tongava maro!',
      teamId: 'all',
      authorId: 'usr-admin-1',
      authorName: 'Directeur Général ASAFA',
      authorRole: 'admin',
      eventDate: '2026-04-18T09:00:00.000Z',
      eventLocation: 'Lapan\'ny Kolontsaina sy ny Fanatanjahantena, Antananarivo',
      attachments: [
        {
          id: 'att-1',
          name: 'Fandaharam-potoana_Ofisialy_ASAFA_2026.pdf',
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          type: 'application/pdf',
          size: 245000,
        },
      ],
      comments: [
        {
          id: 'cmt-1',
          authorId: 'usr-pres-soalia',
          authorName: 'Rivo Rakotoarisoa (Président Soalia)',
          authorRole: 'president',
          content: 'Efa vonona ny ekipa Soalia amin\'ny hira faneva sy ny fampirantiana!',
          createdAt: '2026-02-10T10:15:00.000Z',
        },
        {
          id: 'cmt-2',
          authorId: 'usr-pres-mpiantsa',
          authorName: 'Faly Randrianarivelo (Président Mpiantsa)',
          authorRole: 'president',
          content: 'Mankahery ny rehetra. Ho voninahitr\'Andriamanitra tokoa.',
          createdAt: '2026-02-10T11:40:00.000Z',
        },
      ],
      isArchived: false,
      createdAt: '2026-02-09T08:00:00.000Z',
    },
    {
      id: 'prg-2',
      title: 'Famaranana ny Fiofanana Hira & Feon-kira — Équipe SOALIA',
      description: 'Fiofanana manokana ho an\'ny mpikambana ao amin\'ny Soalia momba ny solfezy sy ny fandrindrana feo 4.',
      teamId: 'soalia',
      authorId: 'usr-pres-soalia',
      authorName: 'Rivo Rakotoarisoa (Président Soalia)',
      authorRole: 'president',
      eventDate: '2026-03-22T14:30:00.000Z',
      eventLocation: 'Salle de Répétition Soalia, Ivato',
      attachments: [],
      comments: [],
      isArchived: false,
      createdAt: '2026-02-12T14:00:00.000Z',
    },
    {
      id: 'prg-3',
      title: 'Fivoahana sy Asa Fitoriana — Équipe TOMIMA',
      description: 'Fidinana ifotony sy fanolorana fanampiana ara-tsosialy miaraka amin\'ny tanora Tomima.',
      teamId: 'tomima',
      authorId: 'usr-pres-tomima',
      authorName: 'Hasina Rasolofo (Président Tomima)',
      authorRole: 'president',
      eventDate: '2026-05-02T08:00:00.000Z',
      eventLocation: 'Distrika Avaradrano',
      attachments: [],
      comments: [],
      isArchived: false,
      createdAt: '2026-02-14T09:20:00.000Z',
    },
  ];

  const initialGallery: GalleryItem[] = [
    {
      id: 'gal-soa-1',
      teamId: 'soalia',
      title: 'Fampisehoana Soalia am-pifaliana',
      caption: 'Fampisehoana lehibe nataon\'ny ekipa Soalia nandritra ny fetim-pirenena sy fiderana.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      uploadedBy: 'usr-pres-soalia',
      authorName: 'Rivo Rakotoarisoa',
      eventDate: '2025-12-20',
      createdAt: '2026-01-10T12:00:00.000Z',
    },
    {
      id: 'gal-soa-2',
      teamId: 'soalia',
      title: 'Famerenana hira sy feo 4',
      caption: 'Famerenana alohan\'ny fivoriana lehibe ao Ivato.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      uploadedBy: 'usr-pres-soalia',
      authorName: 'Rivo Rakotoarisoa',
      eventDate: '2026-01-15',
      createdAt: '2026-01-16T15:00:00.000Z',
    },
    {
      id: 'gal-mpi-1',
      teamId: 'mpiantsa',
      title: 'Hetsika Mpiantsa Faneva',
      caption: 'Ny mpihira Mpiantsa amin\'ny akanjo manga sy fotsy ofisialy.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
      uploadedBy: 'usr-pres-mpiantsa',
      authorName: 'Faly Randrianarivelo',
      eventDate: '2026-01-08',
      createdAt: '2026-01-09T10:00:00.000Z',
    },
    {
      id: 'gal-tom-1',
      teamId: 'tomima',
      title: 'Fivoriana Tanora Tomima',
      caption: 'Tanora mavitrika vonona amin\'ny asa fitoriana sy firaisankina.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      uploadedBy: 'usr-pres-tomima',
      authorName: 'Hasina Rasolofo',
      eventDate: '2026-01-22',
      createdAt: '2026-01-23T11:00:00.000Z',
    },
    {
      id: 'gal-asa-1',
      teamId: 'asafa',
      title: 'Birao Foibe sy Mpitarika ASAFA',
      caption: 'Fivorian\'ny filankevi-pitantanana Foibe ASAFA miaraka amin\'ireo Filohan\'ny Ekipa efatra.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800',
      uploadedBy: 'usr-admin-1',
      authorName: 'Directeur Général ASAFA',
      eventDate: '2026-01-30',
      createdAt: '2026-01-31T14:00:00.000Z',
    },
  ];

  const initialGroupMessages: GroupMessage[] = [
    {
      id: 'gmsg-1',
      teamId: 'all',
      senderId: 'usr-admin-1',
      senderName: 'Directeur Général ASAFA',
      senderRole: 'admin',
      senderTeam: 'asafa',
      content: 'Tongasoa eto amin\'ny tontolo iombonana ASAFA! Mirary soa sy fahazotoana ho an\'ny ekipa rehetra.',
      createdAt: '2026-02-01T08:00:00.000Z',
    },
    {
      id: 'gmsg-2',
      teamId: 'soalia',
      senderId: 'usr-pres-soalia',
      senderName: 'Rivo Rakotoarisoa (Président Soalia)',
      senderRole: 'president',
      senderTeam: 'soalia',
      content: 'Miarahaba antsika mpikambana Soalia rehetra! Aza adino ny famerenana amin\'ny asabotsy izao.',
      createdAt: '2026-02-02T09:30:00.000Z',
    },
    {
      id: 'gmsg-3',
      teamId: 'soalia',
      senderId: 'usr-mem-soalia-1',
      senderName: 'Miora Rabe (Choriste Soalia)',
      senderRole: 'member',
      senderTeam: 'soalia',
      content: 'Voaray tsara ry Filoha! Efa voaomana ny faneva sy ny feo voalohany.',
      createdAt: '2026-02-02T10:05:00.000Z',
    },
    {
      id: 'gmsg-4',
      teamId: 'mpiantsa',
      senderId: 'usr-pres-mpiantsa',
      senderName: 'Faly Randrianarivelo (Président Mpiantsa)',
      senderRole: 'president',
      senderTeam: 'mpiantsa',
      content: 'Mpiantsa vonona! Efa mandeha ny fisoratana anarana ho an\'ny hetsika manaraka.',
      createdAt: '2026-02-03T11:00:00.000Z',
    },
  ];

  const initialTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'contribution',
      teamId: 'soalia',
      amount: 450000,
      currency: 'MGA',
      category: 'Latsakemboka / Cotisation',
      description: 'Latsakemboka volana Janoary 2026 — Mpikambana 30 ao Soalia',
      date: '2026-01-25',
      receiptUrl: null,
      createdBy: 'usr-pres-soalia',
      createdByName: 'Rivo Rakotoarisoa',
      createdAt: '2026-01-25T16:00:00.000Z',
    },
    {
      id: 'tx-2',
      type: 'expense',
      teamId: 'soalia',
      amount: 120000,
      currency: 'MGA',
      category: 'Fampitaovana / Équipement',
      description: 'Fividianana bokin-kira sy fampitomboana solfezy Soalia',
      date: '2026-01-28',
      receiptUrl: null,
      createdBy: 'usr-pres-soalia',
      createdByName: 'Rivo Rakotoarisoa',
      createdAt: '2026-01-28T10:00:00.000Z',
    },
    {
      id: 'tx-3',
      type: 'income',
      teamId: 'mpiantsa',
      amount: 600000,
      currency: 'MGA',
      category: 'Fanatitra / Offrande',
      description: 'Fanomezana manokana avy amin\'ny mpanohana Mpiantsa',
      date: '2026-01-30',
      receiptUrl: null,
      createdBy: 'usr-admin-1',
      createdByName: 'Directeur Général ASAFA',
      createdAt: '2026-01-30T14:00:00.000Z',
    },
    {
      id: 'tx-4',
      type: 'expense',
      teamId: 'mpiantsa',
      amount: 180000,
      currency: 'MGA',
      category: 'Hetsika / Événement',
      description: 'Hofan-toerana sy feo nandritra ny fihaonana Mpiantsa',
      date: '2026-02-05',
      receiptUrl: null,
      createdBy: 'usr-pres-mpiantsa',
      createdByName: 'Faly Randrianarivelo',
      createdAt: '2026-02-05T12:00:00.000Z',
    },
    {
      id: 'tx-5',
      type: 'contribution',
      teamId: 'tomima',
      amount: 320000,
      currency: 'MGA',
      category: 'Latsakemboka / Cotisation',
      description: 'Fandraisana anjara tanora Tomima — Hetsika fitoriana',
      date: '2026-02-08',
      receiptUrl: null,
      createdBy: 'usr-pres-tomima',
      createdByName: 'Hasina Rasolofo',
      createdAt: '2026-02-08T09:00:00.000Z',
    },
    {
      id: 'tx-6',
      type: 'income',
      teamId: 'asafa',
      amount: 1500000,
      currency: 'MGA',
      category: 'Teti-bola Foibe',
      description: 'Fanampiana sy fandraisana anjara foibe ho an\'ny asa fampandrosoana ASAFA',
      date: '2026-02-01',
      receiptUrl: null,
      createdBy: 'usr-admin-1',
      createdByName: 'Directeur Général ASAFA',
      createdAt: '2026-02-01T10:00:00.000Z',
    },
  ];

  const initialSettings: SettingsDoc = {
    regulations: `# FITSIPIKA ANATINY OFISIALY ASAFA
## Toko I: Famaritana sy Tanjona
1. Ny Fikambanana ASAFA dia fikambanana mampiray ny ekipa efatra: SOALIA, MPIANTSA, TOMIMA ary ny Birao Foibe ASAFA.
2. Ny loko ofisialy dia ny MANGA SY NY FOTSY (Bleu et Blanc), maneho ny fahadiovana, ny finoana ary ny fahamarinana.
3. Ny tanjona dia ny fiderana an'Andriamanitra, ny fampivoarana ara-panahy sy ara-tsosialy, ary ny fanamafisana ny fiombonana.

## Toko II: Ny Mpikambana sy ny Andraikitra
4. Ny mpikambana rehetra dia manana karatra maha-mpikambana ofisialy misy QR Code azo hamarinina.
5. Ny mpikambana dia manaja ny fandaharam-potoana, ny latsakemboka ary ny fitsipiky ny ekipa misy azy.
6. Ny Filohan'ny ekipa no miandraikitra ny fandrindrana ny ekipany manokana ary mitatitra amin'ny Birao Foibe.

## Toko III: Ny Fitantanam-bola
7. Ny vola rehetra miditra sy mivoaka dia tsy maintsy misy porofo ara-dalàna (rosia na faktiora).
8. Ny mpikambana rehetra dia manana zo hahita ny tatitra ara-bola voamarina.`,
    history: `# TANTARAN'NY ASAFA SY IREO EKIPA EFATRA
## Fiaviana sy Fiorenana
Niorina tamin'ny finiavana sy fanoloran-tena lehibe ny fikambanana ASAFA, nateraky ny faniriana hanangona ireo hery velona sy feo mendrika ho fiderana an'Andriamanitra.

## Ireo Ekipa Efatra:
1. **SOALIA**: Natsangana ho fanehoana ny kanto sy ny fiderana amin'ny feo kanto sy madio. Ny anarana dia mifandray amin'ny hatsaran'ny fanahy sy ny fiderana avy amin'ny fo.
2. **MPIANTSA**: Ekipa mpiantso sy mpitory ny Filazantsara amin'ny alalan'ny hira faneva sy ny fanentanana ara-panahy.
3. **TOMIMA**: Vondron'ny tanora mavitrika miorina amin'ny finoana sy asa fitoriana mivaingana.
4. **ASAFA**: Ny Birao Mpandrindra Foibe mampitohy ny rehetra, loharanon'ny firaisankina sy ny fandaminana.

Manga sy Fotsy no sainam-pirenentsika manokana, famantarana ny fanoloran-tena mandrakizay.`,
    about: {
      title: 'Fikambanana ASAFA',
      description: 'Fikambanana kristiana sy ara-kolontsaina mampiray ny ekipa SOALIA, MPIANTSA, TOMIMA ary ASAFA.',
      address: 'Lot IV R 45, Foibe ASAFA, Antananarivo 101, Madagascar',
      contactEmail: 'contact@asafa.mg',
      contactPhone: '+261 34 00 123 45',
    },
  };

  return {
    users: initialUsers,
    teams: initialTeams,
    songs: initialSongs,
    programmes: initialProgrammes,
    gallery: initialGallery,
    conversations: [],
    messages: [],
    groupMessages: initialGroupMessages,
    transactions: initialTransactions,
    settings: initialSettings,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load database from file, initializing fresh:', e);
    }
    const initial = getInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (err) {
      console.error('Failed to save DB file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByQrToken(token: string): User | undefined {
    return this.data.users.find(u => u.qrCodeToken === token);
  }

  public findUserByMemberId(memberId: string): User | undefined {
    return this.data.users.find(u => u.memberId === memberId);
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Teams ---
  public getTeams(): Team[] {
    return this.data.teams.map(t => {
      const count = this.data.users.filter(u => u.teamId === t.id && u.status === 'active').length;
      return { ...t, memberCount: count };
    });
  }

  // --- Songs ---
  public getSongs(filters?: { teamId?: string; search?: string; category?: string }): Song[] {
    let list = this.data.songs;
    if (filters?.teamId && filters.teamId !== 'all') {
      list = list.filter(s => s.teamId === filters.teamId || s.teamId === 'all');
    }
    if (filters?.category) {
      list = list.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.lyrics.toLowerCase().includes(q));
    }
    return list;
  }

  public addSong(song: Song): Song {
    this.data.songs.unshift(song);
    this.save();
    return song;
  }

  public updateSong(id: string, updates: Partial<Song>): Song | null {
    const idx = this.data.songs.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.songs[idx] = { ...this.data.songs[idx], ...updates };
    this.save();
    return this.data.songs[idx];
  }

  public deleteSong(id: string): boolean {
    const idx = this.data.songs.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.songs.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Programmes ---
  public getProgrammes(teamId?: string): Programme[] {
    let list = this.data.programmes;
    if (teamId && teamId !== 'all') {
      list = list.filter(p => p.teamId === teamId || p.teamId === 'all');
    }
    return list;
  }

  public addProgramme(prog: Programme): Programme {
    this.data.programmes.unshift(prog);
    this.save();
    return prog;
  }

  public updateProgramme(id: string, updates: Partial<Programme>): Programme | null {
    const idx = this.data.programmes.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.programmes[idx] = { ...this.data.programmes[idx], ...updates };
    this.save();
    return this.data.programmes[idx];
  }

  public deleteProgramme(id: string): boolean {
    const idx = this.data.programmes.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.programmes.splice(idx, 1);
    this.save();
    return true;
  }

  public addProgrammeComment(programmeId: string, comment: ProgrammeComment): boolean {
    const prog = this.data.programmes.find(p => p.id === programmeId);
    if (!prog) return false;
    if (!prog.comments) prog.comments = [];
    prog.comments.push(comment);
    this.save();
    return true;
  }

  public toggleProgrammeReaction(programmeId: string, reaction: { userId: string; userName: string; emoji: string }): { reactions: ProgrammeReaction[]; userReacted: boolean } | null {
    const prog = this.data.programmes.find(p => p.id === programmeId);
    if (!prog) return null;
    if (!prog.reactions) prog.reactions = [];

    const existingIdx = prog.reactions.findIndex(r => r.userId === reaction.userId);
    let userReacted = true;

    if (existingIdx !== -1) {
      if (prog.reactions[existingIdx].emoji === reaction.emoji) {
        // Remove reaction
        prog.reactions.splice(existingIdx, 1);
        userReacted = false;
      } else {
        // Change emoji
        prog.reactions[existingIdx].emoji = reaction.emoji;
      }
    } else {
      // Add reaction
      prog.reactions.push({
        ...reaction,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
    return { reactions: prog.reactions, userReacted };
  }

  public updateProgrammeCotisationPayment(
    programmeId: string,
    userId: string,
    isPaid: boolean,
    amount?: number,
    markedBy?: string
  ): MemberCotisationPayment | null {
    const prog = this.data.programmes.find(p => p.id === programmeId);
    if (!prog) return null;
    if (!prog.cotisationPayments) prog.cotisationPayments = {};

    const user = this.data.users.find(u => u.id === userId);
    const existing = prog.cotisationPayments[userId];
    const defaultAmount = amount !== undefined ? amount : (existing?.amount || prog.cotisationAmount || 5000);

    const updatedPayment: MemberCotisationPayment = {
      userId,
      userName: user ? user.name : (existing?.userName || 'Mpikambana'),
      userTeamId: user ? user.teamId : (existing?.userTeamId || 'soalia'),
      userAvatarUrl: user?.avatarUrl,
      userMemberId: user?.memberId,
      amount: defaultAmount,
      isPaid,
      paidAt: isPaid ? (existing?.paidAt || new Date().toISOString()) : null,
      markedBy: isPaid ? (markedBy || 'Admin') : undefined,
    };

    prog.cotisationPayments[userId] = updatedPayment;
    this.save();
    return updatedPayment;
  }

  // --- Gallery ---
  public getGallery(teamId?: TeamId): GalleryItem[] {
    if (teamId) {
      return this.data.gallery.filter(g => g.teamId === teamId);
    }
    return this.data.gallery;
  }

  public addGalleryItem(item: GalleryItem): GalleryItem {
    this.data.gallery.unshift(item);
    this.save();
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    const idx = this.data.gallery.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.data.gallery.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Resadresaka (Messaging) ---
  public getConversationsForUser(userId: string): { conversation: Conversation; partner: User | null; lastMessage: Message | null }[] {
    const userConvs = this.data.conversations.filter(c => c.participants.includes(userId));
    return userConvs.map(c => {
      const partnerId = c.participants.find(p => p !== userId) || userId;
      const partner = this.findUserById(partnerId) || null;
      const convMessages = this.data.messages.filter(m => m.conversationId === c.id);
      const lastMessage = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
      return { conversation: c, partner, lastMessage };
    });
  }

  public getOrCreateConversation(userId1: string, userId2: string): Conversation {
    const existing = this.data.conversations.find(
      c => (c.participants[0] === userId1 && c.participants[1] === userId2) ||
           (c.participants[0] === userId2 && c.participants[1] === userId1)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      participants: [userId1, userId2],
      updatedAt: new Date().toISOString(),
    };
    this.data.conversations.push(newConv);
    this.save();
    return newConv;
  }

  public getMessagesForConversation(convId: string, requestingUserId: string): Message[] | null {
    const conv = this.data.conversations.find(c => c.id === convId);
    if (!conv) return null;
    const reqUser = this.findUserById(requestingUserId);
    if (!conv.participants.includes(requestingUserId) && reqUser?.role !== 'admin') {
      return null; // unauthorized access blocked!
    }
    return this.data.messages.filter(m => m.conversationId === convId);
  }

  public addMessage(convId: string, senderId: string, content: string): Message | null {
    const conv = this.data.conversations.find(c => c.id === convId);
    if (!conv) return null;
    const sender = this.findUserById(senderId);
    if (!sender) return null;
    if (!conv.participants.includes(senderId) && sender.role !== 'admin') return null;

    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: convId,
      senderId,
      senderName: sender.name,
      content,
      createdAt: new Date().toISOString(),
    };
    this.data.messages.push(msg);
    conv.updatedAt = msg.createdAt;
    this.save();
    return msg;
  }

  // --- Group Discussions ---
  public getGroupMessages(teamId: TeamId | 'all', requestingUser: User): GroupMessage[] | null {
    // Admin can access all groups
    // President and member can access their assigned team or 'all' group
    if (requestingUser.role !== 'admin' && teamId !== 'all' && requestingUser.teamId !== teamId) {
      return null; // Forbidden
    }
    return this.data.groupMessages.filter(g => g.teamId === teamId);
  }

  public addGroupMessage(teamId: TeamId | 'all', sender: User, content: string): GroupMessage | null {
    if (sender.role !== 'admin' && teamId !== 'all' && sender.teamId !== teamId) {
      return null;
    }
    const msg: GroupMessage = {
      id: `gmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teamId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderTeam: sender.teamId,
      content,
      createdAt: new Date().toISOString(),
    };
    this.data.groupMessages.push(msg);
    this.save();
    return msg;
  }

  // --- Finances ---
  public getTransactions(filters?: { teamId?: TeamId; type?: string }): Transaction[] {
    let list = this.data.transactions;
    if (filters?.teamId) {
      list = list.filter(t => t.teamId === filters.teamId);
    }
    if (filters?.type) {
      list = list.filter(t => t.type === filters.type);
    }
    return list;
  }

  public addTransaction(tx: Transaction): Transaction {
    this.data.transactions.unshift(tx);
    this.save();
    return tx;
  }

  public deleteTransaction(id: string): boolean {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.transactions.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Settings ---
  public getSettings(): SettingsDoc {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SettingsDoc>): SettingsDoc {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }
}

export const db = new Database();
