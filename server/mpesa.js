import crypto from 'node:crypto';

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function normalizePhone(input) {
  const raw = String(input || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (/^07\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error('Use a valid Kenyan M-Pesa number, e.g. 0712345678.');
}

async function parseJson(response) {
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!response.ok) throw new Error(data.errorMessage || data.error || `M-Pesa API returned ${response.status}`);
  return data;
}

export async function getAccessToken() {
  const key = required('MPESA_CONSUMER_KEY');
  const secret = required('MPESA_CONSUMER_SECRET');
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  const data = await parseJson(response);
  if (!data.access_token) throw new Error('M-Pesa OAuth did not return an access token.');
  return data.access_token;
}

export async function initiateStkPush({ amount, phone, accountReference, transactionDesc }) {
  const token = await getAccessToken();
  const shortCode = required('MPESA_SHORTCODE');
  const passkey = required('MPESA_PASSKEY');
  const callbackUrl = required('MPESA_CALLBACK_URL');
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
  const normalizedPhone = normalizePhone(phone);

  const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount)),
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_PARTY_B || shortCode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference.slice(0, 12),
      TransactionDesc: transactionDesc.slice(0, 13)
    })
  });

  return parseJson(response);
}

export function createReceiptNumber() {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KVD-${new Date().getFullYear()}-${suffix}`;
}
