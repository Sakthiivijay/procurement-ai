// apps/web/app/api/process-upload/route.ts
import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../../../lib/s3';
import { extractTextFromFile } from '../../../lib/extractText';
import { groq } from '../../../lib/groq';
import { prisma } from '@repo/db';
import { z } from 'zod';

const processSchema = z.object({
  fileKey: z.string().min(1),
  fileType: z.string().min(1),
  userId: z.string().min(1),
  requestId: z.string().min(1), //  Expect userId
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileKey, fileType, userId, requestId } = processSchema.parse(body);

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey });
    const response = await s3Client.send(command);

    const streamToBuffer = (stream: any) => {
      return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    };

    const fileBuffer = await streamToBuffer(response.Body) as Buffer;
    const extractedText = await extractTextFromFile(fileBuffer, fileType);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert procurement analyst. Extract data from vendor quotes and provide analysis.
          
Return ONLY valid JSON in this exact format:
{
  "vendorName": "Company Name",
  "totalPrice": 1500,
  "currency": "USD",
  "lineItems": [{"description": "Item", "quantity": 10, "unitPrice": 50, "total": 500}],
  "summary": "Brief 1-sentence summary",
  "strengths": ["Low pricing", "Fast delivery"],
  "weaknesses": ["No warranty", "High shipping"],
  "negotiationPoints": ["Ask for bulk discount", "Request free shipping"]
}

Rules:
- If a field is missing, use null for strings, 0 for numbers, [] for arrays
- Keep strengths/weaknesses/negotiationPoints to 2-3 items each
- Be specific and actionable in your analysis
- Do NOT include markdown or text outside the JSON`
        },
        {
          role: "user",
          content: extractedText
        }
      ],
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      temperature: 0.3,
    });


    const aiResponseContent = completion.choices[0].message.content;
        const cleanJson = aiResponseContent?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
    const structuredData = JSON.parse(cleanJson);

    // Extract insights from the flat structure
    const aiInsights = {
      summary: structuredData.summary || "No summary available",
      strengths: structuredData.strengths || [],
      weaknesses: structuredData.weaknesses || [],
      negotiationPoints: structuredData.negotiationPoints || []
    };

    const newQuote = await prisma.vendorQuote.create({
      data: {
        organizationId: userId,
        vendorName: structuredData.vendorName || "Unknown Vendor",
        totalPrice: structuredData.totalPrice || 0,
        currency: structuredData.currency || "USD",
        rawFileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
        lineItems: structuredData.lineItems || [],
        aiInsights: aiInsights,

        procurementRequestId: requestId,
      },
    });

    return NextResponse.json({
      success: true,
      textLength: extractedText.length,
      structuredData: structuredData,
      databaseId: newQuote.id
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Processing error:", error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}