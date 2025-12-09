/**
 * Validation Chain Service
 * Implements Chain of Responsibility Pattern for validation pipelines
 * Allows sequential validation with early termination on failure
 */

export interface ValidationContext {
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}

export interface ValidationHandler {
  setNext(handler: ValidationHandler): ValidationHandler;
  handle(context: ValidationContext): Promise<ValidationResult>;
}

/**
 * Base validation handler with chain support
 */
abstract class BaseValidationHandler implements ValidationHandler {
  private nextHandler: ValidationHandler | null = null;

  setNext(handler: ValidationHandler): ValidationHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(context: ValidationContext): Promise<ValidationResult> {
    // Execute current validation
    const result = await this.validate(context);

    // If validation fails, return immediately
    if (!result.valid) {
      return result;
    }

    // If validation passes and there's a next handler, continue chain
    if (this.nextHandler) {
      return await this.nextHandler.handle(context);
    }

    // End of chain, all validations passed
    return { valid: true };
  }

  protected abstract validate(
    context: ValidationContext
  ): Promise<ValidationResult>;
}

/**
 * Email Validation Handler
 */
export class EmailValidationHandler extends BaseValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const email = context.email;
    if (!email) {
      return { valid: true }; // Optional field
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return {
        valid: false,
        error: "Invalid email format",
        field: "email",
      };
    }

    return { valid: true };
  }
}

/**
 * Phone Validation Handler
 */
export class PhoneValidationHandler extends BaseValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const phone = context.phone;
    if (!phone) {
      return { valid: true }; // Optional field
    }

    // Basic phone validation (can be enhanced)
    if (phone.length < 10 || phone.length > 15) {
      return {
        valid: false,
        error: "Phone number must be between 10 and 15 digits",
        field: "phone",
      };
    }

    return { valid: true };
  }
}

/**
 * Coordinate Validation Handler
 */
export class CoordinateValidationHandler extends BaseValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const latitude = context.latitude;
    const longitude = context.longitude;

    if (!latitude || !longitude) {
      return {
        valid: false,
        error: "Location coordinates are required",
        field: "coordinates",
      };
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return {
        valid: false,
        error: "Invalid coordinates. Please provide valid numbers",
        field: "coordinates",
      };
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        valid: false,
        error:
          "Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180",
        field: "coordinates",
      };
    }

    return { valid: true };
  }
}

/**
 * Username Validation Handler
 */
export class UsernameValidationHandler extends BaseValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const username = context.username;
    if (!username) {
      return { valid: true }; // Optional field
    }

    if (username.length < 3) {
      return {
        valid: false,
        error: "Username must be at least 3 characters",
        field: "username",
      };
    }

    // Check for valid characters
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return {
        valid: false,
        error: "Username can only contain letters, numbers, and underscores",
        field: "username",
      };
    }

    return { valid: true };
  }
}

/**
 * Security Validation Handler
 */
export class SecurityValidationHandler extends BaseValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const { validateNoShellCommands, sanitizeInput } = await import(
      "@/lib/security"
    );

    // Validate all string fields for security
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === "string") {
        if (!validateNoShellCommands(value)) {
          return {
            valid: false,
            error: `Invalid input detected in ${key}`,
            field: key,
          };
        }
      }
    }

    return { valid: true };
  }
}

/**
 * Required Field Validation Handler
 */
export class RequiredFieldValidationHandler extends BaseValidationHandler {
  private requiredFields: string[];

  constructor(requiredFields: string[]) {
    super();
    this.requiredFields = requiredFields;
  }

  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    for (const field of this.requiredFields) {
      if (!context[field] || context[field] === "") {
        return {
          valid: false,
          error: `${field} is required`,
          field,
        };
      }
    }

    return { valid: true };
  }
}

/**
 * Validation Chain Builder
 * Provides fluent interface for building validation chains
 */
export class ValidationChainBuilder {
  private handlers: ValidationHandler[] = [];
  private head: ValidationHandler | null = null;

  addHandler(handler: ValidationHandler): this {
    this.handlers.push(handler);
    return this;
  }

  build(): ValidationHandler {
    if (this.handlers.length === 0) {
      throw new Error("Validation chain must have at least one handler");
    }

    // Build chain by linking handlers
    for (let i = 0; i < this.handlers.length - 1; i++) {
      this.handlers[i].setNext(this.handlers[i + 1]);
    }

    // Return first handler (head of chain)
    return this.handlers[0];
  }
}

/**
 * Pre-built validation chains for common use cases
 */
export class ValidationChains {
  /**
   * Signup validation chain
   */
  static signupValidation(): ValidationHandler {
    return new ValidationChainBuilder()
      .addHandler(new SecurityValidationHandler())
      .addHandler(
        new RequiredFieldValidationHandler(["role", "latitude", "longitude"])
      )
      .addHandler(new EmailValidationHandler())
      .addHandler(new PhoneValidationHandler())
      .addHandler(new UsernameValidationHandler())
      .addHandler(new CoordinateValidationHandler())
      .build();
  }

  /**
   * Order validation chain
   */
  static orderValidation(): ValidationHandler {
    return new ValidationChainBuilder()
      .addHandler(new SecurityValidationHandler())
      .addHandler(new RequiredFieldValidationHandler(["produceId", "quantity"]))
      .build();
  }

  /**
   * User update validation chain
   */
  static userUpdateValidation(): ValidationHandler {
    return new ValidationChainBuilder()
      .addHandler(new SecurityValidationHandler())
      .addHandler(new EmailValidationHandler())
      .addHandler(new PhoneValidationHandler())
      .addHandler(new UsernameValidationHandler())
      .build();
  }
}
