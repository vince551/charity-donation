import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { z } from 'zod';
import { query, pool } from './db/index.js';
import { requireAuth, requireRole, signToken } from './middleware/auth.js';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 4000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

const fallbackCampaigns = [
  { id: 'demo-1', title: 'Keep a child in school', category: 'Education', location: 'Nairobi', goal_amount: 300000, raised_amount: 182500, status: 'active' },
  { id: 'demo-2', title: 'A clinic for the community', category: 'Healthcare', location: 'Kisumu', goal_amount: 500000, raised_amount: 412000, status: 'active' },
  { id: 'demo-3', title: 'Meals for 500 families', category: 'Food', location: 'Nairobi', goal_amount: 150000, raised_amount: 97500, status: 'active' }
];

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'KVD API', version: '2.0.0', database: Boolean(pool) }));

app.get('/api/config/public', (_req, res) => res.json({
  brand: 'KVD — Kindred Vince Donations', currency: 'KES',
  payment: { provider: 'mpesa', mode: process.env.MPESA_MODE || 'manual' }
}));

app.get('/api/campaigns', async (req, res, next) => {
  try {
    if (!pool) return res.json({ data: fallbackCampaigns });
    const values = [];
    const where = ["status = 'active'"];
    if (req.query.category) { values.push(req.query.category); where.push(`category = $${values.length}`); }
    if (req.query.search) { values.push(`%${req.query.search}%`); where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`); }
    const result = await query(`SELECT id,title,description,category,location,goal_amount,raised_amount,status,end_date,created_at FROM campaigns WHERE ${where.join(' AND ')} ORDER BY created_at DESC`, values);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

app.get('/api/campaigns/:id', async (req, res, next) => {
  try {
    if (!pool) {
      const item = fallbackCampaigns.find(c => c.id === req.params.id);
      return item ? res.json({ data: item }) : res.status(404).json({ error: 'Campaign not found' });
    }
    const result = await query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(100),
  role: z.enum(['donor', 'charity', 'volunteer']).default('donor')
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Use a valid name, email and password of at least 8 characters.' });
    if (!pool) return res.status(503).json({ error: 'Database is not configured. Add DATABASE_URL before enabling accounts.' });
    const { fullName, email, password, role } = parsed.data;
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount) return res.status(409).json({ error: 'An account with that email already exists.' });
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 12);
    const result = await query('INSERT INTO users(id,full_name,email,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING id,full_name,email,role,verified', [id, fullName, email.toLowerCase(), hash, role]);
    const user = result.rows[0];
    res.status(201).json({ data: { user, token: signToken(user) } });
  } catch (error) { next(error); }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success || !pool) return res.status(401).json({ error: 'Invalid credentials' });
    const result = await query('SELECT id,full_name,email,password_hash,role,verified FROM users WHERE email = $1', [parsed.data.email.toLowerCase()]);
    if (!result.rowCount || !(await bcrypt.compare(parsed.data.password, result.rows[0].password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
    const { password_hash, ...user } = result.rows[0];
    res.json({ data: { user, token: signToken(user) } });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    if (!pool) return res.json({ data: req.user });
    const result = await query('SELECT id,full_name,email,role,verified,created_at FROM users WHERE id = $1', [req.user.sub]);
    if (!result.rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

const donationSchema = z.object({
  campaignId: z.string().min(1), amount: z.coerce.number().min(10).max(10000000),
  donorName: z.string().trim().min(2).max(100), phone: z.string().trim().regex(/^\+?2547\d{8}$/),
  reference: z.string().trim().min(3).max(80).optional()
});

app.post('/api/donations', async (req, res, next) => {
  try {
    const parsed = donationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid donation details. Use a valid Kenyan M-Pesa number.' });
    if (!pool) return res.status(503).json({ error: 'Database is not configured. Donation checkout is disabled until DATABASE_URL is set.' });
    const { campaignId, amount, donorName, phone, reference } = parsed.data;
    if (reference) {
      const duplicate = await query('SELECT id,status FROM donations WHERE transaction_reference = $1', [reference]);
      if (duplicate.rowCount) return res.status(409).json({ error: 'This transaction reference has already been submitted.', data: duplicate.rows[0] });
    }
    const id = crypto.randomUUID();
    const result = await query('INSERT INTO donations(id,campaign_id,amount,transaction_reference,status) VALUES($1,$2,$3,$4,$5) RETURNING id,campaign_id,amount,currency,transaction_reference,status,created_at', [id, campaignId, amount, reference || null, 'pending']);
    res.status(201).json({ data: result.rows[0], message: 'Donation recorded as pending. Verify the M-Pesa transaction before counting funds.' });
  } catch (error) { next(error); }
});

app.get('/api/donations', requireAuth, requireRole('admin', 'charity'), async (_req, res, next) => {
  try {
    if (!pool) return res.json({ data: [] });
    const result = await query('SELECT id,campaign_id,amount,currency,transaction_reference,status,created_at FROM donations ORDER BY created_at DESC LIMIT 100');
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`KVD API running on port ${port}`));
