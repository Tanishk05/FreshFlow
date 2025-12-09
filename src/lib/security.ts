/**
 * Security utilities and input sanitization
 * Prevents code injection and malicious input attacks
 */

// Dangerous shell command patterns
const DANGEROUS_PATTERNS = [
  /[;&|`$(){}[\]]/g, // Shell metacharacters
  /wget|curl|sh\s|bash|exec|eval|spawn|child_process/i, // Dangerous commands
  /\.\.\//g, // Path traversal
  /<script|javascript:|on\w+\s*=/i, // XSS patterns
];

// Characters that should be sanitized
const DANGEROUS_CHARS = /[<>'"&]/g;

/**
 * Sanitize string input to prevent code injection
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized.trim();
}

/**
 * Validate that input doesn't contain shell commands
 */
export function validateNoShellCommands(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }

  const dangerousCommands = [
    "wget",
    "curl",
    "sh ",
    "bash",
    "exec",
    "eval",
    "spawn",
    "child_process",
    "cat ",
    "rm ",
    "chmod",
    "|",
    ";",
    "&",
    "`",
    "$(",
  ];

  const lowerInput = input.toLowerCase();
  return !dangerousCommands.some((cmd) => lowerInput.includes(cmd));
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper (simple in-memory version)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up old rate limit records
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}

