import { NextRequest, NextResponse } from 'next/server';
import { getExpiringDomains, markAsNotified } from '@/lib/database';
import { sendEnsExpiryEmail } from '@/lib/email/resend';
import { config } from '@/lib/config';
import { User, EnsRecord } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${config.cron.secret}`;

    if (!config.cron.secret || authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting cron job: Checking expiring ENS domains...');

    // Get domains expiring in the next 30 days
    const expiringDomains: Array<EnsRecord & { user: User }> = await getExpiringDomains(30);

    if (expiringDomains.length === 0) {
      console.log('No expiring domains found');
      return NextResponse.json({
        success: true,
        message: 'No expiring domains found',
        sent: 0,
        failed: 0,
        skipped: 0,
      });
    }

    console.log(`Found ${expiringDomains.length} expiring domains`);

    // Group domains by user for batch emails
    const userDomains = new Map<string, Array<{
      name: string;
      expiryDate: string;
      daysLeft: number;
      recordId: string;
    }>>();

    for (const record of expiringDomains) {
      const daysLeft = Math.floor(
        (record.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Skip if no user contact info or email
      if (!record.user?.email) {
        console.warn(`No user email for record ${record.id}`);
        continue;
      }

      const userKey = record.user.email;

      if (!userDomains.has(userKey)) {
        userDomains.set(userKey, []);
      }

      userDomains.get(userKey)!.push({
        name: record.ensName,
        expiryDate: record.expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysLeft,
        recordId: record.id,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails to each user
    for (const [userEmail, domains] of userDomains) {
      if (!userEmail) {
        console.log('Skipping user without email address');
        continue;
      }

      try {
        console.log(`Sending email to ${userEmail} for ${domains.length} domains`);

        const result = await sendEnsExpiryEmail(
          userEmail,
          domains.map(d => ({
            name: d.name,
            expiryDate: d.expiryDate,
            daysLeft: d.daysLeft,
          })),
          domains[0]?.name.split('.')[0] // Use first domain name as username
        );

        if (result.success) {
          // Mark all domains as notified
          for (const domain of domains) {
            await markAsNotified(domain.recordId);
          }
          sentCount++;
          console.log(`Email sent successfully to ${userEmail}`);
        } else {
          failedCount++;
          errors.push(`Failed to send to ${userEmail}: ${result.error}`);
          console.error(`Failed to send email to ${userEmail}:`, result.error);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = `Error sending to ${userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const summary = {
      success: true,
      message: 'Cron job completed',
      sent: sentCount,
      failed: failedCount,
      skipped: userDomains.size - sentCount - failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Cron job completed:', summary);
    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow manual testing via POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail, daysThreshold = 30 } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'testEmail is required for testing' },
        { status: 400 }
      );
    }

    console.log(`Manual test: Checking domains expiring in ${daysThreshold} days`);

    // Get expiring domains
    const expiringDomains = await getExpiringDomains(daysThreshold);

    if (expiringDomains.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expiring domains found',
        testEmail,
      });
    }

    // Send test email
    const testDomains = expiringDomains.slice(0, 3).map(record => ({
      name: record.ensName,
      expiryDate: record.expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      daysLeft: Math.floor(
        (record.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

    const result = await sendEnsExpiryEmail(testEmail, testDomains, 'Test User');

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
      testEmail,
      domainsCount: testDomains.length,
    });

  } catch (error) {
    console.error('Error in manual test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
