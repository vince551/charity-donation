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
import { initiateStkPush, normalizePhone, createReceiptNumber } from './mpesa.js';

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

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'KVD API', version: '3.0.0', database: Boolean(pool), mpesa: Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET) }));
app.get('/api/config/public', (_req, res) => res.json({ brand: 'KVD — Kindred Vince Donations', currency: 'KES', payment: { provider: 'mpesa', mode: process.env.MPESA_MODE || 'sandbox' } }));

app.get('/api/campaigns', async (req, res, next) => {
  try {
    if (!pool) return res.json({ data: fallbackCampaigns });
    const values = []; const where = ["status = 'active'"];
    if (req.query.category) { values.push(req.query.category); where.push(`category = $${values.length}`); }
    if (req.query.search) { values.push(`%${req.query.search}%`); where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`); }
    const result = await query(`SELECT id,title,description,category,location,goal_amount,raised_amount,status,end_date,created_at FROM campaigns WHERE ${where.join(' AND ')} ORDER BY created_at DESC`, values);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});
app.get('/api/campaigns/:id', async (req, res, next) => {
  try {
    if (!pool) { const item = fallbackCampaigns.find(c => c.id === req.params.id); return item ? res.json({ data: item }) : res.status(404).json({ error: 'Campaign not found' }); }
    const result = await query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

const registerSchema = z.object({ fullName: z.string().trim().min(2).max(120), email: z.string().trim().email().max(180), password: z.string().min(8).max(100), role: z.enum(['donor', 'charity', 'volunteer']).default('donor') });
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Use a valid name, email and password of at least 8 characters.' });
    if (!pool) return res.status(503).json({ error: 'Database is not configured. Add DATABASE_URL before enabling accounts.' });
    const { fullName, email, password, role } = parsed.data;
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]); if (existing.rowCount) return res.status(409).json({ error: 'An account with that email already exists.' });
    const id = crypto.randomUUID(); const hash = await bcrypt.hash(password, 12);
    const result = await query('INSERT INTO users(id,full_name,email,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING id,full_name,email,role,verified', [id, fullName, email.toLowerCase(), hash, role]);
    const user = result.rows[0]; res.status(201).json({ data: { user, token: signToken(user) } });
  } catch (error) { next(error); }
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body); if (!parsed.success || !pool) return res.status(401).json({ error: 'Invalid credentials' });
    const result = await query('SELECT id,full_name,email,password_hash,role,verified FROM users WHERE email = $1', [parsed.data.email.toLowerCase()]);
    if (!result.rowCount || !(await bcrypt.compare(parsed.data.password, result.rows[0].password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
    const { password_hash, ...user } = result.rows[0]; res.json({ data: { user, token: signToken(user) } });
  } catch (error) { next(error); }
});
app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try { if (!pool) return res.json({ data: req.user }); const result = await query('SELECT id,full_name,email,role,verified,created_at FROM users WHERE id = $1', [req.user.sub]); if (!result.rowCount) return res.status(404).json({ error: 'User not found' }); res.json({ data: result.rows[0] }); } catch (error) { next(error); }
});

const donationSchema = z.object({ campaignId: z.string().min(1), amount: z.coerce.number().int().min(10).max(10000000), donorName: z.string().trim().min(2).max(100), donorPhone: z.string().trim().min(10).max(20), donorEmail: z.string().trim().email().max(180).optional().or(z.literal('')) });

app.post('/api/donations/stk-push', async (req, res, next) => {
  try {
    const parsed = donationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid donation details.' });
    if (!pool) return res.status(503).json({ error: 'Database is not configured. Add DATABASE_URL before enabling live donations.' });
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY || !process.env.MPESA_CALLBACK_URL) return res.status(503).json({ error: 'M-Pesa is not configured on the server yet.' });
    const { campaignId, amount, donorName, donorPhone, donorEmail } = parsed.data;
    const campaign = await query("SELECT id,title,status FROM campaigns WHERE id = $1 AND status = 'active'", [campaignId]);
    if (!campaign.rowCount) return res.status(404).json({ error: 'Campaign not found or not active.' });
    const phone = normalizePhone(donorPhone);
    const donationId = crypto.randomUUID();
    await query('INSERT INTO donations(id,campaign_id,donor_name,donor_phone,donor_email,amount,status) VALUES($1,$2,$3,$4,$5,$6,$7)', [donationId,campaignId,donorName,phone,donorEmail || null,amount,'pending']);
    try {
      const mpesa = await initiateStkPush({ amount, phone, accountReference: `KVD${donationId.slice(0,8)}`, transactionDesc: 'KVD Donation' });
      if (!mpesa.CheckoutRequestID) throw new Error(mpesa.errorMessage || 'M-Pesa did not return a CheckoutRequestID.');
      await query('UPDATE donations SET merchant_request_id=$1, checkout_request_id=$2, result_description=$3 WHERE id=$4', [mpesa.MerchantRequestID || null,mpesa.CheckoutRequestID,mpesa.ResponseDescription || 'STK push initiated',donationId]);
      return res.status(201).json({ data: { donationId, checkoutRequestId: mpesa.CheckoutRequestID, customerMessage: mpesa.CustomerMessage || 'Check your phone and enter your M-Pesa PIN.' } });
    } catch (error) {
      await query('UPDATE donations SET status=$1,result_description=$2 WHERE id=$3', ['failed', error.message, donationId]);
      throw error;
    }
  } catch (error) { next(error); }
});

app.post('/api/mpesa/callback', async (req, res, next) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body?.CheckoutRequestID) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    if (!pool) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const donation = await query('SELECT id,campaign_id,amount,status FROM donations WHERE checkout_request_id=$1', [body.CheckoutRequestID]);
    if (!donation.rowCount) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const d = donation.rows[0];
    if (d.status === 'confirmed') return res.json({ ResultCode: 0, ResultDesc: 'Already processed' });
    const items = Object.fromEntries((body.CallbackMetadata?.Item || []).map(item => [item.Name, item.Value]));
    if (Number(body.ResultCode) !== 0) {
      await query('UPDATE donations SET status=$1,result_code=$2,result_description=$3 WHERE id=$4', ['failed',Number(body.ResultCode),body.ResultDesc || 'Payment failed',d.id]);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    const mpesaReceipt = String(items.MpesaReceiptNumber || '');
    const paidAmount = Number(items.Amount || 0);
    if (!mpesaReceipt || paidAmount !== Number(d.amount)) {
      await query('UPDATE donations SET status=$1,result_code=$2,result_description=$3 WHERE id=$4', ['failed',-2,'Payment verification mismatch',d.id]);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT id FROM donations WHERE mpesa_receipt_number=$1 AND id<>$2', [mpesaReceipt,d.id]);
      if (existing.rowCount) throw new Error('Duplicate M-Pesa receipt detected.');
      await client.query('UPDATE donations SET status=$1,result_code=$2,result_description=$3,mpesa_receipt_number=$4,transaction_reference=$4,confirmed_at=NOW() WHERE id=$5', ['confirmed',Number(body.ResultCode),body.ResultDesc || 'Success',mpesaReceipt,d.id]);
      await client.query('UPDATE campaigns SET raised_amount=raised_amount+$1 WHERE id=$2', [d.amount,d.campaign_id]);
      await client.query('INSERT INTO receipts(donation_id,receipt_number) VALUES($1,$2) ON CONFLICT (donation_id) DO NOTHING', [d.id,createReceiptNumber()]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) { next(error); }
});

app.get('/api/donations/:id/status', async (req, res, next) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database is not configured.' });
    const result = await query(`SELECT d.id,d.status,d.amount,d.currency,d.mpesa_receipt_number,d.transaction_reference,d.result_description,d.confirmed_at,r.receipt_number,c.title AS campaign_title FROM donations d JOIN campaigns c ON c.id=d.campaign_id LEFT JOIN receipts r ON r.donation_id=d.id WHERE d.id=$1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Donation not found.' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

app.get('/api/receipts/:receiptNumber', async (req, res, next) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database is not configured.' });
    const result = await query(`SELECT r.receipt_number,r.issued_at,d.donor_name,d.donor_phone,d.donor_email,d.amount,d.currency,d.mpesa_receipt_number,d.confirmed_at,c.title AS campaign_title,c.location FROM receipts r JOIN donations d ON d.id=r.donation_id JOIN campaigns c ON c.id=d.campaign_id WHERE r.receipt_number=$1 AND d.status='confirmed'`, [req.params.receiptNumber]);
    if (!result.rowCount) return res.status(404).json({ error: 'Receipt not found.' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

app.post('/api/donations', async (req, res) => res.status(410).json({ error: 'Use /api/donations/stk-push for M-Pesa donations.' }));
app.get('/api/donations', requireAuth, requireRole('admin', 'charity'), async (_req, res, next) => {
  try { if (!pool) return res.json({ data: [] }); const result = await query('SELECT id,campaign_id,donor_name,donor_phone,amount,currency,mpesa_receipt_number,status,created_at,confirmed_at FROM donations ORDER BY created_at DESC LIMIT 100'); res.json({ data: result.rows }); } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: error.message || 'Internal server error' }); });
app.listen(port, () => console.log(`KVD API running on port ${port}`));
