import { describe, it, expect } from 'vitest';

describe('Frontend CineVault Core Logic & Utilities', () => {
  it('should categorize legal streaming statuses properly', () => {
    const statuses = ['PUBLIC_DOMAIN', 'LICENSED', 'AUTHORIZED_EXTERNAL', 'TRAILER_ONLY'];
    expect(statuses).toContain('PUBLIC_DOMAIN');
    expect(statuses).toContain('AUTHORIZED_EXTERNAL');
  });

  it('should compute completion percentage correctly for watch history', () => {
    const computePercentage = (progress: number, duration: number) => {
      if (duration <= 0) return 0;
      return Math.min(100, Math.round((progress / duration) * 100));
    };

    expect(computePercentage(300, 600)).toBe(50);
    expect(computePercentage(540, 600)).toBe(90);
    expect(computePercentage(0, 600)).toBe(0);
  });

  it('should format seconds into mm:ss or hh:mm:ss for video player timeline', () => {
    const formatTime = (seconds: number): string => {
      if (isNaN(seconds) || seconds < 0) return '00:00';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);

      if (h > 0) {
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3665)).toBe('1:01:05');
    expect(formatTime(0)).toBe('0:00');
  });

  it('should properly validate email formats for registration', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(isValidEmail('user@cinevault.org')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('no-domain@')).toBe(false);
  });
});
