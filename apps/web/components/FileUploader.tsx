// apps/web/components/FileUploader.tsx
"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // 🎯 Toast import

// 🎯 Accept userId and requestId as props
export default function FileUploader({ userId, requestId, onUploadSuccess }: { userId: string, requestId: string, onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      setAiResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Generating secure upload link...');
    setAiResult(null);
    
    // 🎯 1. Start the persistent loading toast
    const loadingToast = toast.loading('Generating secure upload link...');
    
    try {
      // Step 1: Get Presigned URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          userId: userId,
          requestId: requestId,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to get upload link');

      // 🎯 2. Update the toast
      toast.loading('Uploading securely to AWS S3...', { id: loadingToast });
      setMessage('Uploading securely to AWS S3...');

      // Step 2: Upload to S3
      const s3Res = await fetch(uploadData.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      if (!s3Res.ok) throw new Error('Failed to upload to S3');

      // 🎯 3. Update the toast again
      toast.loading('AI is extracting and analyzing your document...', { id: loadingToast });
      setStatus('processing');
      setMessage('AI is extracting text from your document...');

      // Step 3: Process File
      const processRes = await fetch('/api/process-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: uploadData.key,
          fileType: file.type || 'application/octet-stream',
          userId: userId,
          requestId: requestId,
        }),
      });

      if (!processRes.ok) {
        const errorText = await processRes.text();
        throw new Error(errorText || 'Failed to process file');
      }

      const processData = await processRes.json();
      
      // 🎯 4. SUCCESS TOAST! (Replaces the loading toast)
      toast.success(`Successfully analyzed ${processData.structuredData?.vendorName || 'Vendor'}!`, {
        id: loadingToast,
        description: `Extracted ${processData.textLength || 0} characters.`,
      });

      setStatus('success');
      setMessage(`Success! Extracted ${processData.textLength} characters.`);
      setAiResult(processData.structuredData); 
      onUploadSuccess(); // Send the signal to refresh dashboard!

    } catch (error: any) {
      // 🎯 5. ERROR TOAST! (Replaces the loading toast)
      toast.error(error.message || 'An unexpected error occurred.', {
        id: loadingToast,
      });
      setStatus('error');
      setMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <FileText className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Upload Vendor Quote</h2>
          <p className="text-slate-400 text-sm">Supports PDF, Excel, CSV, and Text files</p>
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
          ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-700/30'}
        `}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.xlsx,.xls,.csv,.txt"
        />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-indigo-400' : 'text-slate-500'}`} />
        {file ? (
          <div>
            <p className="text-white font-medium text-lg truncate">{file.name}</p>
            <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-300 font-medium">Click to browse or drag and drop</p>
            <p className="text-slate-500 text-sm mt-2">Max file size: 10MB</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading' || status === 'processing'}
        className="w-full mt-6 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        {(status === 'uploading' || status === 'processing') ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><Upload className="w-5 h-5" /> Upload & Extract Data</>
        )}
      </button>

      {message && (
        <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
          status === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 
          status === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 
          'bg-blue-500/10 text-blue-300 border border-blue-500/20'
        }`}>
          {status === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : 
           status === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : 
           <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />}
          <p>{message}</p>
        </div>
      )}

      {/* 🎯 Clean Success Summary */}
      {aiResult && (
        <div className="mt-6 p-6 bg-slate-900/80 border border-green-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Extraction Complete!</h3>
              <p className="text-sm text-slate-400">Here is a quick summary of what the AI found:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/30 p-4 rounded-lg border border-slate-800">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vendor</p>
              <p className="text-white font-medium truncate">{aiResult.vendorName || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Price</p>
              <p className="text-green-400 font-bold text-lg">
                {aiResult.currency || "USD"} {aiResult.totalPrice?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Line Items Found</p>
              <p className="text-white font-medium">{aiResult.lineItems?.length || 0} items</p>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-slate-500 text-center">
            Data has been saved. Scroll down to see the full comparison dashboard.
          </p>
        </div>
      )}
    </div>
  );
}