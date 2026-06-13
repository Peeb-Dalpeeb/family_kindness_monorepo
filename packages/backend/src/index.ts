/**
 * Backend Entry Point — Family Kindness Tracker API
 *
 * Express server with:
 * - CORS configured for frontend dev proxy
 * - Cookie parsing for JWT HttpOnly tokens
 * - Auth routes (login/logout/status)
 * - Protected admin route group
 * - Health check endpoint
 * - MongoDB integration via Mongoose
 * - Structured Zod schema input validations
 */

import './load-env.js';
import express from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { KindnessEntryRefinedSchema, type DashboardMetrics } from '@family-kindness/shared';
import { loginHandler, logoutHandler, authStatusHandler, requireAdmin } from './middleware/auth.js';
import { UserModel } from './models/User.js';
import { KindnessEntryModel } from './models/KindnessEntry.js';

// ── Express Async Handler Wrapper ────────────────────────────

// Express async handler wrapper to satisfy @typescript-eslint/no-misused-promises
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ── App Initialization ───────────────────────────────────────

const app = express();
const PORT = process.env['PORT'] ?? '3001';
const MONGODB_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/family-kindness';

// ── MongoDB Connection & Seeding ──────────────────────────────

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('[backend] ✓ Connected to MongoDB');
    await seedDatabase();
  })
  .catch((err: unknown) => {
    console.error('[backend] ✗ MongoDB connection error:', err);
  });

async function seedDatabase(): Promise<void> {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[backend] Seeding default family members...');
      const seedUsers = [
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d1'),
          name: 'Mom (Sarah)',
          avatar: '👩‍💼',
          color: '#8B5CF6',
          role: 'admin',
        },
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d2'),
          name: 'Dad (Michael)',
          avatar: '👨‍🍳',
          color: '#3B82F6',
          role: 'admin',
        },
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d3'),
          name: 'Leo',
          avatar: '👦',
          color: '#F59E0B',
          role: 'standard',
        },
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d4'),
          name: 'Maya',
          avatar: '👧',
          color: '#EC4899',
          role: 'standard',
        },
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d5'),
          name: 'Grandpa (Thomas)',
          avatar: '👴',
          color: '#10B981',
          role: 'standard',
        },
        {
          _id: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d6'),
          name: 'Grandma (Elena)',
          avatar: '👵',
          color: '#6366F1',
          role: 'standard',
        },
      ];
      await UserModel.insertMany(seedUsers);
      console.log('[backend] ✓ Default family members seeded.');
    }

    const logCount = await KindnessEntryModel.countDocuments();
    if (logCount === 0) {
      console.log('[backend] Seeding default kindness entries...');
      const seedEntries = [
        {
          submittedBy: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d1'), // mom
          beneficiary: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d3'), // leo
          category: 'Kind Words',
          pointsAwarded: 10,
          description:
            'Leo, thank you for sharing your favorite building blocks with your younger sister Maya today without being prompted. It was marvelous to watch you guys cooperate!',
          timestamp: new Date(Date.now() - 3 * 3600 * 1000),
        },
        {
          submittedBy: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d3'), // leo
          beneficiary: new mongoose.Types.ObjectId('60d5ec493d8b4c2e6462b5d6'), // grandma
          category: 'Helping Hand',
          pointsAwarded: 20,
          description:
            'Leo spent 15 minutes helping Grandma Grandma move her heavy clay flower pots back into the veranda before the sudden rainstorm started.',
          timestamp: new Date(Date.now() - 17 * 3600 * 1000),
        },
      ];
      await KindnessEntryModel.insertMany(seedEntries);
      console.log('[backend] ✓ Default kindness entries seeded.');
    }
  } catch (err: unknown) {
    console.error('[backend] ✗ Seeding failed:', err);
  }
}

// ── Aggregation Helper ────────────────────────────────────────

async function getHouseholdMetrics(
  kindnessModel: typeof KindnessEntryModel,
): Promise<DashboardMetrics> {
  const result = await kindnessModel.aggregate<DashboardMetrics>([
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$pointsAwarded' },
        totalLogs: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalPoints: 1,
        totalLogs: 1,
        completedMilestones: { $floor: { $divide: ['$totalPoints', 1000] } },
        currentProgressPoints: { $mod: ['$totalPoints', 1000] },
      },
    },
    {
      $project: {
        totalPoints: 1,
        totalLogs: 1,
        completedMilestones: 1,
        currentProgressPoints: 1,
        percentage: { $floor: { $multiply: [{ $divide: ['$currentProgressPoints', 1000] }, 100] } },
      },
    },
  ]);

  return (
    result[0] || {
      totalPoints: 0,
      completedMilestones: 0,
      currentProgressPoints: 0,
      percentage: 0,
      totalLogs: 0,
    }
  );
}

// ── Global Middleware ────────────────────────────────────────

app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true, // Required for HttpOnly cookie transport
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── Health Check ─────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Public Routes ────────────────────────────────────────────

// GET /api/users — Public list of seed users for dropdowns
app.get(
  '/api/users',
  asyncHandler(async (_req, res) => {
    const users = await UserModel.find();
    const mappedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      avatar: u.avatar,
      color: u.color,
      role: u.role,
    }));
    res.json(mappedUsers);
    return;
  }),
);

// GET /api/meter-status — Public dashboard metrics
app.get(
  '/api/meter-status',
  asyncHandler(async (_req, res) => {
    const metrics = await getHouseholdMetrics(KindnessEntryModel);
    res.json(metrics);
    return;
  }),
);

// POST /api/logs — Public kindness log submission
app.post(
  '/api/logs',
  asyncHandler(async (req, res) => {
    const parsed = KindnessEntryRefinedSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { submittedBy, beneficiary, category, pointsAwarded, description } = parsed.data;

    // Verify both users exist in MongoDB
    const [submitterExists, beneficiaryExists] = await Promise.all([
      UserModel.findById(submittedBy),
      UserModel.findById(beneficiary),
    ]);

    if (!submitterExists || !beneficiaryExists) {
      res.status(400).json({
        success: false,
        message: 'One or both family members do not exist.',
      });
      return;
    }

    // Resolve server-side points based on deterministic rules
    let resolvedPoints = pointsAwarded;
    if (category === 'Kind Words') {
      resolvedPoints = 10;
    } else if (category === 'Showing Gratitude') {
      resolvedPoints = 15;
    } else if (category === 'Helping Hand') {
      resolvedPoints = 20;
    }

    const newEntry = new KindnessEntryModel({
      submittedBy,
      beneficiary,
      category,
      pointsAwarded: resolvedPoints,
      description,
      timestamp: new Date(),
    });

    await newEntry.save();

    res.status(201).json({
      success: true,
      data: {
        id: newEntry._id.toString(),
        submittedBy: newEntry.submittedBy.toString(),
        beneficiary: newEntry.beneficiary.toString(),
        category: newEntry.category,
        pointsAwarded: newEntry.pointsAwarded,
        description: newEntry.description,
        timestamp: newEntry.timestamp.getTime(),
      },
    });
    return;
  }),
);

// ── Authentication Routes ────────────────────────────────────

app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.get('/api/auth/status', authStatusHandler);

// ── Protected Admin Routes ───────────────────────────────────

app.get(
  '/api/admin/logs',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const entries = await KindnessEntryModel.find().sort({ timestamp: -1 });
    const mappedEntries = entries.map((entry) => ({
      id: entry._id.toString(),
      submittedBy: entry.submittedBy.toString(),
      beneficiary: entry.beneficiary.toString(),
      category: entry.category,
      pointsAwarded: entry.pointsAwarded,
      description: entry.description,
      timestamp: entry.timestamp.getTime(),
    }));
    res.json(mappedEntries);
    return;
  }),
);

app.put(
  '/api/logs/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parsed = KindnessEntryRefinedSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { submittedBy, beneficiary, category, pointsAwarded, description } = parsed.data;

    // Verify both users exist
    const [submitterExists, beneficiaryExists] = await Promise.all([
      UserModel.findById(submittedBy),
      UserModel.findById(beneficiary),
    ]);

    if (!submitterExists || !beneficiaryExists) {
      res.status(400).json({
        success: false,
        message: 'One or both family members do not exist.',
      });
      return;
    }

    // Resolve server-side points
    let resolvedPoints = pointsAwarded;
    if (category === 'Kind Words') {
      resolvedPoints = 10;
    } else if (category === 'Showing Gratitude') {
      resolvedPoints = 15;
    } else if (category === 'Helping Hand') {
      resolvedPoints = 20;
    }

    const updatedEntry = await KindnessEntryModel.findByIdAndUpdate(
      id,
      {
        submittedBy,
        beneficiary,
        category,
        pointsAwarded: resolvedPoints,
        description,
      },
      { new: true },
    );

    if (!updatedEntry) {
      res.status(404).json({
        success: false,
        message: 'Log entry not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedEntry._id.toString(),
        submittedBy: updatedEntry.submittedBy.toString(),
        beneficiary: updatedEntry.beneficiary.toString(),
        category: updatedEntry.category,
        pointsAwarded: updatedEntry.pointsAwarded,
        description: updatedEntry.description,
        timestamp: updatedEntry.timestamp.getTime(),
      },
    });
    return;
  }),
);

app.delete(
  '/api/logs/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedEntry = await KindnessEntryModel.findByIdAndDelete(id);
    if (!deletedEntry) {
      res.status(404).json({
        success: false,
        message: 'Log entry not found.',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Log entry deleted successfully.',
    });
    return;
  }),
);

// ── Global Error Handler Middleware ───────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[backend] ✗ Global error caught:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: errorMessage,
  });
});

// ── Server Start ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[backend] ✓ Server running on http://localhost:${PORT}`);
  console.log(`[backend] ✓ Health check: http://localhost:${PORT}/api/health`);
});

