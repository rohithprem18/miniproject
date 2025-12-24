import React, { useEffect, useState } from 'react';
import { Product, HistoricalProductData } from '../types';
import { getHistoricalAnalysis } from '../services/geminiService';
import { Loader2, History, TrendingUp, IndianRupee, Package, LineChart as LineChartIcon } from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface HistoricalDataViewProps {
  products: Product[];
  location: string;
}

export const HistoricalDataView: React.FC<HistoricalDataViewProps> = ({ products, location }) => {
  const [data, setData] = useState<HistoricalProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (products.length === 0) return;
      setLoading(true);
      try {
        const result = await getHistoricalAnalysis(products, location);
        setData(result);

        // Process data for the Aggregate Chart (Total Revenue per Month)
        if (result.length > 0) {
          const monthMap = new Map<string, number>();
          // Initialize from first product to get months order
          result[0].monthlyHistory.forEach(m => monthMap.set(m.month, 0));

          result.forEach(product => {
            product.monthlyHistory.forEach(m => {
              const current = monthMap.get(m.month) || 0;
              monthMap.set(m.month, current + m.revenue);
            });
          });

          const chartData = Array.from(monthMap.entries()).map(([month, revenue]) => ({
            month,
            revenue
          }));
          setAggregatedData(chartData);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [products, location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-medium">Retrieving sales archives for {location}...</p>
        <p className="text-xs text-slate-400 mt-2">Analyzing past 6 months performance</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        No products in inventory to analyze.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-indigo-600" />
          Historical Sales Analysis: {location}
        </h2>
        <p className="text-sm text-slate-500">
          Simulated performance data based on local market conditions and seasonality for the past 6 months.
        </p>
      </div>

      {/* Aggregate Revenue Chart */}
      {aggregatedData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-semibold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Total Revenue Trend (Last 6 Months)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 12}} stroke="#94a3b8" tickFormatter={(value) => `₹${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Product Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="font-semibold text-slate-800 truncate pr-4">{item.productName}</h4>
              <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-500 whitespace-nowrap">
                6-Month View
              </span>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-end mb-4">
                <div>
                   <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Sold</p>
                   <div className="flex items-center gap-1.5 text-slate-800">
                     <Package className="w-4 h-4 text-blue-500" />
                     <span className="text-xl font-bold">{item.totalUnitsSold}</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
                   <div className="flex items-center justify-end gap-1.5 text-green-700">
                     <IndianRupee className="w-4 h-4" />
                     <span className="text-xl font-bold">{item.totalRevenue.toLocaleString('en-IN')}</span>
                   </div>
                </div>
              </div>

              {/* Dual Axis Chart: Sales vs Price */}
              <div className="h-64 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={item.monthlyHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    
                    <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                    />
                    
                    {/* Left Axis: Units Sold */}
                    <YAxis 
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fill: '#64748b'}}
                        label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }}
                    />

                    {/* Right Axis: Price */}
                    <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                        tick={{fontSize: 10, fill: '#f97316'}}
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                    />

                    <Tooltip 
                      labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      formatter={(value: number, name: string) => {
                          if (name === 'averagePrice') return [`₹${value.toLocaleString('en-IN')}`, 'Avg Price'];
                          if (name === 'unitsSold') return [value, 'Units Sold'];
                          return [value, name];
                      }}
                    />
                    
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="unitsSold" 
                        name="Units Sold"
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        fill={`url(#grad-${idx})`} 
                    />
                    
                    <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="averagePrice" 
                        name="Avg Price"
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#f97316' }}
                        activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex gap-2 items-start">
                <LineChartIcon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <span className="font-semibold">Analysis: </span>
                  {item.insight}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};