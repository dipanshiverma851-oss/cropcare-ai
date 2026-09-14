import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { Security, AuthenticatedRequest } from '../core/security.js';
import { User } from '../types.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, farmName, location, role } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Please provide full name, email, and password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await Security.hashPassword(password);
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      role: assignedRole,
      farmName: farmName ? farmName.trim() : undefined,
      location: location ? location.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);
    const token = Security.generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Something went wrong while creating your account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const valid = await Security.verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = Security.generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong during login. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await db.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error retrieving user session.' });
  }
});

export default router;
