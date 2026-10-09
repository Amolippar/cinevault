import { prisma } from './client';
import { hashPassword } from '../utils/password';
import { createSlug } from '../utils/slugify';

async function main() {
  console.log('🌱 Starting CineVault database seeding with Content Rights Management...');

  // Clean existing data
  await prisma.rightsAuditLog.deleteMany({});
  await prisma.adminAction.deleteMany({});
  await prisma.watchHistory.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.movieCast.deleteMany({});
  await prisma.movieGenre.deleteMany({});
  await prisma.cast.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  console.log('👤 Seeding users...');
  const adminPassword = await hashPassword('AdminPass123!');
  const userPassword = await hashPassword('UserPass123!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cinevault.org',
      passwordHash: adminPassword,
      name: 'Elena Rostova',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'CineVault Chief Curator & Head of Legal Content Rights Verification.',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user@cinevault.org',
      passwordHash: userPassword,
      name: 'Marcus Vance',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Film archivist & classic cinema preservation enthusiast.',
    },
  });

  // 2. Create Genres
  console.log('🏷️ Seeding genres...');
  const genreList = [
    { name: 'Action', slug: 'action', description: 'High energy, fast-paced chases, and thrilling feats', icon: 'zap' },
    { name: 'Comedy', slug: 'comedy', description: 'Witty dialogue, slapstick, and timeless humor', icon: 'smile' },
    { name: 'Drama', slug: 'drama', description: 'Intense narratives of character, human struggles, and emotion', icon: 'heart' },
    { name: 'Thriller', slug: 'thriller', description: 'Suspenseful plots, psychological tension, and mystery', icon: 'eye' },
    { name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic visions, space exploration, and speculative worlds', icon: 'globe' },
    { name: 'Horror', slug: 'horror', description: 'Supernatural fear, dread, and atmospheric suspense', icon: 'skull' },
    { name: 'Mystery', slug: 'mystery', description: 'Intriguing enigmas, detectives, and unsolved cases', icon: 'search' },
    { name: 'Documentary', slug: 'documentary', description: 'Real-world accounts, cultural history, and deep investigations', icon: 'film' },
  ];

  const createdGenres: Record<string, any> = {};
  for (const g of genreList) {
    createdGenres[g.slug] = await prisma.genre.create({ data: g });
  }

  // 3. Create Cast & Directors
  console.log('🎭 Seeding cast & crew...');
  const castList = [
    { name: 'George A. Romero', roleType: 'DIRECTOR', bio: 'Pioneering horror director and writer.' },
    { name: 'Duane Jones', roleType: 'ACTOR', bio: 'Lead actor in Night of the Living Dead.' },
    { name: 'Judith O\'Dea', roleType: 'ACTOR', bio: 'Acclaimed performance as Barbra.' },
    { name: 'Stanley Donen', roleType: 'DIRECTOR', bio: 'Renowned American film director and choreographer.' },
    { name: 'Cary Grant', roleType: 'ACTOR', bio: 'One of classic Hollywood\'s definitive leading men.' },
    { name: 'Audrey Hepburn', roleType: 'ACTOR', bio: 'Beloved Oscar-winning actress and UNICEF goodwill ambassador.' },
    { name: 'Buster Keaton', roleType: 'DIRECTOR', bio: 'The Great Stone Face of silent film comedy.' },
    { name: 'Fritz Lang', roleType: 'DIRECTOR', bio: 'Austrian-German-American filmmaker, master of German Expressionism.' },
    { name: 'Brigitte Helm', roleType: 'ACTOR', bio: 'Famous for dual role as Maria and the Maschinenmensch.' },
    { name: 'Christopher Nolan', roleType: 'DIRECTOR', bio: 'Celebrated contemporary auteur director.' },
    { name: 'Matthew McConaughey', roleType: 'ACTOR', bio: 'Academy Award-winning actor.' },
    { name: 'Nina Paley', roleType: 'DIRECTOR', bio: 'Independent animator and free culture activist.' },
  ];

  const createdCast: Record<string, any> = {};
  for (const c of castList) {
    createdCast[c.name] = await prisma.cast.create({ data: c });
  }

  // 4. Create Movies with mandatory content rights fields
  console.log('🎞️ Seeding movies with mandatory content rights verification...');
  const moviesData = [
    {
      title: 'Night of the Living Dead',
      originalTitle: 'Night of the Flesh Eaters',
      releaseYear: 1968,
      durationMinutes: 96,
      director: 'George A. Romero',
      rating: 4.8,
      ratingsCount: 142,
      description: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a horde of bloodthirsty, flesh-eating ghouls. A seminal masterpiece that redefined the horror genre.',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=0VH9WPEub5M',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Internet Archive / Library of Congress',
      contentRightsStatus: 'PUBLIC_DOMAIN' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Public Domain (Worldwide)',
      licenseDocument: 'LOC-US-PDC-1968-001',
      licenseStartDate: new Date('1968-10-01'),
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Entered public domain in the US upon release in 1968 because distributor Walter Reade Organization failed to include statutory copyright notice on theatrical prints after title change from Night of the Flesh Eaters.',
      language: 'English',
      country: 'United States',
      isFeatured: true,
      isTrending: true,
      viewCount: 4230,
      genres: ['horror', 'thriller', 'mystery'],
      castMembers: [
        { name: 'Duane Jones', role: 'ACTOR', character: 'Ben' },
        { name: 'Judith O\'Dea', role: 'ACTOR', character: 'Barbra' },
      ],
    },
    {
      title: 'Charade',
      originalTitle: 'Charade',
      releaseYear: 1963,
      durationMinutes: 113,
      director: 'Stanley Donen',
      rating: 4.7,
      ratingsCount: 98,
      description: 'A woman in Paris is pursued by several men who want a fortune her murdered husband had stolen. Often called "the best Hitchcock movie that Hitchcock never made."',
      posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=wXwR2j7c2Y0',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Internet Archive Open Film Repository',
      contentRightsStatus: 'PUBLIC_DOMAIN' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Public Domain (1909 Act Defect)',
      licenseDocument: 'USCO-CIRC-22-CHARADE-1963',
      licenseStartDate: new Date('1963-12-05'),
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Entered US public domain immediately upon publication in 1963 because the notice omitted the word "Copyright", the abbreviation "Copr.", or the symbol © as required by the 1909 US Copyright Act.',
      language: 'English',
      country: 'United States',
      isFeatured: true,
      isTrending: true,
      viewCount: 3840,
      genres: ['comedy', 'thriller', 'mystery'],
      castMembers: [
        { name: 'Cary Grant', role: 'ACTOR', character: 'Peter Joshua' },
        { name: 'Audrey Hepburn', role: 'ACTOR', character: 'Reggie Lampert' },
      ],
    },
    {
      title: 'The General',
      originalTitle: 'The General',
      releaseYear: 1926,
      durationMinutes: 75,
      director: 'Buster Keaton',
      rating: 4.9,
      ratingsCount: 165,
      description: 'During the American Civil War, Union spies steal an engineer\'s beloved locomotive with his sweetheart aboard, forcing him into a daring cross-country pursuit filled with legendary practical stuntwork.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=1F_4-pM0j0Q',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Buster Keaton Preservation Society / National Film Registry',
      contentRightsStatus: 'PUBLIC_DOMAIN' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Public Domain Worldwide (Pre-1929 Term Expiration)',
      licenseDocument: 'BK-NFR-1926-ARCHIVE',
      licenseStartDate: new Date('1926-12-25'),
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Released in 1926, copyright was unrenewed under the 1909 Act and all statutory term protections expired worldwide.',
      language: 'Silent (English Cards)',
      country: 'United States',
      isFeatured: false,
      isTrending: true,
      viewCount: 2950,
      genres: ['action', 'comedy', 'drama'],
      castMembers: [
        { name: 'Buster Keaton', role: 'ACTOR', character: 'Johnnie Gray' },
      ],
    },
    {
      title: 'Metropolis',
      originalTitle: 'Metropolis',
      releaseYear: 1927,
      durationMinutes: 153,
      director: 'Fritz Lang',
      rating: 4.8,
      ratingsCount: 210,
      description: 'In a futuristic city sharply divided between the working class and the city planners, the son of the city\'s mastermind falls in love with a working-class prophet.',
      posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=gdtZv362czg',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Murnau Stiftung / Wikimedia Open Archives',
      contentRightsStatus: 'PUBLIC_DOMAIN' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Public Domain Worldwide (1927 Term Expiration)',
      licenseDocument: 'FWMS-DE-METROPOLIS-1927',
      licenseStartDate: new Date('1927-01-10'),
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Visionary 1927 sci-fi epic. Entered public domain worldwide under international copyright term statutes.',
      language: 'Silent (German/English Cards)',
      country: 'Germany',
      isFeatured: true,
      isTrending: false,
      viewCount: 5120,
      genres: ['sci-fi', 'drama'],
      castMembers: [
        { name: 'Brigitte Helm', role: 'ACTOR', character: 'Maria' },
      ],
    },
    // LICENSED CONTENT (Active valid license)
    {
      title: 'Sita Sings the Blues',
      originalTitle: 'Sita Sings the Blues',
      releaseYear: 2008,
      durationMinutes: 82,
      director: 'Nina Paley',
      rating: 4.7,
      ratingsCount: 115,
      description: 'An animated film written, directed, produced and animated by American artist Nina Paley. Released under Creative Commons CC0 / Free Cultural Work license.',
      posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=1Q8fG9mpZZ8',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Nina Paley Free Culture Distribution',
      contentRightsStatus: 'LICENSED' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Nina Paley / QuestionCopyright.org',
      licenseDocument: 'CC0-1.0-UNIVERSAL-DEED-2011',
      licenseStartDate: new Date('2011-01-01'),
      licenseEndDate: new Date('2035-12-31'), // Valid future license
      ownershipConfirmed: false,
      licenseNotes: 'Dedicated to the public domain by creator Nina Paley under Creative Commons CC0 1.0 Universal Public Domain Dedication.',
      language: 'English',
      country: 'United States',
      isFeatured: false,
      isTrending: false,
      viewCount: 1940,
      genres: ['comedy', 'documentary'],
      castMembers: [],
    },
    // AUTHORIZED_PROVIDER (Commercial film with external streaming URL)
    {
      title: 'Interstellar',
      originalTitle: 'Interstellar',
      releaseYear: 2014,
      durationMinutes: 169,
      director: 'Christopher Nolan',
      rating: 4.9,
      ratingsCount: 420,
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft to find a new planet for humans.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      videoSourceUrl: null, // Zero unauthorized hosting
      externalStreamUrl: 'https://www.paramountplus.com/movies/interstellar/',
      sourceProvider: 'Paramount+ / YouTube Movies',
      contentRightsStatus: 'AUTHORIZED_PROVIDER' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Paramount Pictures / Syncopy',
      licenseDocument: 'PARTNER-AGR-PARAMOUNT-2024',
      licenseStartDate: new Date('2024-01-01'),
      licenseEndDate: new Date('2030-12-31'),
      ownershipConfirmed: false,
      licenseNotes: 'Authorized partner discovery entry linking directly to verified official licensed streaming provider Paramount+.',
      language: 'English',
      country: 'United States',
      isFeatured: true,
      isTrending: true,
      viewCount: 9410,
      genres: ['sci-fi', 'drama', 'action'],
      castMembers: [
        { name: 'Matthew McConaughey', role: 'ACTOR', character: 'Cooper' },
      ],
    },
    // TRAILER_ONLY (Discovery only, no streaming files)
    {
      title: 'Oppenheimer',
      originalTitle: 'Oppenheimer',
      releaseYear: 2023,
      durationMinutes: 180,
      director: 'Christopher Nolan',
      rating: 4.9,
      ratingsCount: 520,
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      videoSourceUrl: null,
      externalStreamUrl: null,
      sourceProvider: 'Universal Pictures Promotional Network',
      contentRightsStatus: 'TRAILER_ONLY' as const,
      publicationStatus: 'PUBLISHED' as const,
      rightsHolder: 'Universal Pictures',
      licenseDocument: 'PRESS-PROMO-AGREEMENT-2023',
      licenseStartDate: new Date('2023-07-21'),
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Official Universal Pictures promotional trailer only. Direct movie streaming is not licensed on this platform.',
      language: 'English',
      country: 'United States',
      isFeatured: false,
      isTrending: true,
      viewCount: 11400,
      genres: ['drama', 'thriller'],
      castMembers: [],
    },
    // EXPIRED LICENSE TITLE (To demonstrate automatic expiration prevention)
    {
      title: 'Classic Film Archive Vol 1',
      originalTitle: 'Classic Film Archive Vol 1',
      releaseYear: 1975,
      durationMinutes: 60,
      director: 'Indie Restoration Society',
      rating: 4.2,
      ratingsCount: 30,
      description: 'Educational restoration anthology whose distribution license ended last year. Shows unavailable notice.',
      posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=0VH9WPEub5M',
      videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      externalStreamUrl: null,
      sourceProvider: 'Archival Educational Trust',
      contentRightsStatus: 'LICENSED' as const,
      publicationStatus: 'UNPUBLISHED' as const, // Auto-expired
      rightsHolder: 'Archival Educational Trust',
      licenseDocument: 'AET-EXPIRED-2023',
      licenseStartDate: new Date('2020-01-01'),
      licenseEndDate: new Date('2023-12-31'), // Lapsed date
      ownershipConfirmed: false,
      licenseNotes: 'Distribution agreement concluded on Dec 31 2023. Streaming automatically prevented.',
      language: 'English',
      country: 'United States',
      isFeatured: false,
      isTrending: false,
      viewCount: 650,
      genres: ['documentary'],
      castMembers: [],
    },
    // UNVERIFIED TITLE IN DRAFT (To demonstrate Rule 6: cannot be published)
    {
      title: 'Unverified Archival Reel',
      originalTitle: 'Reel #42',
      releaseYear: 1955,
      durationMinutes: 45,
      director: 'Unknown',
      rating: 0,
      ratingsCount: 0,
      description: 'Raw footage submitted without verifiable copyright documentation. Awaiting copyright office lookup.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl: null,
      trailerUrl: 'https://www.youtube.com/watch?v=0VH9WPEub5M',
      videoSourceUrl: null,
      externalStreamUrl: null,
      sourceProvider: 'Community Submission',
      contentRightsStatus: 'UNVERIFIED' as const,
      publicationStatus: 'DRAFT' as const, // Cannot be published!
      rightsHolder: 'Pending Verification',
      licenseDocument: null,
      licenseStartDate: null,
      licenseEndDate: null,
      ownershipConfirmed: false,
      licenseNotes: 'Currently undergoing chain-of-title investigation. Cannot be published to the public vault.',
      language: 'English',
      country: 'United States',
      isFeatured: false,
      isTrending: false,
      viewCount: 0,
      genres: ['mystery'],
      castMembers: [],
    },
  ];

  for (const mData of moviesData) {
    const slug = createSlug(mData.title, mData.releaseYear);
    const movie = await prisma.movie.create({
      data: {
        title: mData.title,
        slug,
        originalTitle: mData.originalTitle,
        description: mData.description,
        releaseYear: mData.releaseYear,
        durationMinutes: mData.durationMinutes,
        director: mData.director,
        rating: mData.rating,
        ratingsCount: mData.ratingsCount,
        posterUrl: mData.posterUrl,
        backdropUrl: mData.backdropUrl,
        trailerUrl: mData.trailerUrl,
        videoSourceUrl: mData.videoSourceUrl,
        externalStreamUrl: mData.externalStreamUrl,
        sourceProvider: mData.sourceProvider,
        contentRightsStatus: mData.contentRightsStatus,
        publicationStatus: mData.publicationStatus,
        rightsHolder: mData.rightsHolder,
        licenseDocument: mData.licenseDocument,
        licenseStartDate: mData.licenseStartDate,
        licenseEndDate: mData.licenseEndDate,
        ownershipConfirmed: mData.ownershipConfirmed,
        licenseNotes: mData.licenseNotes,
        language: mData.language,
        country: mData.country,
        isFeatured: mData.isFeatured,
        isTrending: mData.isTrending,
        viewCount: mData.viewCount,
      },
    });

    // Link Genres
    for (const gSlug of mData.genres) {
      const genre = createdGenres[gSlug];
      if (genre) {
        await prisma.movieGenre.create({
          data: {
            movieId: movie.id,
            genreId: genre.id,
          },
        });
      }
    }

    // Link Cast
    let order = 1;
    for (const cInfo of mData.castMembers) {
      const castPerson = createdCast[cInfo.name];
      if (castPerson) {
        await prisma.movieCast.create({
          data: {
            movieId: movie.id,
            castId: castPerson.id,
            role: cInfo.role as any,
            characterName: (cInfo as any).character || null,
            order: order++,
          },
        });
      }
    }

    // Create Initial Rights Audit Log Record
    await prisma.rightsAuditLog.create({
      data: {
        adminId: admin.id,
        movieId: movie.id,
        action: `INITIAL_SEED_${mData.publicationStatus}`,
        rightsStatus: mData.contentRightsStatus,
        publicationStatus: mData.publicationStatus,
        reason: `Initial verified rights intake: ${mData.licenseNotes.substring(0, 80)}...`,
      },
    });
  }

  console.log('✅ CineVault database successfully seeded with Content Rights Management records!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
