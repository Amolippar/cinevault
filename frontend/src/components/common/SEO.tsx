import { useEffect } from 'react';
import { Movie } from '../../types';

interface SEOProps {
  title?: string;
  description?: string;
  movie?: Movie;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'CineVault - The trusted platform for public-domain cinema, verified licensed streaming, and legal movie discovery.',
  movie,
  type = 'website',
}) => {
  useEffect(() => {
    // Dynamic page title
    const fullTitle = title ? `${title} | CineVault` : 'CineVault | Legal Streaming & Classic Cinema Discovery';
    document.title = fullTitle;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph tags
    const updateOG = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOG('og:title', fullTitle);
    updateOG('og:description', description);
    updateOG('og:type', type);
    if (movie?.posterUrl) {
      updateOG('og:image', movie.posterUrl);
    }

    // JSON-LD structured data for movies
    if (movie) {
      const scriptId = 'cinevault-json-ld';
      let existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        existingScript = document.createElement('script');
        existingScript.id = scriptId;
        existingScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(existingScript);
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: movie.title,
        description: movie.description,
        image: movie.posterUrl,
        datePublished: movie.releaseYear ? movie.releaseYear.toString() : undefined,
        aggregateRating: movie.rating > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: movie.rating.toString(),
              ratingCount: movie.ratingsCount.toString(),
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
        genre: movie.genres?.map((g) => g.genre.name),
        offers: {
          '@type': 'Offer',
          category: movie.licenseStatus === 'PUBLIC_DOMAIN' ? 'Public Domain' : 'Streaming Rights',
          availability: 'https://schema.org/InStock',
        },
      };

      existingScript.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Clean up script on unmount
      const script = document.getElementById('cinevault-json-ld');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, movie, type]);

  return null;
};
