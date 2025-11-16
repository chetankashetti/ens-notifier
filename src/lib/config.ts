export const config = {
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'ENS Notifier <onboarding@resend.dev>',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  cron: {
    secret: process.env.CRON_SECRET || '',
  },
  neynar: {
    apiKey: process.env.NEYNAR_API_KEY || '',
  },
} as const;
