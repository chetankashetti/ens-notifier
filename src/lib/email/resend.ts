import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EnsExpiryEmail } from './templates';
import { config } from '@/lib/config';

// Only initialize Resend if API key is available
let resend: Resend | null = null;

if (config.email.resendApiKey && config.email.resendApiKey !== 'your_resend_api_key_here') {
  try {
    resend = new Resend(config.email.resendApiKey);
  } catch (error) {
    console.warn('Failed to initialize Resend:', error);
    resend = null;
  }
}

export interface EmailDomain {
  name: string;
  expiryDate: string;
  daysLeft: number;
}

export async function sendEnsExpiryEmail(
  to: string,
  domains: EmailDomain[],
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      console.log('Resend not configured - simulating email send');
      console.log(`Would send email to ${to} with ${domains.length} domains:`, domains);
      return { success: true };
    }

    const emailHtml = render(EnsExpiryEmail({ userName, domains }));

    const { data, error } = await resend.emails.send({
      from: config.email.from,
      to: [to],
      subject: `⚠️ ${domains.length === 1 ? 'Your ENS domain' : 'Your ENS domains'} ${domains.length === 1 ? 'is' : 'are'} expiring soon`,
      html: await emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error in sendEnsExpiryEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  const testDomains: EmailDomain[] = [
    {
      name: 'test.eth',
      expiryDate: '2025-01-15',
      daysLeft: 7,
    },
  ];

  return sendEnsExpiryEmail(to, testDomains, 'Test User');
}
