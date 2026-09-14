import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, Role } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cropcare-ai-secure-jwt-token-key-prod-2026';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export class Security {
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static generateToken(user: User): string {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      return null;
    }
  }

  public static authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = Security.verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }

    req.user = payload;
    next();
  }

  public static optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = Security.verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  }

  public static requireRole(requiredRole: Role) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        res.status(403).json({ error: `Access denied. Requires '${requiredRole}' permissions.` });
        return;
      }

      next();
    };
  }
}
