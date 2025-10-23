export const config = {
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
  },
  cron: {
    secret: process.env.CRON_SECRET || '',
  },
} as const;
