import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, User, TeamId, Song, Programme, GalleryItem, Transaction } from './db.ts';
import {
  authenticate,
  requireAdmin,
  generateToken,
  hashPassword,
  verifyPassword,
  AuthenticatedRequest,
} from './auth.ts';

const router = Router();

// Configure Multer for media uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for audio tracks and media
});

// ==========================================
// 1. AUTHENTICATION & REGISTRATION
// ==========================================

// Login (supports either email or Member ID / Code Membre)
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, identifier, memberId, password } = req.body;
  const loginId = (identifier || email || memberId || '').trim();

  if (!loginId || !password) {
    return res.status(400).json({ error: 'Mila mailaka/laharana mpikambana sy tenimiafina (Email/Member ID and password required)' });
  }

  const user = db.findUserByEmail(loginId) || db.findUserByMemberId(loginId);
  if (!user) {
    return res.status(401).json({ error: 'Mailaka/Kao-din\'ny mpikambana na tenimiafina diso (Invalid email/member code or password)' });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Mailaka na tenimiafina diso (Invalid email or password)' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Ny fangatahanao dia mbola miandry fankatoavan\'ny Admin (Your registration is pending Admin approval)',
      status: 'pending',
    });
  }

  if (user.status === 'rejected' || user.status === 'suspended') {
    return res.status(403).json({
      error: 'Kaonty nofoanana na nahantona (Your account has been rejected or suspended)',
      status: user.status,
    });
  }

  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

// Register (Default role: Member, status: Pending)
router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, teamId } = req.body;

  if (!name || !email || !password || !teamId) {
    return res.status(400).json({ error: 'Fenoy ny fampahalalana rehetra ilaina (All fields are required)' });
  }

  const validTeams: TeamId[] = ['soalia', 'mpiantsa', 'tomima', 'asafa'];
  if (!validTeams.includes(teamId)) {
    return res.status(400).json({ error: 'Ekipa tsy manankery (Invalid team selected)' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Efa misy mampiasa ity mailaka ity (Email already registered)' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    role: 'member', // Public registration is ALWAYS member!
    teamId,
    status: 'pending', // Requires Admin approval
    memberId: null,
    qrCodeToken: null,
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150`,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
  };

  db.addUser(newUser);

  return res.status(201).json({
    message: 'Tafiditra soa aman-tsara ny fangatahanao. Miandry fankatoavan\'ny Admin. (Registration submitted. Awaiting Admin approval)',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      teamId: newUser.teamId,
      status: newUser.status,
    },
  });
});

// Current User Profile
router.get('/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash, ...safeUser } = req.user!;
  return res.json({ user: safeUser });
});

// Update Profile (Any logged in user can edit name and profile image)
router.patch('/auth/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { name, avatarUrl } = req.body;

  const updates: Partial<User> = {};
  if (typeof name === 'string' && name.trim().length > 0) {
    updates.name = name.trim();
  }
  if (typeof avatarUrl === 'string' && avatarUrl.trim().length > 0) {
    updates.avatarUrl = avatarUrl.trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Tsy misy fanovana nampidirina (No changes provided)' });
  }

  const updated = db.updateUser(currentUser.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Mpandray anjara tsy hita' });
  }

  const { passwordHash, ...safeUser } = updated;
  return res.json({
    message: 'Voaray soa aman-tsara ny fanovana momba ny profil-nao',
    user: safeUser,
  });
});

// ==========================================
// 2. MEMBER MANAGEMENT & APPROVAL
// ==========================================

// Get all members (Admin gets all, President gets only their team)
router.get('/members', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const allUsers = db.getAllUsers().map(({ passwordHash, ...u }) => u);

  if (currentUser.role === 'admin') {
    return res.json(allUsers);
  } else if (currentUser.role === 'president') {
    return res.json(allUsers.filter(u => u.teamId === currentUser.teamId));
  } else {
    // Member only gets public member list of their own team (minimal info)
    return res.json(allUsers.filter(u => u.teamId === currentUser.teamId && u.status === 'active').map(u => ({
      id: u.id,
      name: u.name,
      teamId: u.teamId,
      role: u.role,
      memberId: u.memberId,
      avatarUrl: u.avatarUrl,
    })));
  }
});

// Get Pending Registrations (Admin only)
router.get('/members/pending', authenticate, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const pending = db.getAllUsers()
    .filter(u => u.status === 'pending')
    .map(({ passwordHash, ...u }) => u);
  return res.json(pending);
});

// Approve Registration (Admin only)
// Automatically generates unique Member ID, digital badge token, and QR code verification data!
router.post('/members/:id/approve', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = db.findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Mpikambana tsy hita (Member not found)' });
  }

  // Generate unique Member ID: ASAFA-2026-[TEAM]-[SEQ]
  const teamPrefixMap: Record<TeamId, string> = {
    soalia: 'SOA',
    mpiantsa: 'MPI',
    tomima: 'TOM',
    asafa: 'ASA',
  };
  const prefix = teamPrefixMap[user.teamId] || 'MEM';
  const existingTeamMembers = db.getAllUsers().filter(u => u.teamId === user.teamId && u.memberId);
  const nextSeq = String(existingTeamMembers.length + 1).padStart(3, '0');
  const generatedMemberId = `ASAFA-2026-${prefix}-${nextSeq}`;

  // Generate opaque, secure verification token
  const qrVerificationToken = `v-tok-${crypto.randomBytes(16).toString('hex')}`;

  const updated = db.updateUser(id, {
    status: 'active',
    memberId: user.memberId || generatedMemberId,
    qrCodeToken: qrVerificationToken,
    approvedAt: new Date().toISOString(),
    approvedBy: req.user!.id,
  });

  const { passwordHash, ...safe } = updated!;
  return res.json({
    message: 'Nankatoavina soa aman-tsara ny mpikambana. Noforonina ho azy ny Karatra sy QR Code. (Member approved. Member ID and QR badge generated)',
    user: safe,
  });
});

// Reject Registration (Admin only)
router.post('/members/:id/reject', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = db.findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Mpikambana tsy hita' });
  }

  const updated = db.updateUser(id, {
    status: 'rejected',
    approvedAt: null,
  });

  const { passwordHash, ...safe } = updated!;
  return res.json({ message: 'Nolavina ny fangatahana (Registration rejected)', user: safe });
});

// Change Status (Active, Suspended) (Admin only)
router.patch('/members/:id/status', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Toe-javatra tsy manankery (Invalid status)' });
  }

  const updated = db.updateUser(id, { status });
  if (!updated) return res.status(404).json({ error: 'Member not found' });

  const { passwordHash, ...safe } = updated;
  return res.json({ message: 'Novaina ny toe-javatra', user: safe });
});

// ==========================================
// 3. PUBLIC QR CODE VERIFICATION ENDPOINT
// ==========================================
router.get('/verify-qr/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ valid: false, message: 'Tsy misy token (Missing token)' });
  }

  const user = db.findUserByQrToken(token);
  if (!user) {
    return res.status(404).json({
      valid: false,
      message: 'Karatra tsy manankery na tsy hita ao amin\'ny lisitra ofisialy ASAFA (Invalid or non-existent membership card)',
    });
  }

  if (user.status !== 'active') {
    return res.status(403).json({
      valid: false,
      status: user.status,
      message: `Ity karatra ity dia tsy mavitrika na efa nahantona (${user.status}) (This membership card is not active or has been suspended/rejected)`,
      memberId: user.memberId,
      name: user.name,
    });
  }

  const teams = db.getTeams();
  const team = teams.find(t => t.id === user.teamId);

  return res.json({
    valid: true,
    organization: 'ASAFA (Fikambanana Ofisialy)',
    name: user.name,
    memberId: user.memberId,
    teamId: user.teamId,
    teamName: team?.name || user.teamId.toUpperCase(),
    role: user.role,
    status: user.status,
    phone: user.phone,
    approvedAt: user.approvedAt,
    avatarUrl: user.avatarUrl,
    officialSeal: 'HOMOLOGUÉ ET VALIDÉ PAR LE BUREAU CENTRAL ASAFA',
    verifiedTimestamp: new Date().toISOString(),
  });
});

// ==========================================
// 4. TEAMS
// ==========================================
router.get('/teams', (_req: Request, res: Response) => {
  return res.json(db.getTeams());
});

// ==========================================
// 5. CHANTS (SONGS)
// ==========================================
router.get('/songs', (req: Request, res: Response) => {
  const { teamId, search, category } = req.query;
  const songs = db.getSongs({
    teamId: teamId as string,
    search: search as string,
    category: category as string,
  });
  return res.json(songs);
});

router.post('/songs', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { title, teamId, category, number, keySignature, author, lyrics, audioUrl, duration } = req.body;

  if (!title || !lyrics) {
    return res.status(400).json({ error: 'Mila lohateny sy tononkira (Title and lyrics required)' });
  }

  // Authorization: Admin can add for any team; President can only add for their team!
  const targetTeam = teamId || currentUser.teamId;
  if (currentUser.role === 'member') {
    return res.status(403).json({ error: 'Ny mpikambana tsotra dia tsy mahazo mampiditra hira (Members cannot add songs)' });
  }
  if (currentUser.role === 'president' && targetTeam !== currentUser.teamId && targetTeam !== 'all') {
    return res.status(403).json({ error: 'Tsy afaka mampiditra hira ho an\'ny ekipa hafa ianao (Presidents can only add songs for their team)' });
  }

  const newSong: Song = {
    id: `sng-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: title.trim(),
    teamId: targetTeam,
    category: category || 'Fiderana',
    number: number || '',
    keySignature: keySignature || '',
    author: author || currentUser.name,
    lyrics: lyrics.trim(),
    audioUrl: audioUrl || null,
    duration: duration || '4:30',
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
  };

  db.addSong(newSong);
  return res.status(201).json(newSong);
});

router.put('/songs/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const existing = db.getSongs().find(s => s.id === id);
  if (!existing) return res.status(404).json({ error: 'Hira tsy hita' });

  if (currentUser.role === 'member') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (currentUser.role === 'president' && existing.teamId !== currentUser.teamId) {
    return res.status(403).json({ error: 'Forbidden for another team' });
  }

  const updated = db.updateSong(id, req.body);
  return res.json(updated);
});

router.delete('/songs/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const existing = db.getSongs().find(s => s.id === id);
  if (!existing) return res.status(404).json({ error: 'Hira tsy hita' });

  if (currentUser.role === 'member') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (currentUser.role === 'president' && existing.teamId !== currentUser.teamId) {
    return res.status(403).json({ error: 'Forbidden for another team' });
  }

  db.deleteSong(id);
  return res.json({ success: true, message: 'Voafafa ny hira' });
});

// ==========================================
// 6. PROGRAMMES (FEED & EVENTS)
// ==========================================
router.get('/programmes', (req: Request, res: Response) => {
  const { teamId } = req.query;
  const programmes = db.getProgrammes(teamId as string);
  return res.json(programmes);
});

router.post('/programmes', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const {
    title,
    description,
    teamId,
    eventDate,
    eventLocation,
    attachments,
    imageUrl,
    backgroundStyle,
    hasCotisation,
    cotisationAmount,
    cotisationTitle,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Mila lohateny sy fanazavana (Title and description required)' });
  }

  const targetTeam = teamId || currentUser.teamId;
  // User explicitly specified: "only admin can do that i ean can publish" (admin only)
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Ny Mpitantana (Admin) ihany no afaka mamoaka fandaharana (Only admin can publish)' });
  }

  const isCotisationEnabled = Boolean(hasCotisation);
  const parsedAmount = Number(cotisationAmount) || 5000;
  const initialPayments: Record<string, any> = {};

  if (isCotisationEnabled) {
    const allUsers = db.getAllUsers().filter(u => u.status === 'active');
    for (const u of allUsers) {
      initialPayments[u.id] = {
        userId: u.id,
        userName: u.name,
        userTeamId: u.teamId,
        userAvatarUrl: u.avatarUrl,
        userMemberId: u.memberId,
        amount: parsedAmount,
        isPaid: false,
        paidAt: null,
      };
    }
  }

  const newProg: Programme = {
    id: `prg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: title.trim(),
    description: description.trim(),
    teamId: targetTeam,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorRole: currentUser.role,
    eventDate: eventDate || null,
    eventLocation: eventLocation || null,
    imageUrl: imageUrl || null,
    backgroundStyle: backgroundStyle || 'classic',
    attachments: attachments || [],
    comments: [],
    reactions: [],
    hasCotisation: isCotisationEnabled,
    cotisationAmount: isCotisationEnabled ? parsedAmount : undefined,
    cotisationTitle: isCotisationEnabled ? (cotisationTitle || 'Cotisation / Latsakemboka') : undefined,
    cotisationPayments: isCotisationEnabled ? initialPayments : undefined,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  db.addProgramme(newProg);
  return res.status(201).json(newProg);
});

router.delete('/programmes/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const existing = db.getProgrammes().find(p => p.id === id);
  if (!existing) return res.status(404).json({ error: 'Fandaharana tsy hita' });

  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Ny Mpitantana (Admin) ihany no afaka mamafa (Admin only)' });
  }

  db.deleteProgramme(id);
  return res.json({ success: true, message: 'Voafafa ny fandaharana' });
});

// Get Cotisation status for all members in a programme
router.get('/programmes/:id/cotisations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const prog = db.getProgrammes().find(p => p.id === id);
  if (!prog) return res.status(404).json({ error: 'Fandaharana tsy hita' });

  const amountPerMember = prog.cotisationAmount || 5000;
  const allActiveUsers = db.getAllUsers().filter(u => u.status === 'active');
  const existingPayments = prog.cotisationPayments || {};

  // Build full members list merging active users
  const members = allActiveUsers.map(u => {
    const existing = existingPayments[u.id];
    return {
      userId: u.id,
      name: u.name,
      teamId: u.teamId,
      memberId: u.memberId,
      avatarUrl: u.avatarUrl,
      isPaid: existing ? Boolean(existing.isPaid) : false,
      amount: existing ? existing.amount : amountPerMember,
      paidAt: existing?.paidAt || null,
      markedBy: existing?.markedBy || null,
    };
  });

  const paidCount = members.filter(m => m.isPaid).length;
  const totalCount = members.length;
  const totalCollected = members.filter(m => m.isPaid).reduce((sum, m) => sum + m.amount, 0);

  return res.json({
    programmeId: prog.id,
    programmeTitle: prog.title,
    eventDate: prog.eventDate,
    hasCotisation: prog.hasCotisation,
    cotisationTitle: prog.cotisationTitle || 'Cotisation',
    cotisationAmount: amountPerMember,
    members,
    totalCount,
    paidCount,
    totalCollected,
  });
});

// Mark / Unmark Member Cotisation as Paid (Admin only)
router.patch('/programmes/:id/cotisations/:userId', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id, userId } = req.params;
  const { isPaid, amount } = req.body;

  const prog = db.getProgrammes().find(p => p.id === id);
  if (!prog) return res.status(404).json({ error: 'Fandaharana tsy hita' });

  const targetUser = db.findUserById(userId);
  if (!targetUser) return res.status(404).json({ error: 'Mpikambana tsy hita' });

  const updatedPayment = db.updateProgrammeCotisationPayment(
    id,
    userId,
    Boolean(isPaid),
    amount !== undefined ? Number(amount) : undefined,
    currentUser.name
  );

  // If marked as paid, record into finance ledger
  if (isPaid) {
    const paidAmt = amount !== undefined ? Number(amount) : (prog.cotisationAmount || 5000);
    const txDescription = `Latsakemboka: ${prog.title} — ${targetUser.name} (${targetUser.teamId.toUpperCase()})`;
    // Check if similar transaction exists
    const txDate = new Date().toISOString().split('T')[0];
    db.addTransaction({
      id: `tx-cot-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      type: 'contribution',
      teamId: targetUser.teamId,
      amount: paidAmt,
      currency: 'MGA',
      category: 'Latsakemboka / Cotisation',
      description: txDescription,
      date: txDate,
      receiptUrl: null,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
    });
  }

  return res.json({
    message: isPaid ? 'Voamarika ho Voaloa (Payé) ny latsakemboka' : 'Nofoanana ny fandoavana latsakemboka',
    payment: updatedPayment,
  });
});

router.post('/programmes/:id/comments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Mila soratana ny fanehoan-kevitra (Comment content required)' });
  }

  const comment = {
    id: `cmt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorRole: currentUser.role,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  const success = db.addProgrammeComment(id, comment);
  if (!success) return res.status(404).json({ error: 'Fandaharana tsy hita' });

  return res.status(201).json(comment);
});

// React to a programme post (anyone logged in can react ❤️ 👍 🙏 🔥 👏)
router.post('/programmes/:id/react', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({ error: 'Emoji required' });
  }

  const result = db.toggleProgrammeReaction(id, {
    userId: currentUser.id,
    userName: currentUser.name,
    emoji,
  });

  if (!result) {
    return res.status(404).json({ error: 'Fandaharana tsy hita' });
  }

  return res.json(result);
});

// ==========================================
// 7. GALERIE
// ==========================================
router.get('/gallery', (req: Request, res: Response) => {
  const { teamId } = req.query;
  const items = db.getGallery(teamId as TeamId);
  return res.json(items);
});

router.post('/gallery', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { teamId, title, caption, mediaType, mediaUrl, eventDate } = req.body;

  if (!teamId || !title || !mediaUrl) {
    return res.status(400).json({ error: 'Mila ekipa, lohateny ary sary/videô (Team, title, and media URL required)' });
  }

  if (currentUser.role === 'member') {
    return res.status(403).json({ error: 'Ny mpikambana dia tsy afaka mampiditra sary ao amin\'ny galeria' });
  }
  if (currentUser.role === 'president' && teamId !== currentUser.teamId) {
    return res.status(403).json({ error: 'Tsy afaka mampiditra sary amin\'ny ekipa hafa' });
  }

  const item: GalleryItem = {
    id: `gal-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    teamId,
    title: title.trim(),
    caption: caption || '',
    mediaType: mediaType === 'video' ? 'video' : 'photo',
    mediaUrl,
    uploadedBy: currentUser.id,
    authorName: currentUser.name,
    eventDate: eventDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.addGalleryItem(item);
  return res.status(201).json(item);
});

router.delete('/gallery/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const item = db.getGallery().find(g => g.id === id);
  if (!item) return res.status(404).json({ error: 'Sary tsy hita' });

  if (currentUser.role === 'member') return res.status(403).json({ error: 'Unauthorized' });
  if (currentUser.role === 'president' && item.teamId !== currentUser.teamId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteGalleryItem(id);
  return res.json({ success: true, message: 'Voafafa ny sary' });
});

// ==========================================
// 8. RESADRESAKA (MESSAGING & GROUPS)
// ==========================================

// Get user private conversations
router.get('/messages/conversations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const list = db.getConversationsForUser(req.user!.id);
  return res.json(list);
});

// Start or get conversation with another user
router.post('/messages/conversations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Target user ID required' });

  const target = db.findUserById(targetUserId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const conv = db.getOrCreateConversation(req.user!.id, targetUserId);
  return res.json({ conversation: conv, partner: target });
});

// Get messages for conversation (Secured!)
router.get('/messages/conversations/:id/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const messages = db.getMessagesForConversation(id, req.user!.id);
  if (messages === null) {
    return res.status(403).json({ error: 'Tsy manana alalana amin\'ity resaka ity ianao (Unauthorized conversation access)' });
  }
  return res.json(messages);
});

// Send message in conversation
router.post('/messages/conversations/:id/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

  const msg = db.addMessage(id, req.user!.id, content.trim());
  if (!msg) {
    return res.status(403).json({ error: 'Tsy afaka mandefa hafatra (Failed to send message)' });
  }
  return res.status(201).json(msg);
});

// Group discussions (Team-specific or All)
router.get('/messages/groups/:teamId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params;
  const messages = db.getGroupMessages(teamId as TeamId | 'all', req.user!);
  if (messages === null) {
    return res.status(403).json({ error: 'Tsy mpikambana amin\'ity vondrona ity ianao (Not a member of this team group)' });
  }
  return res.json(messages);
});

router.post('/messages/groups/:teamId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

  const msg = db.addGroupMessage(teamId as TeamId | 'all', req.user!, content.trim());
  if (!msg) {
    return res.status(403).json({ error: 'Tsy afaka mandefa hafatra amin\'ity vondrona ity' });
  }
  return res.status(201).json(msg);
});

// ==========================================
// 9. FINANCES
// ==========================================
router.get('/finances', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { teamId, type } = req.query;

  // Enforce access control:
  let effectiveTeamId: TeamId | undefined = undefined;
  if (currentUser.role === 'admin') {
    effectiveTeamId = teamId ? (teamId as TeamId) : undefined;
  } else if (currentUser.role === 'president') {
    // President can ONLY see their assigned team!
    effectiveTeamId = currentUser.teamId;
  } else {
    // Member can only see their team summary records
    effectiveTeamId = currentUser.teamId;
  }

  const list = db.getTransactions({ teamId: effectiveTeamId, type: type as string });
  return res.json(list);
});

router.get('/finances/summary', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { teamId } = req.query;

  let targetTeamId: TeamId | undefined = undefined;
  if (currentUser.role === 'admin') {
    targetTeamId = teamId ? (teamId as TeamId) : undefined;
  } else {
    targetTeamId = currentUser.teamId;
  }

  const txs = db.getTransactions(targetTeamId ? { teamId: targetTeamId } : undefined);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalContributions = 0;

  for (const t of txs) {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') totalExpenses += t.amount;
    if (t.type === 'contribution') totalContributions += t.amount;
  }

  const netBalance = totalIncome + totalContributions - totalExpenses;

  // Breakdown per team if Admin
  const breakdown: Record<string, { income: number; expenses: number; contributions: number; balance: number }> = {};
  if (currentUser.role === 'admin') {
    const teams: TeamId[] = ['soalia', 'mpiantsa', 'tomima', 'asafa'];
    for (const tid of teams) {
      const teamTxs = db.getTransactions({ teamId: tid });
      let inc = 0, exp = 0, con = 0;
      for (const t of teamTxs) {
        if (t.type === 'income') inc += t.amount;
        if (t.type === 'expense') exp += t.amount;
        if (t.type === 'contribution') con += t.amount;
      }
      breakdown[tid] = { income: inc, expenses: exp, contributions: con, balance: inc + con - exp };
    }
  }

  return res.json({
    totalIncome,
    totalExpenses,
    totalContributions,
    netBalance,
    transactionCount: txs.length,
    currency: 'MGA',
    teamId: targetTeamId || 'all',
    breakdown: currentUser.role === 'admin' ? breakdown : undefined,
  });
});

router.post('/finances', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { type, teamId, amount, currency, category, description, date, receiptUrl } = req.body;

  if (currentUser.role === 'member') {
    return res.status(403).json({ error: 'Ny mpikambana dia tsy mahazo mamorona hetsika ara-bola (Members cannot create financial records)' });
  }

  const targetTeam = teamId || currentUser.teamId;
  if (currentUser.role === 'president' && targetTeam !== currentUser.teamId) {
    return res.status(403).json({ error: 'Ny filoha dia tsy afaka mikitika ny fitantanam-bolan\'ny ekipa hafa (Presidents cannot manage other teams\' finances)' });
  }

  const parsedAmount = Number(amount);
  if (!type || isNaN(parsedAmount) || parsedAmount <= 0 || !description) {
    return res.status(400).json({ error: 'Mila vola mitombina sy fanazavana (Valid amount, type, and description required)' });
  }

  const tx: Transaction = {
    id: `tx-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    type,
    teamId: targetTeam,
    amount: parsedAmount,
    currency: currency || 'MGA',
    category: category || 'Hafa',
    description: description.trim(),
    date: date || new Date().toISOString().split('T')[0],
    receiptUrl: receiptUrl || null,
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    createdAt: new Date().toISOString(),
  };

  db.addTransaction(tx);
  return res.status(201).json(tx);
});

router.delete('/finances/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const existing = db.getTransactions().find(t => t.id === id);
  if (!existing) return res.status(404).json({ error: 'Transaction not found' });

  if (currentUser.role === 'member') return res.status(403).json({ error: 'Unauthorized' });
  if (currentUser.role === 'president' && existing.teamId !== currentUser.teamId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteTransaction(id);
  return res.json({ success: true, message: 'Voafafa ny hetsika ara-bola' });
});

// ==========================================
// 10. SETTINGS, REGULATIONS, HISTORY
// ==========================================
router.get('/settings', (_req: Request, res: Response) => {
  return res.json(db.getSettings());
});

router.put('/settings', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// ==========================================
// 11. MEDIA UPLOAD
// ==========================================
router.post('/upload', authenticate, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tsy misy rakitra nampidirina (No file uploaded)' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

// ==========================================
// 12. AUTOMATED VERIFICATION SELF-TEST
// ==========================================
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'ASAFA Mobile Full-Stack Backend',
    colors: ['#1565C0', '#0D47A1', '#FFFFFF', '#EAF3FF'],
    teams: ['SOALIA', 'MPIANTSA', 'TOMIMA', 'ASAFA'],
    roles: ['admin', 'president', 'member'],
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
