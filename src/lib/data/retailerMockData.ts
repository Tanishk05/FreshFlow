import { StoreItem, PurchaseOrder, PricingSuggestion } from "./types";

export const initialStoreInventory: StoreItem[] = [
  {
    id: "s1",
    name: "Bananas",
    stock: 150,
    reorderPoint: 50,
    shelfLifeDays: 2,
    status: "expiring",
  },
  {
    id: "s2",
    name: "Avocados",
    stock: 80,
    reorderPoint: 30,
    shelfLifeDays: 1,
    status: "expiring",
  },
  {
    id: "s3",
    name: "Organic Milk",
    stock: 40,
    reorderPoint: 20,
    shelfLifeDays: 5,
    status: "fresh",
  },
  {
    id: "s4",
    name: "Tomatoes",
    stock: 200,
    reorderPoint: 100,
    shelfLifeDays: 4,
    status: "fresh",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    distributorName: "FreshCorp Logistics",
    itemCount: 5,
    status: "shipped",
    eta: "2025-11-08T20:00:00.000Z",
    liveTemperature: 3.5,
  },
  {
    id: "po2",
    distributorName: "ColdChain Inc.",
    itemCount: 2,
    status: "pending",
    eta: "2025-11-09T12:00:00.000Z",
    liveTemperature: 0,
  },
];

export const initialPricingSuggestions: PricingSuggestion[] = [
  {
    id: "ps1",
    itemId: "s1",
    itemName: "Bananas",
    currentPrice: 0.99,
    suggestedPrice: 0.69,
    reason: "Nearing expiry (2 days)",
  },
  {
    id: "ps2",
    itemId: "s2",
    itemName: "Avocados",
    currentPrice: 1.49,
    suggestedPrice: 0.99,
    reason: "High stock & 1 day expiry",
  },
];
