import { WarehouseItem, RetailerOrder, Truck, LogisticsAlert } from "./types";

export const initialWarehouseStock: WarehouseItem[] = [
  {
    id: "w1",
    name: "Strawberries",
    lotNumber: "LOT-A12",
    quantity: 50,
    tempZone: "Cold (2-4°C)",
    receivedDate: "2025-11-07T17:00:00.000Z",
  },
  {
    id: "w2",
    name: "Lettuce",
    lotNumber: "LOT-B09",
    quantity: 100,
    tempZone: "Cold (2-4°C)",
    receivedDate: "2025-11-08T17:00:00.000Z",
  },
  {
    id: "w3",
    name: "Dry Pasta",
    lotNumber: "LOT-C77",
    quantity: 300,
    tempZone: "Ambient",
    receivedDate: "2025-11-03T17:00:00.000Z",
  },
];

export const initialRetailerOrders: RetailerOrder[] = [
  {
    id: "ro1",
    retailerName: "City Grocers",
    itemCount: 12,
    destination: "123 Main St",
    status: "pending",
  },
  {
    id: "ro2",
    retailerName: "Main St Market",
    itemCount: 8,
    destination: "456 Oak Ave",
    status: "pending",
  },
  {
    id: "ro3",
    retailerName: "Suburban Foods",
    itemCount: 20,
    destination: "789 Pine Ln",
    status: "assigned",
  },
];

export const initialFleet: Truck[] = [
  {
    id: "T-101",
    driver: "J. Doe",
    status: "en-route",
    destination: "Suburban Foods",
    eta: "2025-11-08T19:00:00.000Z",
    liveTemperature: 2.8,
  },
  {
    id: "T-102",
    driver: "S. Smith",
    status: "idle",
    destination: "",
    eta: "",
    liveTemperature: 3.0,
  },
  {
    id: "T-103",
    driver: "M. Kim",
    status: "delayed",
    destination: "City Grocers",
    eta: "2025-11-08T18:00:00.000Z",
    liveTemperature: 4.5,
  },
];

export const initialLogisticsAlerts: LogisticsAlert[] = [
  {
    id: "a1",
    type: "risk",
    title: "TEMP. ALERT: T-103",
    message: "Zone B at 4.5°C (Target 2°C). Cooling unit malfunction.",
    truckId: "T-103",
  },
  {
    id: "a2",
    type: "advisory",
    title: "ROUTE ALERT: T-101",
    message: "Accident on I-95. AI rerouted via US-1. ETA updated.",
    truckId: "T-101",
  },
];
