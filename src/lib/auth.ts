import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { Session } from '@/models/Session';
import { User } from '@/models/User';

const SALT_LENGTH = 16;
const HASH_LENGTH = 64;
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derived = scryptSync(password, salt, HASH_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, derivedHash] = storedHash.split(':');
  if (!salt || !derivedHash) {
    return false;
  }

  const hashBuffer = Buffer.from(derivedHash, 'hex');
  const derivedBuffer = scryptSync(password, salt, HASH_LENGTH);

  if (hashBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, derivedBuffer);
}

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function parseCookies(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [name, ...rest] = cookie.split('=');
      return [name.trim(), decodeURIComponent(rest.join('='))];
    })
  );
}

export async function getSessionToken(request: Request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  return cookies.session_token;
}

export async function getUserFromSession(request: Request) {
  const sessionToken = await getSessionToken(request);
  if (!sessionToken) {
    return null;
  }

  await connectToDatabase();
  const session = await Session.findOne({
    token: sessionToken,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user) {
    await Session.deleteOne({ _id: session._id });
    return null;
  }

  return { session, user };
}

export async function requireAuth(request: Request) {
  return await getUserFromSession(request);
}

export async function requireApprovedUser(request: Request) {
  const auth = await getUserFromSession(request);
  if (!auth || !auth.user.approved) {
    throw new Error('Unauthorized');
  }

  return auth;
}

export async function requireAdmin(request: Request) {
  const auth = await getUserFromSession(request);
  if (!auth || auth.user.role !== 'admin' || !auth.user.approved) {
    throw new Error('Unauthorized');
  }

  return auth;
}

export function createAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production' && process.env.VERCEL === '1',
    maxAge: SESSION_DURATION_SECONDS,
  };
}
