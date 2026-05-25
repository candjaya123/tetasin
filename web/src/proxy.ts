import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const BUSINESS_ROUTES = [
  '/tenant/pos',
  '/tenant/inventory',
  '/tenant/pesanan',
  '/tenant/orders',
  '/tenant/procurement',
  '/tenant/staff',
  '/tenant/receipt',
  '/tenant/promos',
  '/tenant/marketing',
  '/tenant/withdrawal',
];

const PERSONAL_ROUTES = [
  '/tenant/personal',
  '/tenant/personal/goals',
  '/tenant/personal/transfer',
  '/tenant/personal/recurring',
  '/tenant/personal/budgets',
  '/tenant/income',
  '/tenant/expense',
  '/tenant/budget',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/tenant') || pathname === '/tenant/onboarding') {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', session.user.id)
    .single();

  const isPersonal = profile?.account_type === 'personal';

  if (isPersonal && BUSINESS_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/tenant', request.url));
  }

  if (!isPersonal && PERSONAL_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/tenant', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tenant/:path*'],
};
