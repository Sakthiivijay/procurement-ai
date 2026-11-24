// apps/web/app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth(); // ✅ must be awaited

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        Automate Your Procurement
      </h1>
      <p className="text-slate-400 text-xl max-w-2xl mb-10">
        Upload vendor quotes and let our AI extract, analyze, and organize your data in seconds.
      </p>

      <div className="flex gap-4 items-center">
        {userId ? (
          <Link href="/upload">
            <button className="px-8 py-4 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105">
              Go to Workspace &rarr;
            </button>
          </Link>
        ) : (
          <>
            <SignInButton mode="modal">
              <button className="px-6 py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-8 py-3 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
                Get Started
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </main>
  );
}