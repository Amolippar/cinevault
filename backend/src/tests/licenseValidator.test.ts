import { describe, it, expect } from 'vitest';
import {
  LicenseValidator,
  ADMIN_COPYRIGHT_WARNING,
  LICENSE_EXPIRED_MESSAGE,
} from '../services/licenseValidator';

describe('Content Rights Management & Verification Engine', () => {
  const baseValidInput = {
    title: 'Night of the Living Dead',
    description: 'Classic zombie horror film published in 1968.',
    posterUrl: 'https://images.unsplash.com/poster.jpg',
    backdropUrl: 'https://images.unsplash.com/backdrop.jpg',
    releaseYear: 1968,
    language: 'English',
    director: 'George A. Romero',
    trailerUrl: 'https://youtube.com/watch?v=sample',
    sourceProvider: 'Internet Archive',
    rightsHolder: 'Public Domain Worldwide',
    licenseNotes: '1968 US publication without statutory copyright notice.',
    videoSourceUrl: 'https://archive.org/video.mp4',
    contentRightsStatus: 'PUBLIC_DOMAIN' as const,
  };

  it('contains the mandatory admin copyright warning', () => {
    expect(ADMIN_COPYRIGHT_WARNING).toContain('Only publish content that you own or are authorized to distribute');
  });

  it('Rule 1 (PUBLIC_DOMAIN): Admin can publish with verified rights holder and notes', () => {
    const result = LicenseValidator.validateForPublishing(baseValidInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('Rule 2 (OWNED_CONTENT): Requires confirmed ownership before publishing', () => {
    const unconfirmed = {
      ...baseValidInput,
      contentRightsStatus: 'OWNED_CONTENT' as const,
      ownershipConfirmed: false,
    };
    const res1 = LicenseValidator.validateForPublishing(unconfirmed);
    expect(res1.isValid).toBe(false);
    expect(res1.errors[0]).toContain('confirm ownership');

    const confirmed = {
      ...unconfirmed,
      ownershipConfirmed: true,
    };
    const res2 = LicenseValidator.validateForPublishing(confirmed);
    expect(res2.isValid).toBe(true);
  });

  it('Rule 3 (LICENSED): Requires licenseDocument and valid date range before publishing', () => {
    const missingDoc = {
      ...baseValidInput,
      contentRightsStatus: 'LICENSED' as const,
      licenseDocument: '',
      licenseStartDate: new Date('2024-01-01'),
      licenseEndDate: new Date('2030-01-01'),
    };
    const res1 = LicenseValidator.validateForPublishing(missingDoc);
    expect(res1.isValid).toBe(false);
    expect(res1.errors.join(' ')).toContain('Supporting license document');

    const validLicensed = {
      ...missingDoc,
      licenseDocument: 'LIC-CONTRACT-2024-001',
    };
    const res2 = LicenseValidator.validateForPublishing(validLicensed);
    expect(res2.isValid).toBe(true);
  });

  it('Rule 4 (AUTHORIZED_PROVIDER): Rejects direct video file uploads and requires external streaming link', () => {
    const withDirectUpload = {
      ...baseValidInput,
      contentRightsStatus: 'AUTHORIZED_PROVIDER' as const,
      videoSourceUrl: 'https://server.com/pirated.mp4',
      externalStreamUrl: 'https://partner.com/watch',
    };
    const res1 = LicenseValidator.validateMovieInput(withDirectUpload);
    expect(res1.isValid).toBe(false);
    expect(res1.errors.join(' ')).toContain('Do not upload direct movie files for AUTHORIZED_PROVIDER');

    const validExternal = {
      ...baseValidInput,
      contentRightsStatus: 'AUTHORIZED_PROVIDER' as const,
      videoSourceUrl: null,
      externalStreamUrl: 'https://paramountplus.com/movies/sample',
    };
    const res2 = LicenseValidator.validateForPublishing(validExternal);
    expect(res2.isValid).toBe(true);
  });

  it('Rule 5 (TRAILER_ONLY): Rejects full movie direct or external streaming URLs', () => {
    const invalidTrailerOnly = {
      ...baseValidInput,
      contentRightsStatus: 'TRAILER_ONLY' as const,
      videoSourceUrl: 'https://server.com/movie.mp4',
    };
    const res = LicenseValidator.validateMovieInput(invalidTrailerOnly);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Direct video URL cannot be provided for TRAILER_ONLY');
  });

  it('Rule 6 (UNVERIFIED): Movie CANNOT be published', () => {
    const unverified = {
      ...baseValidInput,
      contentRightsStatus: 'UNVERIFIED' as const,
    };
    const res = LicenseValidator.validateForPublishing(unverified);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('UNVERIFIED content cannot be published');
  });

  it('Enforces Approval Workflow (DRAFT → RIGHTS_REVIEW → APPROVED → PUBLISHED)', () => {
    // Valid transitions
    const t1 = LicenseValidator.validateWorkflowTransition('DRAFT', 'RIGHTS_REVIEW', baseValidInput);
    expect(t1.isValid).toBe(true);

    const t2 = LicenseValidator.validateWorkflowTransition('RIGHTS_REVIEW', 'APPROVED', baseValidInput);
    expect(t2.isValid).toBe(true);

    const t3 = LicenseValidator.validateWorkflowTransition('APPROVED', 'PUBLISHED', baseValidInput);
    expect(t3.isValid).toBe(true);

    const t4 = LicenseValidator.validateWorkflowTransition('PUBLISHED', 'UNPUBLISHED', baseValidInput);
    expect(t4.isValid).toBe(true);

    // Invalid direct skip from DRAFT to PUBLISHED
    const invalidSkip = LicenseValidator.validateWorkflowTransition('DRAFT', 'PUBLISHED', baseValidInput);
    expect(invalidSkip.isValid).toBe(false);
    expect(invalidSkip.errors[0]).toContain('Invalid workflow transition');
  });

  it('Automatically prevents streaming when licenseEndDate < current date with exact notice message', () => {
    const expiredMovie = {
      id: 'movie-exp-1',
      title: 'Expired Film',
      publicationStatus: 'PUBLISHED',
      contentRightsStatus: 'LICENSED',
      videoSourceUrl: 'https://server.com/stream.mp4',
      licenseEndDate: new Date(Date.now() - 86400000), // Yesterday
    };

    const sanitized = LicenseValidator.sanitizePublicMovie(expiredMovie);
    expect(sanitized.isLicenseExpired).toBe(true);
    expect(sanitized.canStreamDirect).toBe(false);
    expect(sanitized.videoSourceUrl).toBeNull();
    expect(sanitized.unavailableNotice).toBe(LICENSE_EXPIRED_MESSAGE);
    expect(sanitized.unavailableNotice).toBe(
      'This content is currently unavailable because its distribution license has expired.'
    );
  });

  it('Never automatically determines status based only on title', () => {
    // A famous title like 'Night of the Living Dead' defaults to UNVERIFIED unless explicitly verified
    const rawInput = {
      ...baseValidInput,
      contentRightsStatus: 'UNVERIFIED' as const,
    };
    const res = LicenseValidator.validateForPublishing(rawInput);
    expect(res.isValid).toBe(false);
  });
});
