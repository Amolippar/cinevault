import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../utils/jwt';

describe('JWT Utility Functions', () => {
  it('should sign and verify valid JWT payload', () => {
    const payload = {
      userId: 'user-uuid-12345',
      email: 'test@cinevault.org',
      role: 'USER' as const,
      name: 'Test Viewer',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.name).toBe(payload.name);
  });

  it('should throw error for tampered token', () => {
    const payload = {
      userId: 'user-uuid-12345',
      email: 'test@cinevault.org',
      role: 'USER' as const,
      name: 'Test Viewer',
    };

    const token = signToken(payload);
    const tampered = token.slice(0, -5) + 'abcde';

    expect(() => verifyToken(tampered)).toThrow();
  });
});
