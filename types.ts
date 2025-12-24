export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  sku: string;
  image: string;
}

export interface TrendData {
  productName: string;
  category: string;
  demandScore: number; // 0-100
  reason: string;
}

export interface ForecastResponse {
  location: string;
  marketSummary: string;
  trendingProducts: TrendData[];
}

export interface DailyPrediction {
  date: string;
  predictions: {
    productName: string;
    predictedSales: number;
    reasoning: string;
  }[];
}

export interface MonthlyMetric {
  month: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
}

export interface HistoricalProductData {
  productName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  monthlyHistory: MonthlyMetric[];
  insight: string;
}

export enum ViewState {
  INVENTORY = 'INVENTORY',
  FORECAST = 'FORECAST',
  DEMAND_PLANNING = 'DEMAND_PLANNING',
  HISTORICAL = 'HISTORICAL',
}