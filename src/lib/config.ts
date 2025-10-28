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
  cron: {
    secret: process.env.CRON_SECRET || '',
  },
} as const;
