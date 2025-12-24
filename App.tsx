import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InventoryView } from './components/InventoryView';
import { ForecastView } from './components/ForecastView';
import { DemandPlanningView } from './components/DemandPlanningView';
import { HistoricalDataView } from './components/HistoricalDataView';
import { ChatBot } from './components/ChatBot';
import { Product, ViewState } from './types';

// Mock initial data - Electronics Specific (Prices in INR)
const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'iPhone 15 Pro', 
    category: 'Smartphones', 
    price: 134900, 
    quantity: 25, 
    sku: 'APL-PH-15P',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=200&q=80'
  },
  { 
    id: '2', 
    name: 'Sony WH-1000XM5', 
    category: 'Audio', 
    price: 29990, 
    quantity: 40, 
    sku: 'SNY-HD-XM5',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80'
  },
  { 
    id: '3', 
    name: 'MacBook Air M3', 
    category: 'Laptops', 
    price: 114900, 
    quantity: 10, 
    sku: 'APL-MB-M3',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=200&q=80'
  },
  { 
    id: '4', 
    name: 'DJI Mini 4 Pro', 
    category: 'Drones', 
    price: 98990, 
    quantity: 8, 
    sku: 'DJI-DRN-M4',
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=200&q=80'
  },
  { 
    id: '5', 
    name: 'Samsung 49" Odyssey', 
    category: 'Monitors', 
    price: 145999, 
    quantity: 5, 
    sku: 'SAM-MON-G9',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80'
  },
  {
    id: '6',
    name: 'PlayStation 5 Slim',
    category: 'Gaming',
    price: 54990,
    quantity: 15,
    sku: 'SNY-PS5-SLM',
    image: 'https://images.unsplash.com/photo-1606144042614-b0417c0ed120?w=200&q=80'
  },
  {
    id: '7',
    name: 'iPad Air M2',
    category: 'Tablets',
    price: 59900,
    quantity: 12,
    sku: 'APL-IPD-AM2',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80'
  },
  {
    id: '8',
    name: 'Canon EOS R50',
    category: 'Cameras',
    price: 75990,
    quantity: 6,
    sku: 'CAN-EOS-R50',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80'
  },
  {
    id: '9',
    name: 'Samsung Galaxy Watch 6',
    category: 'Wearables',
    price: 29999,
    quantity: 20,
    sku: 'SAM-WCH-G6',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&q=80'
  },
  {
    id: '10',
    name: 'Google Nest Hub (2nd Gen)',
    category: 'Smart Home',
    price: 7999,
    quantity: 30,
    sku: 'GGL-NST-H2',
    image: 'https://images.unsplash.com/photo-1558089748-129f886f76fc?w=200&q=80'
  },
  {
    id: '11',
    name: 'NVIDIA RTX 4070 Super',
    category: 'PC Components',
    price: 65000,
    quantity: 4,
    sku: 'NVD-RTX-4070S',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&q=80'
  },
  {
    id: '12',
    name: 'Samsung T7 Shield 1TB',
    category: 'Storage',
    price: 12999,
    quantity: 45,
    sku: 'SAM-SSD-T7',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&q=80'
  },
  {
    id: '13',
    name: 'GoPro Hero 12 Black',
    category: 'Action Cameras',
    price: 44990,
    quantity: 10,
    sku: 'GOP-HER-12',
    image: 'https://images.unsplash.com/photo-1564466021188-1e4b8a3b0007?w=200&q=80'
  },
  {
    id: '14',
    name: 'TP-Link Deco XE75',
    category: 'Networking',
    price: 28999,
    quantity: 8,
    sku: 'TPL-DEC-XE75',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?w=200&q=80'
  },
  {
    id: '15',
    name: 'Keychron K2 Keyboard',
    category: 'Accessories',
    price: 8499,
    quantity: 18,
    sku: 'KEY-K2-V2',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80'
  }
];

const STORAGE_KEY = 'nexusinv_products';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INVENTORY);
  const [location, setLocation] = useState<string>('Chennai');
  
  // Initialize state from local storage or fall back to mock data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : INITIAL_PRODUCTS;
    } catch (error) {
      console.error("Failed to load inventory from local storage", error);
      return INITIAL_PRODUCTS;
    }
  });

  // Persist changes to local storage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save inventory to local storage", error);
    }
  }, [products]);

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      location={location}
      setLocation={setLocation}
    >
      <div className="max-w-6xl mx-auto">
        {currentView === ViewState.INVENTORY && (
          <InventoryView products={products} setProducts={setProducts} />
        )}
        {currentView === ViewState.FORECAST && (
          <ForecastView location={location} products={products} />
        )}
        {currentView === ViewState.DEMAND_PLANNING && (
          <DemandPlanningView products={products} location={location} />
        )}
        {currentView === ViewState.HISTORICAL && (
          <HistoricalDataView products={products} location={location} />
        )}
      </div>
      <ChatBot products={products} location={location} />
    </Layout>
  );
}