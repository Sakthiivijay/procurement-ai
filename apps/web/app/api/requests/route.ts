import { NextResponse } from "next/server";
import { prisma } from "@repo/db";


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const requests = await prisma.procurementRequest.findMany({
        where: { orgId: userId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { vendorQuotes: true } } }

    });

    return NextResponse.json({ success: true, requests });
}


//POST: Create a new request:


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, userId } = body;

        if (!title || !userId) {
            return NextResponse.json({ error: 'Title and userId are Required!' }, { status: 400 })
        }

        const newRequest = await prisma.procurementRequest.create({
            data: {
                title,
                description,
                orgId: userId
            },

        });
        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        console.error("Failed to create Request:", error);
        return NextResponse.json({ error: 'Failed  to create request' }, { status: 500 });
    }
}