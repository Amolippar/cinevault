-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContentRightsStatus" AS ENUM ('PUBLIC_DOMAIN', 'OWNED_CONTENT', 'LICENSED', 'AUTHORIZED_PROVIDER', 'TRAILER_ONLY', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'RIGHTS_REVIEW', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "CastRole" AS ENUM ('ACTOR', 'DIRECTOR', 'WRITER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "originalTitle" TEXT,
    "description" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "director" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "posterUrl" TEXT NOT NULL,
    "backdropUrl" TEXT,
    "trailerUrl" TEXT NOT NULL,
    "videoSourceUrl" TEXT,
    "externalStreamUrl" TEXT,
    "sourceProvider" TEXT,
    "contentRightsStatus" "ContentRightsStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "rightsHolder" TEXT,
    "licenseDocument" TEXT,
    "licenseStartDate" TIMESTAMP(3),
    "licenseEndDate" TIMESTAMP(3),
    "ownershipConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "licenseNotes" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "country" TEXT NOT NULL DEFAULT 'United States',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieGenre" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cast" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleType" "CastRole" NOT NULL DEFAULT 'ACTOR',
    "profileUrl" TEXT,
    "bio" TEXT,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieCast" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "characterName" TEXT,
    "role" "CastRole" NOT NULL DEFAULT 'ACTOR',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MovieCast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "progressSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RightsAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rightsStatus" "ContentRightsStatus" NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RightsAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");
CREATE INDEX "Movie_slug_idx" ON "Movie"("slug");
CREATE INDEX "Movie_releaseYear_idx" ON "Movie"("releaseYear");
CREATE INDEX "Movie_contentRightsStatus_idx" ON "Movie"("contentRightsStatus");
CREATE INDEX "Movie_publicationStatus_idx" ON "Movie"("publicationStatus");
CREATE INDEX "Movie_rating_idx" ON "Movie"("rating");
CREATE INDEX "Movie_isFeatured_idx" ON "Movie"("isFeatured");
CREATE INDEX "Movie_isTrending_idx" ON "Movie"("isTrending");
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");
CREATE INDEX "Genre_slug_idx" ON "Genre"("slug");
CREATE INDEX "MovieGenre_movieId_idx" ON "MovieGenre"("movieId");
CREATE INDEX "MovieGenre_genreId_idx" ON "MovieGenre"("genreId");
CREATE UNIQUE INDEX "MovieGenre_movieId_genreId_key" ON "MovieGenre"("movieId", "genreId");
CREATE INDEX "Cast_name_idx" ON "Cast"("name");
CREATE INDEX "MovieCast_movieId_idx" ON "MovieCast"("movieId");
CREATE INDEX "MovieCast_castId_idx" ON "MovieCast"("castId");
CREATE UNIQUE INDEX "MovieCast_movieId_castId_role_key" ON "MovieCast"("movieId", "castId", "role");
CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");
CREATE UNIQUE INDEX "Review_userId_movieId_key" ON "Review"("userId", "movieId");
CREATE INDEX "Rating_movieId_idx" ON "Rating"("movieId");
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");
CREATE UNIQUE INDEX "Rating_userId_movieId_key" ON "Rating"("userId", "movieId");
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");
CREATE INDEX "Watchlist_movieId_idx" ON "Watchlist"("movieId");
CREATE UNIQUE INDEX "Watchlist_userId_movieId_key" ON "Watchlist"("userId", "movieId");
CREATE INDEX "WatchHistory_userId_idx" ON "WatchHistory"("userId");
CREATE INDEX "WatchHistory_movieId_idx" ON "WatchHistory"("movieId");
CREATE INDEX "WatchHistory_lastWatchedAt_idx" ON "WatchHistory"("lastWatchedAt");
CREATE UNIQUE INDEX "WatchHistory_userId_movieId_key" ON "WatchHistory"("userId", "movieId");
CREATE INDEX "RightsAuditLog_adminId_idx" ON "RightsAuditLog"("adminId");
CREATE INDEX "RightsAuditLog_movieId_idx" ON "RightsAuditLog"("movieId");
CREATE INDEX "RightsAuditLog_createdAt_idx" ON "RightsAuditLog"("createdAt");
CREATE INDEX "AdminAction_adminId_idx" ON "AdminAction"("adminId");
CREATE INDEX "AdminAction_actionType_idx" ON "AdminAction"("actionType");

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovieCast" ADD CONSTRAINT "MovieCast_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovieCast" ADD CONSTRAINT "MovieCast_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RightsAuditLog" ADD CONSTRAINT "RightsAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RightsAuditLog" ADD CONSTRAINT "RightsAuditLog_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
