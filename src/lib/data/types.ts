// --- AI SAVINGS (For Gain-Sharing Model) ---
export type AISavings = {
  total: number;
  fromSpoilageReduction: number;
  fromDynamicPricing?: number; // Retailer specific
  fromFuelReduction?: number; // Distributor specific
};

// --- RETAILER TYPES ---
export type StoreItem = {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number; // Days remaining
  status: "fresh" | "expiring" | "spoiled";
};

export type PurchaseOrder = {
  id: string;
  distributorName: string;
  itemCount: number;
  status: "pending" | "shipped" | "delivered";
  eta: string; // ISO date string
  liveTemperature: number; // From Smart Cold Chain
};

export type PricingSuggestion = {
  id: string;
  itemId: string;
  itemName: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string; // e.g., "Nearing expiry", "High demand"
};

// --- DISTRIBUTOR TYPES ---
export type WarehouseItem = {
  id: string;
  name: string;
  lotNumber: string;
  quantity: number; // e.g., in pallets
  tempZone: "Ambient" | "Cold (2-4°C)" | "Frozen";
  receivedDate: string; // ISO date string
};

export type RetailerOrder = {
  id: string;
  retailerName: string;
  itemCount: number;
  destination: string;
  status: "pending" | "assigned" | "out-for-delivery";
};

export type Truck = {
  id: string;
  driver: string;
  status: "idle" | "loading" | "en-route" | "delayed";
  destination: string;
  eta: string; // ISO date string
  liveTemperature: number;
};

export type LogisticsAlert = {
  id: string;
  type: "risk" | "advisory";
  title: string;
  message: string;
  truckId?: string;
};

// --- FARMER TYPES ---
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
