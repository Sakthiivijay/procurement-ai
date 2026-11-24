// apps/web/app/api/quotes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const requestId = searchParams.get('requestId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    //  Fetch quotes only for this specific user
    const quotes = await prisma.vendorQuote.findMany({
      where: {
        organizationId: userId,
        procurementRequestId: requestId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, quotes });
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}