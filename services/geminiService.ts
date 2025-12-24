import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ForecastResponse, DailyPrediction, Product, HistoricalProductData } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const createAssistantChat = (products: Product[], location: string): Chat => {
  if (!apiKey) throw new Error("API Key is missing.");

  const inventoryContext = products
    .map(p => `- ${p.name} (Qty: ${p.quantity}, Price: ₹${p.price}, Category: ${p.category})`)
    .join('\n');

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `
        You are NexusBot, an expert inventory management assistant for an electronics store in ${location}.
        
        CURRENT INVENTORY STATE:
        ${inventoryContext}

        Your Role:
        1. Answer questions about current stock levels, pricing, and value.
        2. Provide advice on whether to restock items based on general electronics market knowledge.
        3. Suggest marketing strategies for specific items in the inventory.
        
        FORMATTING RULES (Important):
        - Use **bold** for product names, prices, and key numbers.
        - Use bullet points (- item) for lists.
        - Use ## for main headings (if the response is long).
        - Keep paragraphs short and professional.
        - Do not use markdown tables, use lists instead.
        - All currency values should be in Indian Rupees (₹).
        
        BEHAVIOR:
        - If the user asks about trends, ALWAYS reference the items they currently have in stock first if applicable.
        - Be encouraging but realistic about demand.
      `,
    },
  });
};

export const getMarketForecast = async (location: string, products: Product[] = []): Promise<ForecastResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const modelId = "gemini-2.5-flash";
  const inventoryList = products.map(p => `${p.name} (${p.category})`).join(", ");
  
  const prompt = `
    Analyze the current RETAIL ELECTRONICS market trends specifically for the location: ${location}.
    
    My Current Inventory contains these items: 
    ${inventoryList || "No items yet"}

    Task:
    Generate a market forecast JSON that analyzes MY INVENTORY + EXTERNAL TRENDS.

    CRITICAL RULES:
    1. **MANDATORY**: You MUST include a demand analysis object for EVERY SINGLE ITEM in "My Current Inventory". Do not skip any.
    2. **EXTERNAL TRENDS**: After analyzing my items, add 3-5 top trending electronics in ${location} that I do NOT have.
    3. **SCORING**: valid electronics in my inventory should get realistic demand scores (0-100) based on their real-world popularity.

    Structure:
    - location: string
    - marketSummary: string (Mention how well the user's current inventory matches local demand).
    - trendingProducts: array of objects
      - productName: Name of the product (Use my inventory name exactly if applicable)
      - category: Category
      - demandScore: 0-100
      - reason: Why it is trending (If it's in my inventory, explicitly mention "IN STOCK: <reason>").
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING },
            marketSummary: { type: Type.STRING },
            trendingProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  demandScore: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                },
                required: ["productName", "category", "demandScore", "reason"],
              },
            },
          },
          required: ["location", "marketSummary", "trendingProducts"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    return JSON.parse(jsonText) as ForecastResponse;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return {
      location: location,
      marketSummary: "Estimated electronics trends based on seasonal analysis.",
      trendingProducts: [
        // Fallback that tries to at least show the user's first few products if API fails
        ...products.slice(0, 5).map(p => ({
            productName: p.name,
            category: p.category,
            demandScore: 50,
            reason: "Data unavailable, estimated baseline."
        })),
        { productName: "5G Smartphones", category: "Mobile", demandScore: 90, reason: "Network expansion." }
      ]
    };
  }
};

export const predictDemand = async (products: Product[], location: string, historySummary: string): Promise<DailyPrediction[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const modelId = "gemini-2.5-flash";

  const productList = products.map(p => p.name).join(", ");
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    You are an inventory planning AI for an Electronics store in ${location}.
    Today is ${today}.
    
    The available products in inventory are: ${productList}.

    Context:
    ${historySummary}

    Task: 
    Predict the daily sales quantity for EACH of the available products for the NEXT 7 DAYS.
    
    CRITICAL:
    - If a product is NEW (no history provided), estimate sales based on its category popularity in ${location}.
    - You MUST return predictions for ALL ${products.length} products in the list.
    
    Return a JSON array where each item represents a day (date string) and contains a list of predictions for that day.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              predictions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productName: { type: Type.STRING },
                    predictedSales: { type: Type.INTEGER },
                    reasoning: { type: Type.STRING },
                  },
                  required: ["productName", "predictedSales", "reasoning"]
                }
              }
            },
            required: ["date", "predictions"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No prediction data");
    return JSON.parse(jsonText) as DailyPrediction[];
  } catch (error) {
    console.error("Error predicting demand:", error);
    return [];
  }
};

export const getHistoricalAnalysis = async (products: Product[], location: string): Promise<HistoricalProductData[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const modelId = "gemini-2.5-flash";
  // Pass prices with Rupee symbol in the prompt context
  const productInfo = products.map(p => `${p.name} (₹${p.price})`).join(", ");

  const prompt = `
    You are a retail analytics engine for an electronics business in ${location}.
    
    Current Inventory: ${productInfo}.
    
    Task:
    Generate simulated historical sales data for the PAST 6 MONTHS for EACH product in the list.
    
    Context:
    - The currency is Indian Rupees (₹).
    - Use realistic seasonality for ${location} (e.g., consider local weather, festivals like Diwali/Pongal if applicable, or back-to-school seasons).
    - Generate "MonthlyMetric" objects for the last 6 months (Month name, units sold, total revenue, average price).
    - **Simulate slight Price Variations**: The 'averagePrice' should fluctuate slightly month-to-month based on market conditions (discounts, festivals, etc).
    - Provide a short "insight" on why the product performed that way in ${location}.
    
    CRITICAL:
    - Return data for ALL ${products.length} products.
    
    Response JSON Array of HistoricalProductData.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              totalUnitsSold: { type: Type.INTEGER },
              totalRevenue: { type: Type.NUMBER },
              insight: { type: Type.STRING },
              monthlyHistory: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    month: { type: Type.STRING },
                    unitsSold: { type: Type.INTEGER },
                    revenue: { type: Type.NUMBER },
                    averagePrice: { type: Type.NUMBER }
                  },
                  required: ["month", "unitsSold", "revenue", "averagePrice"]
                }
              }
            },
            required: ["productName", "totalUnitsSold", "totalRevenue", "monthlyHistory", "insight"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No historical data");
    return JSON.parse(jsonText) as HistoricalProductData[];
  } catch (error) {
    console.error("Error generating history:", error);
    return [];
  }
};