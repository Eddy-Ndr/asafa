import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db, User, UserRole } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  teamId: string;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function hashPassword(plain: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Fidirana tsy nahazoana alalana (Unauthorized: Missing token)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Mpikambana tsy hita (User not found)' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Karatra na kaonty miandry fankatoavana na tsy mavitrika (Account not active)' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Karatra na token lany daty na tsy manankery (Invalid or expired token)' });
  }
}

// Middleware to enforce Admin role
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Tsy manana fahefana Admin (Forbidden: Admin role required)' });
  }
  next();
}

// Middleware to enforce Admin or President of the specified team
export function requireAdminOrPresidentOf(getTeamId: (req: AuthenticatedRequest) => string | undefined) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'admin') {
      return next();
    }
    const targetTeamId = getTeamId(req);
    if (req.user.role === 'president' && req.user.teamId === targetTeamId) {
      return next();
    }
    return res.status(403).json({ error: 'Tsy manana alalana amin\'ity ekipa ity (Forbidden: Not authorized for this team)' });
  };
}
