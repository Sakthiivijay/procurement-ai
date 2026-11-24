// apps/web/app/dashboard/page.tsx
"use client";

import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuoteDashboard from '../../components/QuoteDashboard';
import { BarChart3, Loader2 } from 'lucide-react';

function DashboardContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-400" /> Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            {requestId ? "Viewing specific project analytics." : "Viewing all procurement data."}
          </p>
        </div>

        {/* We wrap in Suspense because useSearchParams requires it in Next.js */}
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}>
          <QuoteDashboard 
            userId={user.id} 
            requestId={requestId || undefined} // Pass null/undefined if no ID is in URL
            refreshKey={0} // We don't need refreshKey here since it's a fresh page load
          />
        </Suspense>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}