import { ContentRightsStatus, PublicationStatus } from '../types';

export interface MovieRightsInput {
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string | null;
  releaseYear: number;
  language: string;
  director?: string | null;
  trailerUrl: string;
  videoSourceUrl?: string | null;
  externalStreamUrl?: string | null;
  sourceProvider?: string | null;
  contentRightsStatus: ContentRightsStatus;
  publicationStatus?: PublicationStatus;
  rightsHolder?: string | null;
  licenseDocument?: string | null;
  licenseStartDate?: Date | string | null;
  licenseEndDate?: Date | string | null;
  ownershipConfirmed?: boolean;
  licenseNotes: string;
}

export interface RightsValidationResult {
  isValid: boolean;
  errors: string[];
}

export const ADMIN_COPYRIGHT_WARNING =
  'Only publish content that you own or are authorized to distribute. Uploading or distributing copyrighted content without permission may violate copyright law.';

export const LICENSE_EXPIRED_MESSAGE =
  'This content is currently unavailable because its distribution license has expired.';

export class LicenseValidator {
  /**
   * Validates mandatory content-rights verification fields for every movie.
   */
  public static validateMovieInput(input: MovieRightsInput): RightsValidationResult {
    const errors: string[] = [];

    // Title
    if (!input.title || !input.title.trim()) {
      errors.push('Title is mandatory.');
    }

    // Description
    if (!input.description || input.description.trim().length < 10) {
      errors.push('Description is mandatory and must be at least 10 characters.');
    }

    // Poster & Backdrop
    if (!input.posterUrl || !input.posterUrl.trim()) {
      errors.push('Poster image URL is mandatory.');
    }

    // Release Year & Language
    if (!input.releaseYear || isNaN(input.releaseYear)) {
      errors.push('Valid release year is mandatory.');
    }
    if (!input.language || !input.language.trim()) {
      errors.push('Language is mandatory.');
    }

    // Trailer URL
    if (!input.trailerUrl || !input.trailerUrl.trim()) {
      errors.push('Official trailer URL is mandatory for movie discovery.');
    }

    // Source / Provider
    if (!input.sourceProvider || !input.sourceProvider.trim()) {
      errors.push('Source/provider is mandatory (e.g. "Internet Archive", "Studio Distribution", "YouTube Movies").');
    }

    // Rights Holder
    if (!input.rightsHolder || !input.rightsHolder.trim()) {
      errors.push('Rights holder / archive entity is mandatory.');
    }

    // License Notes
    if (!input.licenseNotes || input.licenseNotes.trim().length < 10) {
      errors.push('License notes must detail public domain grounds, ownership proof, or contract terms (min. 10 chars).');
    }

    // Specific Status Checks
    switch (input.contentRightsStatus) {
      case 'PUBLIC_DOMAIN':
        // Public domain must have documentation or legal justification
        break;

      case 'OWNED_CONTENT':
        if (!input.ownershipConfirmed) {
          errors.push('You must confirm ownership before publishing owned content.');
        }
        break;

      case 'LICENSED':
        if (!input.licenseDocument || !input.licenseDocument.trim()) {
          errors.push('Supporting license documentation / contract reference is required for LICENSED content.');
        }
        if (!input.licenseStartDate) {
          errors.push('License start date is required for licensed content.');
        }
        if (!input.licenseEndDate) {
          errors.push('License end date is required for licensed content.');
        } else if (new Date(input.licenseEndDate).getTime() <= Date.now()) {
          errors.push('License end date cannot be in the past for active licensing.');
        }
        break;

      case 'AUTHORIZED_PROVIDER':
        // Do not upload the movie unless agreement permits it; requires external URL
        if (input.videoSourceUrl && input.videoSourceUrl.trim()) {
          errors.push('Do not upload direct movie files for AUTHORIZED_PROVIDER content unless direct distribution agreement is verified. Use authorized external streaming URL instead.');
        }
        if (!input.externalStreamUrl || !input.externalStreamUrl.trim()) {
          errors.push('Authorized external streaming URL is required for AUTHORIZED_PROVIDER status.');
        }
        break;

      case 'TRAILER_ONLY':
        // Only the trailer can be displayed
        if (input.videoSourceUrl && input.videoSourceUrl.trim()) {
          errors.push('Direct video URL cannot be provided for TRAILER_ONLY titles. Only official trailers are allowed.');
        }
        if (input.externalStreamUrl && input.externalStreamUrl.trim()) {
          errors.push('External full movie stream cannot be provided for TRAILER_ONLY titles.');
        }
        break;

      case 'UNVERIFIED':
        // Unverified is allowed only as DRAFT or in review; cannot be published
        break;

      default:
        errors.push(`Invalid content rights status: ${input.contentRightsStatus}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates if a movie can transition into the PUBLISHED state.
   * Enforces publishing rules 1 through 6.
   */
  public static validateForPublishing(input: MovieRightsInput): RightsValidationResult {
    const baseValidation = this.validateMovieInput(input);
    const errors = [...baseValidation.errors];

    // Rule 6: UNVERIFIED movie cannot be published.
    if (input.contentRightsStatus === 'UNVERIFIED') {
      errors.push('UNVERIFIED content cannot be published. You must complete content-rights verification first.');
    }

    // Rule 2: OWNED_CONTENT: Admin can publish after confirming ownership.
    if (input.contentRightsStatus === 'OWNED_CONTENT' && !input.ownershipConfirmed) {
      errors.push('Admin must confirm content ownership before publishing OWNED_CONTENT.');
    }

    // Rule 3: LICENSED: Require license information and supporting documentation before publishing.
    if (input.contentRightsStatus === 'LICENSED') {
      if (!input.licenseDocument || !input.licenseDocument.trim()) {
        errors.push('Supporting license document or contract reference is strictly required before publishing LICENSED content.');
      }
      if (input.licenseEndDate && new Date(input.licenseEndDate).getTime() <= Date.now()) {
        errors.push('Cannot publish content with an expired distribution license.');
      }
    }

    // Rule 4: AUTHORIZED_PROVIDER: Do not upload the movie unless agreement permits it. Instead allow authorized external URL.
    if (input.contentRightsStatus === 'AUTHORIZED_PROVIDER') {
      if (!input.externalStreamUrl || !input.externalStreamUrl.trim()) {
        errors.push('Authorized external provider URL is required before publishing.');
      }
      if (input.videoSourceUrl && input.videoSourceUrl.trim()) {
        errors.push('Direct video file must be removed for AUTHORIZED_PROVIDER titles. External URL must be used.');
      }
    }

    // Check expiration on any status with an end date
    if (input.licenseEndDate && new Date(input.licenseEndDate).getTime() <= Date.now()) {
      errors.push('Content cannot be published because its licenseEndDate has already passed.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if an approval workflow transition is legally sound.
   * Workflow: DRAFT → RIGHTS_REVIEW → APPROVED → PUBLISHED
   * Also supports: PUBLISHED → UNPUBLISHED
   */
  public static validateWorkflowTransition(
    currentStatus: PublicationStatus,
    targetStatus: PublicationStatus,
    movie: MovieRightsInput
  ): RightsValidationResult {
    const errors: string[] = [];

    if (currentStatus === targetStatus) {
      return { isValid: true, errors: [] };
    }

    // Allowed transition graph
    const allowedTransitions: Record<PublicationStatus, PublicationStatus[]> = {
      DRAFT: ['RIGHTS_REVIEW', 'UNPUBLISHED'],
      RIGHTS_REVIEW: ['APPROVED', 'DRAFT', 'UNPUBLISHED'],
      APPROVED: ['PUBLISHED', 'DRAFT', 'RIGHTS_REVIEW', 'UNPUBLISHED'],
      PUBLISHED: ['UNPUBLISHED', 'RIGHTS_REVIEW'],
      UNPUBLISHED: ['DRAFT', 'RIGHTS_REVIEW'],
    };

    if (!allowedTransitions[currentStatus]?.includes(targetStatus)) {
      errors.push(`Invalid workflow transition from ${currentStatus} to ${targetStatus}. Expected workflow: DRAFT → RIGHTS_REVIEW → APPROVED → PUBLISHED.`);
    }

    // If publishing, enforce publishing rules
    if (targetStatus === 'PUBLISHED') {
      const publishValidation = this.validateForPublishing(movie);
      if (!publishValidation.isValid) {
        errors.push(...publishValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if content license has expired.
   */
  public static isLicenseExpired(licenseEndDate?: Date | string | null): boolean {
    if (!licenseEndDate) return false;
    const expiry = new Date(licenseEndDate);
    return !isNaN(expiry.getTime()) && expiry.getTime() <= Date.now();
  }

  /**
   * Sanitizes movie output for public viewing and automatically prevents streaming when license expires.
   */
  public static sanitizePublicMovie<T extends Record<string, any>>(movie: T): T {
    const isExpired = this.isLicenseExpired(movie.licenseEndDate);
    const isPublished = movie.publicationStatus === 'PUBLISHED';

    const canDirectStreamStatus =
      (movie.contentRightsStatus === 'PUBLIC_DOMAIN' ||
        movie.contentRightsStatus === 'OWNED_CONTENT' ||
        movie.contentRightsStatus === 'LICENSED') &&
      Boolean(movie.videoSourceUrl);

    const canStreamDirect = isPublished && !isExpired && canDirectStreamStatus;
    const canStreamExternal =
      isPublished &&
      !isExpired &&
      movie.contentRightsStatus === 'AUTHORIZED_PROVIDER' &&
      Boolean(movie.externalStreamUrl);

    return {
      ...movie,
      licenseStatus: movie.contentRightsStatus,
      externalStreamProvider: movie.sourceProvider || movie.externalStreamProvider,
      canStreamDirect,
      canStreamExternal,
      isLicenseExpired: Boolean(isExpired),
      unavailableNotice: isExpired ? LICENSE_EXPIRED_MESSAGE : null,
      // If direct streaming is disallowed or expired, strip video URL so no unauthorized stream is accessible
      videoSourceUrl: canStreamDirect ? movie.videoSourceUrl : null,
    };
  }
}
