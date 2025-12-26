import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Package, MapPin, TrendingUp, CalendarDays, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  location: string;
  setLocation: (loc: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView,
  location,
  setLocation
}) => {
  const [isEditingLoc, setIsEditingLoc] = React.useState(false);
  const [tempLoc, setTempLoc] = React.useState(location);

  const handleLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLoc.trim()) {
      setLocation(tempLoc);
      setIsEditingLoc(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Sidebar - Light Theme */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            NexusInv
          </h1>
          <p className="text-xs text-slate-500 mt-1">Inventory Optimisation and Forecasting</p>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          <button
            onClick={() => setCurrentView(ViewState.INVENTORY)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              currentView === ViewState.INVENTORY 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Inventory</span>
          </button>
          
          <button
             onClick={() => setCurrentView(ViewState.DEMAND_PLANNING)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              currentView === ViewState.DEMAND_PLANNING
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Demand Calendar</span>
          </button>

          <button
             onClick={() => setCurrentView(ViewState.FORECAST)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              currentView === ViewState.FORECAST
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Market Trends</span>
          </button>

          <button
             onClick={() => setCurrentView(ViewState.HISTORICAL)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              currentView === ViewState.HISTORICAL
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Historical Data</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentView === ViewState.INVENTORY && 'Inventory Management'}
            {currentView === ViewState.FORECAST && 'Market Intelligence'}
            {currentView === ViewState.DEMAND_PLANNING && 'Demand Planning Calendar'}
            {currentView === ViewState.HISTORICAL && 'Historical Sales'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
              <MapPin className="w-4 h-4 text-blue-500" />
              {isEditingLoc ? (
                <form onSubmit={handleLocSubmit}>
                  <input
                    type="text"
                    value={tempLoc}
                    onChange={(e) => setTempLoc(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-32 md:w-48 text-slate-700"
                    autoFocus
                    onBlur={() => setIsEditingLoc(false)}
                  />
                </form>
              ) : (
                <span 
                  className="text-sm font-medium text-slate-700 cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditingLoc(true)}
                  title="Click to change location"
                >
                  {location}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};