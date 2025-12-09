/**
 * Serialization Service
 * Single Responsibility: Convert MongoDB objects to plain JavaScript objects for client components
 * 
 * This service handles the conversion of ObjectId and Date objects to strings,
 * ensuring data can be safely passed to Client Components in Next.js.
 */

import { ObjectId } from "mongodb";
import type { User, UserSerialized } from "@/models/User";
import type { Fleet, FleetSerialized } from "@/models/Fleet";

/**
 * Serialize a Date to ISO string or null
 */
export function serializeDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === "string") {
    return date;
  }
  return null;
}

/**
 * Serialize an ObjectId to string
 */
export function serializeObjectId(id: ObjectId | string | null | undefined): string | null {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (id instanceof ObjectId) return id.toString();
  return null;
}

/**
 * Serialize a User object for client components
 */
export function serializeUser(user: User): UserSerialized {
  return {
    ...user,
    _id: user._id.toString(),
    emailVerified: serializeDate(user.emailVerified),
    verifyTokenExpires: serializeDate(user.verifyTokenExpires),
    bannedAt: serializeDate(user.bannedAt),
  };
}

/**
 * Serialize an array of User objects
 */
export function serializeUsers(users: User[]): UserSerialized[] {
  return users.map(serializeUser);
}

/**
 * Serialize a Fleet object for client components
 */
export function serializeFleet(truck: Fleet): FleetSerialized {
  // Destructure to exclude assignedOrderId (old field that may exist in DB)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { assignedOrderId, ...truckData } = truck as Fleet & {
    assignedOrderId?: ObjectId;
  };
  
  return {
    ...truckData,
    _id: truck._id?.toString(),
    distributorId: truck.distributorId.toString(),
    assignedOrderIds:
      truck.assignedOrderIds
        ?.filter((id) => id !== null)
        .map((id) => id.toString()) || [],
    availableCapacityKg: truck.capacityKg - truck.currentLoadKg,
    loadPercentage: (truck.currentLoadKg / truck.capacityKg) * 100,
  };
}

/**
 * Serialize an array of Fleet objects
 */
export function serializeFleetArray(trucks: Fleet[]): FleetSerialized[] {
  return trucks.map(serializeFleet);
}

/**
 * Generic object serializer for MongoDB documents
 * Converts ObjectId and Date fields to strings
 */
export function serializeDocument<T extends Record<string, any>>(
  doc: T,
  idField: string = "_id"
): Record<string, any> {
  const serialized: Record<string, any> = { ...doc };

  // Serialize _id or specified id field
  if (serialized[idField]) {
    serialized[idField] = serializeObjectId(serialized[idField]);
  }

  // Serialize all Date fields
  for (const key in serialized) {
    if (serialized[key] instanceof Date) {
      serialized[key] = serializeDate(serialized[key]);
    } else if (serialized[key] instanceof ObjectId) {
      serialized[key] = serializeObjectId(serialized[key]);
    }
  }

  return serialized;
}
