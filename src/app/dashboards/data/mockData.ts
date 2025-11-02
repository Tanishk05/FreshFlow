export type Crop = {
  id: string;
  name: string;
  quantityKg: number;
  harvestDate: string; // ISO
  pricePerKg: number;
  status: "growing" | "ready" | "sold";
};

export type Order = {
  id: string;
  item: string;
  quantity: number;
  expiryDate: string; // ISO
  currentPrice: number;
  suggestedDiscount?: number;
  status: "pending" | "completed" | "cancelled";
};

export type Shipment = {
  id: string;
  origin: string;
  destination: string;
  status: "in-transit" | "delivered" | "delayed";
  temperatureC: number;
  eta: string;
};

// Use a static time for all mock data to prevent hydration errors
const baseTime = new Date("2025-11-03T12:00:00Z").getTime();

export const initialCrops: Crop[] = [
  {
    id: "c1",
    name: "Tomatoes",
    quantityKg: 1200,
    harvestDate: new Date(baseTime + 3 * 24 * 3600 * 1000).toISOString(),
    pricePerKg: 1.8,
    status: "growing",
  },
  {
    id: "c2",
    name: "Bananas",
    quantityKg: 800,
    harvestDate: new Date(baseTime + 1 * 24 * 3600 * 1000).toISOString(),
    pricePerKg: 1.2,
    status: "ready",
  },
  {
    id: "c3",
    name: "Spinach",
    quantityKg: 300,
    harvestDate: new Date(baseTime).toISOString(),
    pricePerKg: 2.1,
    status: "ready",
  },
  {
    id: "c4",
    name: "Apples",
    quantityKg: 500,
    harvestDate: new Date(baseTime - 5 * 24 * 3600 * 1000).toISOString(),
    pricePerKg: 2.5,
    status: "sold",
  },
];

export const initialOrders: Order[] = [
  {
    id: "o1",
    item: "Tomatoes",
    quantity: 100,
    expiryDate: new Date(baseTime + 5 * 24 * 3600 * 1000).toISOString(),
    currentPrice: 1.9,
    suggestedDiscount: 0,
    status: "pending",
  },
  {
    id: "o2",
    item: "Bananas",
    quantity: 50,
    expiryDate: new Date(baseTime + 2 * 24 * 3600 * 1000).toISOString(),
    currentPrice: 1.15,
    suggestedDiscount: 10,
    status: "completed",
  },
  {
    id: "o3",
    item: "Spinach",
    quantity: 75,
    expiryDate: new Date(baseTime + 3 * 24 * 3600 * 1000).toISOString(),
    currentPrice: 2.2,
    suggestedDiscount: 0,
    status: "pending",
  },
];

export const initialShipments: Shipment[] = [
  {
    id: "s1",
    origin: "Farm A",
    destination: "City Depot",
    status: "in-transit",
    temperatureC: 4,
    eta: new Date(baseTime + 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "s2",
    origin: "Farm B",
    destination: "Retail Hub",
    status: "delayed",
    temperatureC: 8, // High temp alert
    eta: new Date(baseTime + 36 * 3600 * 1000).toISOString(),
  },
];
