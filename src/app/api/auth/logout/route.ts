import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Session } from '@/models/Session';
import { parseCookies, createAuthCookieOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookies = parseCookies(request.headers.get('cookie'));
    const sessionToken = cookies.session_token;

    if (sessionToken) {
      await connectToDatabase();
      await Session.deleteOne({ token: sessionToken });
    }

    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session_token', '', {
      ...createAuthCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session_token', '', {
      ...createAuthCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }
}
