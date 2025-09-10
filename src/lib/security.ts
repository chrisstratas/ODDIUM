import { z } from 'zod';

// Password strength validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

// Access code validation schema
export const accessCodeSchema = z
  .string()
  .min(1, 'Access code is required')
  .max(50, 'Access code is too long')
  .regex(/^[A-Z0-9-]+$/, 'Access code can only contain uppercase letters, numbers, and hyphens');

// Input sanitization
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Rate limiting simulation (in production, use Redis or similar)
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  isRateLimited(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now - record.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }
    
    if (record.count >= maxAttempts) {
      return true;
    }
    
    record.count++;
    record.lastAttempt = now;
    return false;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

// Security event logging
export interface SecurityEvent {
  type: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'access_code_attempt' | 'rate_limit_exceeded';
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
  details?: Record<string, any>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  
  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    this.events.push(securityEvent);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Security Event]', securityEvent);
    }
  }
  
  getEvents(type?: SecurityEvent['type']): SecurityEvent[] {
    return type ? this.events.filter(e => e.type === type) : this.events;
  }
  
  getFailedAttempts(email: string, windowMs: number = 15 * 60 * 1000): number {
    const cutoff = Date.now() - windowMs;
    return this.events.filter(
      e => e.type === 'auth_failure' && e.email === email && e.timestamp > cutoff
    ).length;
  }
}

export const securityLogger = new SecurityLogger();

// Session timeout management
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
  
  static getSessionExpiry(): number {
    const stored = localStorage.getItem('session_expiry');
    return stored ? parseInt(stored, 10) : 0;
  }
  
  static updateSessionExpiry(): void {
    const expiry = Date.now() + this.SESSION_TIMEOUT;
    localStorage.setItem('session_expiry', expiry.toString());
  }
  
  static isSessionExpired(): boolean {
    const expiry = this.getSessionExpiry();
    return expiry > 0 && Date.now() > expiry;
  }
  
  static shouldShowWarning(): boolean {
    const expiry = this.getSessionExpiry();
    return expiry > 0 && Date.now() > (expiry - this.WARNING_TIME);
  }
  
  static clearSession(): void {
    localStorage.removeItem('session_expiry');
  }
}

// Content Security Policy helper
export function getCSPMeta(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://gmwdwxkfygppiavyysyv.supabase.co wss://gmwdwxkfygppiavyysyv.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
}
