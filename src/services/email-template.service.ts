/**
 * Email Template Service
 * Implements Template Method Pattern for email generation
 * Defines skeleton of email generation algorithm with customizable steps
 */

export interface EmailTemplateData {
  userName: string;
  userRole: string;
  [key: string]: any;
}

export interface EmailTemplate {
  generateSubject(data: EmailTemplateData): string;
  generateBody(data: EmailTemplateData): string;
  generateFooter(): string;
  generateEmail(data: EmailTemplateData): string;
}

/**
 * Base Email Template
 * Defines template method for email generation
 */
export abstract class BaseEmailTemplate implements EmailTemplate {
  /**
   * Template Method - defines the algorithm skeleton
   */
  generateEmail(data: EmailTemplateData): string {
    const header = this.generateHeader(data);
    const body = this.generateBody(data);
    const footer = this.generateFooter();
    return `${header}${body}${footer}`;
  }

  /**
   * Generate email header (common for all emails)
   */
  protected generateHeader(data: EmailTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.generateSubject(data)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">FreshFlow</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Fresh Food Supply Chain Management</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
`;
  }

  /**
   * Generate email subject (must be implemented by subclasses)
   */
  abstract generateSubject(data: EmailTemplateData): string;

  /**
   * Generate email body (must be implemented by subclasses)
   */
  abstract generateBody(data: EmailTemplateData): string;

  /**
   * Generate email footer (common for all emails)
   */
  generateFooter(): string {
    return `
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FreshFlow. AI-powered supply chain management.</p>
    <p>This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
`;
  }
}

/**
 * Order Notification Email Template
 */
export class OrderNotificationEmailTemplate extends BaseEmailTemplate {
  generateSubject(data: EmailTemplateData): string {
    const eventType = data.eventType || "update";
    const eventTitles: Record<string, string> = {
      created: "New Order Received",
      approved: "Order Approved",
      assigned: "Order Assigned to Distributor",
      "picked-up": "Order Picked Up",
      "in-transit": "Order In Transit",
      delivered: "Order Delivered",
      cancelled: "Order Cancelled",
    };

    return eventTitles[eventType] || "Order Update";
  }

  generateBody(data: EmailTemplateData): string {
    const eventType = data.eventType || "update";
    const orderInfo = data.orderInfo || {};
    const emoji = this.getEventEmoji(eventType);

    return `
    <h2 style="color: #10b981; margin-top: 0;">${emoji} ${this.generateSubject(
      data
    )}</h2>
    <p>Hello ${data.userName},</p>
    <p>${this.getEventMessage(eventType, orderInfo)}</p>
    ${this.generateOrderDetails(orderInfo)}
    <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <a href="${data.dashboardUrl || "https://freshflow.com/dashboard"}" 
         style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Dashboard
      </a>
    </div>
`;
  }

  private getEventEmoji(eventType: string): string {
    const emojis: Record<string, string> = {
      created: "🎉",
      approved: "✅",
      assigned: "📦",
      "picked-up": "🚚",
      "in-transit": "🚛",
      delivered: "✓",
      cancelled: "❌",
    };
    return emojis[eventType] || "📧";
  }

  private getEventMessage(eventType: string, orderInfo: any): string {
    const messages: Record<string, string> = {
      created: `A new order has been placed for ${
        orderInfo.produceName || "your produce"
      }.`,
      approved: `Your order for ${
        orderInfo.produceName || "produce"
      } has been approved by the farmer.`,
      assigned: `Order ${
        orderInfo.orderId || ""
      } has been assigned to a distributor and is ready for pickup.`,
      "picked-up": `Order ${
        orderInfo.orderId || ""
      } has been picked up and is on its way.`,
      "in-transit": `Order ${
        orderInfo.orderId || ""
      } is currently in transit to the destination.`,
      delivered: `Order ${
        orderInfo.orderId || ""
      } has been successfully delivered!`,
      cancelled: `Order ${orderInfo.orderId || ""} has been cancelled.`,
    };
    return messages[eventType] || "Your order has been updated.";
  }

  private generateOrderDetails(orderInfo: any): string {
    if (!orderInfo) return "";

    return `
    <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
      <h3 style="margin-top: 0; color: #374151;">Order Details</h3>
      ${
        orderInfo.produceName
          ? `<p><strong>Product:</strong> ${orderInfo.produceName}</p>`
          : ""
      }
      ${
        orderInfo.quantity
          ? `<p><strong>Quantity:</strong> ${orderInfo.quantity} ${
              orderInfo.unit || ""
            }</p>`
          : ""
      }
      ${
        orderInfo.totalPrice
          ? `<p><strong>Total:</strong> ₹${orderInfo.totalPrice.toLocaleString(
              "en-IN"
            )}</p>`
          : ""
      }
      ${
        orderInfo.deliveryFee
          ? `<p><strong>Delivery Fee:</strong> ₹${orderInfo.deliveryFee.toFixed(
              2
            )}</p>`
          : ""
      }
    </div>
`;
  }
}

/**
 * Alert Email Template
 */
export class AlertEmailTemplate extends BaseEmailTemplate {
  generateSubject(data: EmailTemplateData): string {
    const alertCount = data.alerts?.length || 0;
    return `${alertCount} Alert${alertCount > 1 ? "s" : ""} - Action Required`;
  }

  generateBody(data: EmailTemplateData): string {
    const alerts = data.alerts || [];
    const criticalAlerts = alerts.filter((a: any) => a.type === "critical");
    const warningAlerts = alerts.filter((a: any) => a.type === "warning");

    return `
    <h2 style="color: ${
      criticalAlerts.length > 0 ? "#ef4444" : "#f59e0b"
    }; margin-top: 0;">
      ${criticalAlerts.length > 0 ? "🚨" : "⚠️"} ${this.generateSubject(data)}
    </h2>
    <p>Hello ${data.userName},</p>
    <p>You have ${alerts.length} alert${
      alerts.length > 1 ? "s" : ""
    } that require your attention:</p>
    ${this.generateAlertsList(alerts)}
    <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <a href="${data.dashboardUrl || "https://freshflow.com/dashboard"}" 
         style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Alerts
      </a>
    </div>
`;
  }

  private generateAlertsList(alerts: any[]): string {
    return alerts
      .map(
        (alert) => `
    <div style="margin: 15px 0; padding: 15px; background: #ffffff; border-left: 4px solid ${
      alert.type === "critical"
        ? "#ef4444"
        : alert.type === "warning"
        ? "#f59e0b"
        : "#3b82f6"
    }; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; color: #111827;">${alert.title}</h3>
      <p style="margin: 0; color: #4b5563;">${alert.message}</p>
      ${
        alert.produceName
          ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">📦 Product: ${alert.produceName}</p>`
          : ""
      }
    </div>
`
      )
      .join("");
  }
}

/**
 * Email Template Factory
 */
export class EmailTemplateFactory {
  static createOrderNotificationTemplate(): EmailTemplate {
    return new OrderNotificationEmailTemplate();
  }

  static createAlertTemplate(): EmailTemplate {
    return new AlertEmailTemplate();
  }
}
