// apps/web/app/layout.tsx
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import './globals.css';
import Link from 'next/link'; 
import { Toaster } from 'sonner';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-950 text-white antialiased">
          {/* Navbar */}
          <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">P</div>
                <span className="text-xl font-bold tracking-tight">Procurement<span className="text-indigo-400">AI</span></span>
              </Link>
              
              {/* 🎯 New Navigation Links */}
              <div className="flex items-center gap-6">
                <Link href="/upload" className="text-sm text-slate-300 hover:text-white transition-colors">Workspace</Link>
                <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                
                {/* Clerk User Button */}
                <div className="pl-4 border-l border-slate-700">
                   <UserButton />
                </div>
              </div>
            </div>
          </nav>

          {/* Page Content */}
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            theme="dark" 
          />
        </body>
      </html>
    </ClerkProvider>
  );
}