// apps/web/components/RequestManager.tsx
"use client";

import { useEffect, useState } from 'react';
import { FolderPlus, Folder, Loader2, CheckCircle2 } from 'lucide-react';

interface Request{
  id: string;
  title: string;
  description?: string;
  _count: { vendorQuotes: number };
}

export default function RequestManager({ 
  userId, 
  selectedRequestId, 
  onSelectRequest 
}: { 
  userId: string; 
  selectedRequestId: string | null; 
  onSelectRequest: (id: string) => void;
}) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetch(`/api/requests?userId=${userId}`) // ✅ Added leading /
      .then((res) => res.json())
      .then((data) => { 
        if (data.success) setRequests(data.requests); 
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsCreating(true);
    const res = await fetch('/api/requests', { // ✅ Added leading /
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, userId }), // ✅ userId is now in scope from props
    });
    const data = await res.json(); // ✅ Added await
    
    if (data.success) {
      setRequests([data.request, ...requests]);
      onSelectRequest(data.request.id); // ✅ onSelectRequest is now in scope from props
      setNewTitle('');
    }
    setIsCreating(false);
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading projects...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Folder className="w-5 h-5 text-indigo-400" /> Procurement Requests
        </h2>
      </div>

      {/* Create New Request Form */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new project name (e.g., Q4 Laptops)"
          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          type="submit" 
          disabled={isCreating || !newTitle.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
          Create
        </button>
      </form>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => {
          const isSelected = req.id === selectedRequestId; // ✅ selectedRequestId is now in scope from props
          return (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req.id)} // ✅ onSelectRequest is now in scope from props
              className={`
                p-4 rounded-xl border cursor-pointer transition-all duration-200 relative
                ${isSelected 
                  ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
              `}
            >
              {isSelected && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-400" />}
              <h3 className="font-semibold text-white mb-1">{req.title}</h3>
              <p className="text-xs text-slate-400">{req._count?.vendorQuotes || 0} quotes uploaded</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}