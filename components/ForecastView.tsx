import React, { useEffect, useState, useCallback } from 'react';
import { getMarketForecast } from '../services/geminiService';
import { ForecastResponse, Product } from '../types';
import { Sparkles, Loader2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ForecastViewProps {
  location: string;
  products: Product[];
}

export const ForecastView: React.FC<ForecastViewProps> = ({ location, products }) => {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getMarketForecast(location, products);
      setData(result);
    } catch (err) {
      setError('Failed to fetch AI insights. Check your API Key or connection.');
    } finally {
      setLoading(false);
    }
  }, [location, products]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateReport = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(`Market Forecast Report: ${data.location}`, 14, 20);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(60);
    const splitSummary = doc.splitTextToSize(data.marketSummary, 180);
    doc.text(splitSummary, 14, 30);

    // Table
    const tableBody = data.trendingProducts.map(item => [
      item.productName,
      item.category,
      item.demandScore.toString(),
      item.reason
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Product', 'Category', 'Demand Score', 'Reason']],
      body: tableBody,
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`forecast-${data.location.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium">Analyzing inventory against {location} trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchData} 
          className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Calculate dynamic height for chart based on number of items (approx 50px per item + buffer)
  const chartHeight = Math.max(400, data.trendingProducts.length * 50);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI Market Analysis
          </h2>
          <p className="text-blue-100 leading-relaxed mb-6">
            {data.marketSummary}
          </p>
          <div className="flex items-center gap-3">
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
              Targeting: {data.location}
             </span>
             <button 
               onClick={generateReport}
               className="flex items-center gap-2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
             >
              <Download className="w-3 h-3" />
              Download Report
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <h3 className="text-lg font-semibold text-slate-800 mb-6">Demand Score Forecast</h3>
           <div style={{ height: `${chartHeight}px`, minHeight: '400px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.trendingProducts} layout="vertical" margin={{ left: 10, right: 10 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" domain={[0, 100]} hide />
                 <YAxis 
                    dataKey="productName" 
                    type="category" 
                    width={130} 
                    tick={{fontSize: 11}} 
                    interval={0}
                 />
                 <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="demandScore" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.trendingProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.demandScore > 80 ? '#22c55e' : '#3b82f6'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Detailed Insights</h3>
          {data.trendingProducts.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{item.productName}</h4>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">{item.category}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-lg font-bold ${item.demandScore > 80 ? 'text-green-600' : 'text-blue-600'}`}>
                     {item.demandScore}
                   </span>
                   <span className="text-[10px] text-slate-400">Demand Score</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 border-t border-slate-100 pt-3 mt-1">
                <span className="font-medium text-slate-700">Analysis: </span>
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};