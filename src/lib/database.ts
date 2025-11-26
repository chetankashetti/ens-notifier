import { prisma } from '@/lib/prisma';
import type { UserModel as User, EnsRecordModel as EnsRecord } from '../generated/prisma/models';

// User management functions
export async function findOrCreateUser(walletAddress: string, email?: string, fid?: string): Promise<User> {
  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  // Create user if not found
  if (!user) {
    user = await prisma.user.create({
      data: {
        walletAddress,
        email,
        fid,
      },
    });
  } else {
    // Update user if email or fid provided
    if (email || fid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(email && { email }),
          ...(fid && { fid }),
        },
      });
    }
  }

  return user;
}

export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { walletAddress },
  });
}

// ENS Record management functions
export async function subscribeToEnsDomain(
  userId: string,
  ensName: string,
  expiryDate: Date
): Promise<EnsRecord> {
  return prisma.ensRecord.upsert({
    where: {
      userId_ensName: {
        userId,
        ensName,
      },
    },
    update: {
      expiryDate,
      notified: false, // Reset notification status when updating
    },
    create: {
      userId,
      ensName,
      expiryDate,
    },
  });
}

export async function unsubscribeFromEnsDomain(userId: string, ensName: string): Promise<void> {
  await prisma.ensRecord.delete({
    where: {
      userId_ensName: {
        userId,
        ensName,
      },
    },
  });
}

export async function getUserEnsRecords(userId: string): Promise<EnsRecord[]> {
  return prisma.ensRecord.findMany({
    where: { userId },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function getExpiringDomains(daysThreshold: number = 30): Promise<Array<EnsRecord & { user: User }>> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  return prisma.ensRecord.findMany({
    where: {
      expiryDate: {
        lte: thresholdDate,
      },
      notified: false, // Only get domains that haven't been notified yet
    },
    include: {
      user: true,
    },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function markAsNotified(recordId: string): Promise<void> {
  await prisma.ensRecord.update({
    where: { id: recordId },
    data: {
      notified: true,
      lastNotifiedAt: new Date(),
    },
  });
}

export async function resetNotificationStatus(recordId: string): Promise<void> {
  await prisma.ensRecord.update({
    where: { id: recordId },
    data: {
      notified: false,
      lastNotifiedAt: null,
    },
  });
}

// Utility functions
export async function getSubscriptionStatus(userId: string, ensName: string): Promise<boolean> {
  const record = await prisma.ensRecord.findUnique({
    where: {
      userId_ensName: {
        userId,
        ensName,
      },
    },
  });

  return !!record;
}

export async function getUserStats(userId: string) {
  const [totalSubscriptions, expiringSoon, expired] = await Promise.all([
    prisma.ensRecord.count({
      where: { userId },
    }),
    prisma.ensRecord.count({
      where: {
        userId,
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gte: new Date(),
        },
      },
    }),
    prisma.ensRecord.count({
      where: {
        userId,
        expiryDate: {
          lt: new Date(),
        },
      },
    }),
  ]);

  return {
    totalSubscriptions,
    expiringSoon,
    expired,
  };
}
