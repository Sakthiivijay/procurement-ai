// apps/web/components/QuoteDashboard.tsx
"use client";

import { useEffect, useState, Fragment  } from 'react';
import { 
  Trophy, FileText, Loader2, Download, Printer, 
  CheckCircle2, AlertCircle, MessageSquare 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// 🎨 Dark Theme Colors for Charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface LineItem { description: string; quantity: number; unitPrice: number; total: number; }
interface AIInsights { summary: string; strengths: string[]; weaknesses: string[]; negotiationPoints: string[]; }
interface Quote { id: string; vendorName: string; totalPrice: number; currency: string; rawFileUrl: string; lineItems: LineItem[]; aiInsights: AIInsights | null; createdAt: string; }

export default function QuoteDashboard({ userId, requestId, refreshKey }: { userId: string, requestId?: string, refreshKey?: number }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = `/api/quotes?userId=${userId}`;
    if (requestId) url += `&requestId=${requestId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => { if (data.success) setQuotes(data.quotes); })
      .finally(() => setLoading(false));
  }, [userId, requestId, refreshKey]);

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  // --- 🎯 CHART DATA PREPARATION ---
  const cheapestQuote = quotes.length > 0 ? quotes.reduce((prev, curr) => prev.totalPrice < curr.totalPrice ? prev : curr) : null;
  
  const barChartData = quotes.map(q => ({ name: q.vendorName, price: q.totalPrice }));
  
  const pieChartData = cheapestQuote?.lineItems?.map(item => ({
    name: item.description.length > 15 ? item.description.substring(0, 15) + '...' : item.description,
    value: item.total
  })) || [];

  // --- EXPORT FUNCTIONS ---
  const exportToCSV = () => {
    if (quotes.length === 0) return;
    const headers = ['Vendor', 'Total Price', 'Currency', 'Created At', 'AI Summary'];
    const rows = quotes.map(q => [q.vendorName, q.totalPrice, q.currency, new Date(q.createdAt).toLocaleDateString(), q.aiInsights?.summary || '']);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `procurement-report-${Date.now()}.csv`;
    link.click();
  };

  const handlePrint = () => window.print();

    if (loading) return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-slate-800 rounded-lg" />
          <div className="h-10 w-24 bg-slate-800 rounded-lg" />
        </div>
      </div>
      
      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-[300px] bg-slate-800/50 rounded-xl border border-slate-700" />
        <div className="h-[300px] bg-slate-800/50 rounded-xl border border-slate-700" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="h-6 w-full bg-slate-700 rounded mb-4" />
        <div className="h-6 w-3/4 bg-slate-700 rounded mb-4" />
        <div className="h-6 w-5/6 bg-slate-700 rounded" />
      </div>
    </div>
  );

  if (quotes.length === 0) return <div className="text-center p-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed"><FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-white">No Quotes Yet</h3></div>;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 print-only">
      {/* Header & Buttons */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 text-sm"><Printer className="w-4 h-4" /> PDF</button>
          <button onClick={exportToCSV} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> CSV</button>
        </div>
      </div>

      {/* 🎯 NEW: CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
        {/* Bar Chart: Price Comparison */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Vendor Price Comparison</h3>
          {quotes.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="price" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500">Upload another vendor to see comparison.</div>
          )}
        </div>

        {/* Pie Chart: Cost Breakdown of Cheapest Vendor */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Cost Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Based on best value vendor: <span className="text-indigo-400 font-bold">{cheapestQuote?.vendorName}</span></p>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500">No line item data available.</div>
          )}
        </div>
      </div>

      {/* --- EXISTING TABLE SECTION --- */}
      <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Vendor</th>
              <th className="p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Total Price</th>
              <th className="p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">AI Analysis</th>
              <th className="p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {quotes.map((quote) => {
              const isCheapest = quote.id === cheapestQuote?.id && quotes.length > 1;
              const isExpanded = expandedId === quote.id;
              return (
                <div key={quote.id} className="contents">
                  <tr className={`transition-colors hover:bg-slate-700/30 ${isCheapest ? 'bg-green-500/5' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{quote.vendorName}</span>
                        {isCheapest && <span className="px-2 py-0.5 text-xs font-bold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">Best Value</span>}
                      </div>
                    </td>
                    <td className="p-4"><span className={`text-lg font-bold ${isCheapest ? 'text-green-400' : 'text-white'}`}>{quote.currency} {quote.totalPrice.toLocaleString()}</span></td>
                    <td className="p-4">
                      {quote.aiInsights ? (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-300 italic">"{quote.aiInsights.summary}"</p>
                          <button onClick={() => toggleExpand(quote.id)} className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300">
                            {isExpanded ? 'Hide Details' : 'View Full Analysis'}
                          </button>
                        </div>
                      ) : <span className="text-sm text-slate-500">No analysis</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
                  </tr>
                  {isExpanded && quote.aiInsights && (
                    <tr className="bg-slate-900/80">
                      <td colSpan={4} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div><h4 className="flex items-center gap-2 text-sm font-bold text-green-400 mb-2"><CheckCircle2 className="w-4 h-4" /> Strengths</h4><ul className="space-y-1">{quote.aiInsights.strengths.map((i, idx) => <li key={idx} className="text-sm text-slate-300">• {i}</li>)}</ul></div>
                          <div><h4 className="flex items-center gap-2 text-sm font-bold text-red-400 mb-2"><AlertCircle className="w-4 h-4" /> Weaknesses</h4><ul className="space-y-1">{quote.aiInsights.weaknesses.map((i, idx) => <li key={idx} className="text-sm text-slate-300">• {i}</li>)}</ul></div>
                          <div><h4 className="flex items-center gap-2 text-sm font-bold text-yellow-400 mb-2"><MessageSquare className="w-4 h-4" /> Negotiation</h4><ul className="space-y-1">{quote.aiInsights.negotiationPoints.map((i, idx) => <li key={idx} className="text-sm text-slate-300">• {i}</li>)}</ul></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}