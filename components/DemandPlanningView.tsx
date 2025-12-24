import React, { useEffect, useState } from 'react';
import { Product, DailyPrediction } from '../types';
import { predictDemand } from '../services/geminiService';
import { Calendar, Loader2, TrendingUp, Info } from 'lucide-react';

interface DemandPlanningViewProps {
  products: Product[];
  location: string;
}

export const DemandPlanningView: React.FC<DemandPlanningViewProps> = ({ products, location }) => {
  const [predictions, setPredictions] = useState<DailyPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulatedHistory, setSimulatedHistory] = useState<string>("");

  // Helper to generate fake history "from the internet"
  const generateHistory = () => {
    let summary = "Simulated Past 30 Days Sales:\n";
    products.forEach(p => {
      // Random base sales between 1 and 10 per day average
      const avg = Math.floor(Math.random() * 5) + 1; 
      summary += `- ${p.name}: Avg ${avg} units/day. Trend: ${Math.random() > 0.5 ? 'Increasing' : 'Stable'}.\n`;
    });
    return summary;
  };

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      const history = generateHistory();
      setSimulatedHistory(history);
      
      const data = await predictDemand(products, location, history);
      setPredictions(data);
      setLoading(false);
    };

    if (products.length > 0) {
      loadPredictions();
    }
  }, [products, location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium">Analyzing historical data patterns...</p>
        <p className="text-xs text-slate-400 mt-2">Simulating internet search for {location} electronics trends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Demand Analysis Context
        </h3>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 whitespace-pre-line font-mono">
            {simulatedHistory}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          This data is simulated to represent historical sales patterns for the purpose of this demo.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          7-Day Demand Forecast
        </h3>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {predictions.map((day, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <h4 className="font-semibold text-blue-900">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h4>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {day.predictions.map((pred, pIdx) => (
                  <div key={pIdx} className="flex justify-between items-start border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700 block">{pred.productName}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{pred.reasoning}</span>
                    </div>
                    <div className="ml-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      {pred.predictedSales} units
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {predictions.length === 0 && !loading && (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No prediction data available. Try refreshing.
          </div>
        )}
      </div>
    </div>
  );
};