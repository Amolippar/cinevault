import { describe, it, expect } from 'vitest';
import { createSlug } from '../utils/slugify';

describe('SEO Slug Generator', () => {
  it('should generate lowercased, hyphenated SEO-friendly slugs', () => {
    const slug = createSlug('Night of the Living Dead', 1968);
    expect(slug).toBe('night-of-the-living-dead-1968');
  });

  it('should remove special characters and sanitize punctuation', () => {
    const slug = createSlug("Spider-Man: Across the Spider-Verse! Part 1?", 2023);
    expect(slug).toBe('spider-man-across-the-spider-verse-part-1-2023');
  });

  it('should handle title without year gracefully', () => {
    const slug = createSlug('Metropolis');
    expect(slug).toBe('metropolis');
  });
});
