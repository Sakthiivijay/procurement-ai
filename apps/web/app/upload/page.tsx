// apps/web/app/upload/page.tsx
"use client";

import { useState } from 'react';
import { auth } from '@clerk/nextjs/server'; // Note: We can't use this in client components, see note below
import { useUser } from '@clerk/nextjs'; // Use this hook instead for client components
import { useRouter } from 'next/navigation';
import RequestManager from '../../components/RequestManager';
import FileUploader from '../../components/FileUploader';
import { Folder, Upload } from 'lucide-react';

export default function UploadPage() {
  const { user } = useUser(); // Get the logged-in user
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  if (!user) return null; // Prevent flash of content

  const handleUploadSuccess = () => {
    // Optional: You could show a toast notification here
    console.log("Upload successful!");
  };

  const goToDashboard = () => {
    if (selectedRequestId) {
      router.push(`/dashboard?requestId=${selectedRequestId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Folder className="w-8 h-8 text-indigo-400" /> Workspace
          </h1>
          <p className="text-slate-400 mt-2">Create a project and upload vendor quotes.</p>
        </div>

        {/* 1. Request Manager */}
        <RequestManager 
          userId={user.id} 
          selectedRequestId={selectedRequestId} 
          onSelectRequest={setSelectedRequestId} 
        />

        {/* 2. Uploader */}
        <div className="mt-8">
          {selectedRequestId ? (
            <FileUploader 
              userId={user.id} 
              requestId={selectedRequestId} 
              onUploadSuccess={handleUploadSuccess} 
            />
          ) : (
            <div className="text-center p-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-slate-400">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Please select or create a Procurement Request above to start uploading.</p>
            </div>
          )}
        </div>

        {/* 3. Quick Link to Dashboard */}
        {selectedRequestId && (
          <div className="mt-8 text-center">
            <button 
              onClick={goToDashboard}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
            >
              View Analytics for this Project 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}