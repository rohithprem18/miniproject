# NexusInv - AI Powered Inventory & Forecasting System

NexusInv is a modern, intelligent inventory management dashboard designed for electronics retailers. It leverages LLM Model to provide real-time market insights, demand forecasting, and simulated historical analysis, helping business owners make data-driven decisions.

## 🚀 Key Features

### 📦 Inventory Management
- **CRUD Operations**: Add, edit, and delete products easily.
- **Stock Control**: Quick increment/decrement buttons for stock adjustments.
- **Search & Filter**: Real-time search by name, SKU, or category.
- **PDF Export**: Generate professional inventory status reports with one click.
- **Local Persistence**: Data is saved automatically to your browser's local storage.

### 🔮 AI Market Intelligence 
- **Market Trends**: Analyzes your current stock against local market trends (e.g., "Trends in Chennai").
- **Demand Scoring**: Assigns a demand score (0-100) to products based on real-world popularity and seasonality.
- **Gap Analysis**: Suggests trending products that are missing from your inventory.

### 📅 Demand Planning
- **7-Day Forecast**: Predicts daily sales for the upcoming week based on product categories and simulated history.
- **Reasoning Engine**: Explains *why* a specific sales volume is predicted (e.g., "Weekend surge", "New release hype").

### 📊 Historical Analytics
- **Visual Dashboards**: Interactive charts using Recharts showing sales vs. price correlations.
- **Revenue Aggregation**: View total revenue trends over the past 6 months.
- **AI Insights**: Generates text-based insights on why products performed a certain way in the past.

### 🤖 NexusBot Assistant
- **Context-Aware Chat**: An embedded AI assistant that knows your specific inventory levels and location.
- **Smart Queries**: Ask questions like "What should I restock?", "How is the iPhone 15 performing?", or "Write a marketing tweet for the Sony headphones".

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **Reporting**: jsPDF, jsPDF-AutoTable
- **Icons**: Lucide React


## 📖 Usage Guide

1. **Dashboard**: The landing page shows your current inventory. Use the "Add Item" button to populate stock.
2. **Location**: Click the location pill in the top header (default: Chennai) to change your target market region. This updates all AI forecasts.
3. **Forecasting**: Navigate to "Market Trends" to see how your inventory aligns with local demand.
4. **Chat**: Click the floating action button in the bottom right to talk to NexusBot.