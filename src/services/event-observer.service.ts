/**
 * Event Observer Service
 * Implements Observer Pattern for event-driven architecture
 * Allows decoupled event handling for webhooks, notifications, and other side effects
 */

export type OrderEventType =
  | "order.created"
  | "order.approved"
  | "order.assigned"
  | "order.picked_up"
  | "order.in_transit"
  | "order.delivered"
  | "order.cancelled"
  | "order.rejected";

export interface OrderEvent {
  type: OrderEventType;
  orderId: string;
  timestamp: Date;
  data: {
    farmerId?: string;
    retailerId?: string;
    distributorId?: string;
    produceName?: string;
    quantity?: number;
    unit?: string;
    status?: string;
    deliveryFee?: number;
    destination?: string;
    [key: string]: any;
  };
}

export interface EventObserver {
  onEvent(event: OrderEvent): Promise<void>;
  getObserverName(): string;
}

/**
 * Webhook Observer
 * Handles webhook notifications
 */
export class WebhookObserver implements EventObserver {
  async onEvent(event: OrderEvent): Promise<void> {
    try {
      const { triggerOrderWebhook } = await import("@/actions/webhookActions");
      await triggerOrderWebhook({
        event: event.type,
        orderId: event.orderId,
        farmerId: event.data.farmerId,
        retailerId: event.data.retailerId,
        distributorId: event.data.distributorId,
        produceName: event.data.produceName || "",
        quantity: event.data.quantity || 0,
        unit: event.data.unit || "",
        status: event.data.status || "",
        deliveryFee: event.data.deliveryFee,
        destination: event.data.destination,
      });
    } catch (error) {
      console.error("[WebhookObserver] Error handling event:", error);
      // Don't throw - observers should not break the event flow
    }
  }

  getObserverName(): string {
    return "WebhookObserver";
  }
}

/**
 * Notification Observer
 * Handles in-app notifications
 */
export class NotificationObserver implements EventObserver {
  async onEvent(event: OrderEvent): Promise<void> {
    try {
      // The webhook system already handles notifications
      // This observer can be extended for additional notification logic
      console.log(
        `[NotificationObserver] Processing ${event.type} for order ${event.orderId}`
      );
    } catch (error) {
      console.error("[NotificationObserver] Error handling event:", error);
    }
  }

  getObserverName(): string {
    return "NotificationObserver";
  }
}

/**
 * Analytics Observer
 * Tracks events for analytics purposes
 */
export class AnalyticsObserver implements EventObserver {
  async onEvent(event: OrderEvent): Promise<void> {
    try {
      // Placeholder for analytics tracking
      console.log(
        `[AnalyticsObserver] Tracking ${event.type} for order ${event.orderId}`
      );
      // In production, this would send data to analytics service
    } catch (error) {
      console.error("[AnalyticsObserver] Error handling event:", error);
    }
  }

  getObserverName(): string {
    return "AnalyticsObserver";
  }
}

/**
 * Event Subject (Observable)
 * Manages observers and notifies them of events
 */
export class OrderEventSubject {
  private observers: EventObserver[] = [];

  /**
   * Subscribe an observer to events
   */
  subscribe(observer: EventObserver): void {
    if (
      !this.observers.find(
        (o) => o.getObserverName() === observer.getObserverName()
      )
    ) {
      this.observers.push(observer);
    }
  }

  /**
   * Unsubscribe an observer
   */
  unsubscribe(observer: EventObserver): void {
    this.observers = this.observers.filter(
      (o) => o.getObserverName() !== observer.getObserverName()
    );
  }

  /**
   * Notify all observers of an event
   */
  async notify(event: OrderEvent): Promise<void> {
    const promises = this.observers.map((observer) => observer.onEvent(event));
    await Promise.allSettled(promises); // Don't fail if one observer fails
  }

  /**
   * Get all subscribed observers
   */
  getObservers(): EventObserver[] {
    return [...this.observers];
  }

  /**
   * Clear all observers
   */
  clear(): void {
    this.observers = [];
  }
}

// Export singleton event subject with default observers
export const orderEventSubject = new OrderEventSubject();

// Register default observers
orderEventSubject.subscribe(new WebhookObserver());
orderEventSubject.subscribe(new NotificationObserver());
orderEventSubject.subscribe(new AnalyticsObserver());

/**
 * Event Emitter Helper
 * Convenience function to emit order events
 */
export async function emitOrderEvent(event: OrderEvent): Promise<void> {
  await orderEventSubject.notify(event);
}
