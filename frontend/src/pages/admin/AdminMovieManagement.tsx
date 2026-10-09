import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Info,
} from 'lucide-react';
import { adminApi, moviesApi, genresApi } from '../../api/client';
import { Movie, Genre, ContentRightsStatus, PublicationStatus, RightsAuditLogEntry } from '../../types';
import { AdminHeader } from '../../components/common/AdminHeader';
import { LicenseBadge } from '../../components/common/LicenseBadge';
import { SEO } from '../../components/common/SEO';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const ADMIN_COPYRIGHT_WARNING =
  'Only publish content that you own or are authorized to distribute. Uploading or distributing copyrighted content without permission may violate copyright law.';

export const AdminMovieManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'audit'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [auditLogs, setAuditLogs] = useState<RightsAuditLogEntry[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [workflowFilter, setWorkflowFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  // Movie Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Workflow Transition Modal
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [workflowTargetMovie, setWorkflowTargetMovie] = useState<Movie | null>(null);
  const [workflowTargetStatus, setWorkflowTargetStatus] = useState<PublicationStatus>('RIGHTS_REVIEW');
  const [workflowReason, setWorkflowReason] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // 16 Mandatory & Essential Form Fields
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(1960);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('United States');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoSourceUrl, setVideoSourceUrl] = useState('');
  const [externalStreamUrl, setExternalStreamUrl] = useState('');
  const [sourceProvider, setSourceProvider] = useState('');
  const [contentRightsStatus, setContentRightsStatus] = useState<ContentRightsStatus>('PUBLIC_DOMAIN');
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>('DRAFT');
  const [rightsHolder, setRightsHolder] = useState('');
  const [licenseDocument, setLicenseDocument] = useState('');
  const [licenseStartDate, setLicenseStartDate] = useState('');
  const [licenseEndDate, setLicenseEndDate] = useState('');
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [licenseNotes, setLicenseNotes] = useState('');
  const [auditReason, setAuditReason] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [moviesRes, genresRes] = await Promise.all([
        moviesApi.getMovies({ search: search || undefined, limit: 100 }),
        genresApi.getAll(),
      ]);
      setMovies(moviesRes.data || []);
      setGenres(genresRes || []);
    } catch (err) {
      console.error('Failed to load admin movie data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setIsAuditLoading(true);
      const logs = await adminApi.getRightsAuditLogs({ limit: 100 });
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load rights audit logs', err);
    } finally {
      setIsAuditLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingMovie(null);
    setTitle('');
    setOriginalTitle('');
    setDescription('');
    setReleaseYear(new Date().getFullYear());
    setDurationMinutes(90);
    setLanguage('English');
    setCountry('United States');
    setDirector('');
    setCast('');
    setSelectedGenreIds([]);
    setPosterUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');
    setBackdropUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80');
    setTrailerUrl('https://www.youtube.com/watch?v=0VH9WPEub5M');
    setVideoSourceUrl('');
    setExternalStreamUrl('');
    setSourceProvider('');
    setContentRightsStatus('PUBLIC_DOMAIN');
    setPublicationStatus('DRAFT');
    setRightsHolder('');
    setLicenseDocument('');
    setLicenseStartDate('');
    setLicenseEndDate('');
    setOwnershipConfirmed(false);
    setLicenseNotes('Verified public domain status in accordance with statutory copyright laws.');
    setAuditReason('Initial film metadata creation and rights verification setup');
    setIsFeatured(false);
    setIsTrending(false);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Movie) => {
    setEditingMovie(m);
    setTitle(m.title);
    setOriginalTitle(m.originalTitle || '');
    setDescription(m.description);
    setReleaseYear(m.releaseYear);
    setDurationMinutes(m.durationMinutes);
    setLanguage(m.language || 'English');
    setCountry(m.country || 'United States');
    setDirector(m.director || '');
    setCast(m.cast || '');
    setSelectedGenreIds(m.genres ? m.genres.map((g) => g.genre.id) : []);
    setPosterUrl(m.posterUrl);
    setBackdropUrl(m.backdropUrl || '');
    setTrailerUrl(m.trailerUrl);
    setVideoSourceUrl(m.videoSourceUrl || '');
    setExternalStreamUrl(m.externalStreamUrl || '');
    setSourceProvider(m.sourceProvider || m.externalStreamProvider || '');
    setContentRightsStatus(m.contentRightsStatus || (m as any).licenseStatus || 'PUBLIC_DOMAIN');
    setPublicationStatus(m.publicationStatus || 'DRAFT');
    setRightsHolder(m.rightsHolder || '');
    setLicenseDocument(m.licenseDocument || '');
    setLicenseStartDate(m.licenseStartDate ? m.licenseStartDate.split('T')[0] : '');
    setLicenseEndDate(m.licenseEndDate ? m.licenseEndDate.split('T')[0] : m.licenseExpiresAt ? m.licenseExpiresAt.split('T')[0] : '');
    setOwnershipConfirmed(Boolean(m.ownershipConfirmed));
    setLicenseNotes(m.licenseNotes || '');
    setAuditReason(`Updated movie metadata and verified rights for "${m.title}"`);
    setIsFeatured(m.isFeatured);
    setIsTrending(m.isTrending);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce Rule 6: UNVERIFIED cannot be published
    if (contentRightsStatus === 'UNVERIFIED' && publicationStatus === 'PUBLISHED') {
      error('Rule 6 Violation: UNVERIFIED content cannot be published. You must complete content-rights verification first.');
      return;
    }

    // Enforce Rule 2: OWNED_CONTENT requires confirmed ownership before publishing
    if (contentRightsStatus === 'OWNED_CONTENT' && publicationStatus === 'PUBLISHED' && !ownershipConfirmed) {
      error('Rule 2 Violation: You must confirm ownership before publishing OWNED_CONTENT.');
      return;
    }

    // Enforce Rule 3: LICENSED requires license info and docs before publishing
    if (contentRightsStatus === 'LICENSED' && publicationStatus === 'PUBLISHED') {
      if (!rightsHolder.trim()) {
        error('Rule 3 Violation: Rights holder is required for LICENSED content.');
        return;
      }
      if (!licenseDocument.trim()) {
        error('Rule 3 Violation: Supporting license documentation is required for LICENSED content.');
        return;
      }
      if (!licenseStartDate || !licenseEndDate) {
        error('Rule 3 Violation: Valid license start and end dates are required for LICENSED content.');
        return;
      }
      if (new Date(licenseEndDate).getTime() <= Date.now()) {
        error('Rule 3 Violation: License end date cannot be in the past for active publishing.');
        return;
      }
    }

    // Enforce Rule 4: AUTHORIZED_PROVIDER do not upload movie file
    if (contentRightsStatus === 'AUTHORIZED_PROVIDER') {
      if (videoSourceUrl.trim()) {
        error('Rule 4 Violation: Do not upload direct movie files for AUTHORIZED_PROVIDER content. Use an authorized external streaming URL instead.');
        return;
      }
      if (!externalStreamUrl.trim()) {
        error('Rule 4 Violation: Authorized external streaming URL is required for AUTHORIZED_PROVIDER content.');
        return;
      }
    }

    // Enforce Rule 5: TRAILER_ONLY only trailers displayed
    if (contentRightsStatus === 'TRAILER_ONLY') {
      if (videoSourceUrl.trim()) {
        error('Rule 5 Violation: Direct video URL cannot be provided for TRAILER_ONLY titles. Only official trailers are allowed.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        description: description.trim(),
        releaseYear: Number(releaseYear),
        durationMinutes: Number(durationMinutes),
        language: language.trim(),
        country: country.trim(),
        director: director.trim() || undefined,
        cast: cast.trim() || undefined,
        posterUrl: posterUrl.trim(),
        backdropUrl: backdropUrl.trim() || undefined,
        trailerUrl: trailerUrl.trim(),
        videoSourceUrl: videoSourceUrl.trim() || null,
        externalStreamUrl: externalStreamUrl.trim() || null,
        sourceProvider: sourceProvider.trim() || null,
        contentRightsStatus,
        publicationStatus,
        rightsHolder: rightsHolder.trim() || null,
        licenseDocument: licenseDocument.trim() || null,
        licenseStartDate: licenseStartDate ? new Date(licenseStartDate) : null,
        licenseEndDate: licenseEndDate ? new Date(licenseEndDate) : null,
        ownershipConfirmed: Boolean(ownershipConfirmed),
        licenseNotes: licenseNotes.trim(),
        auditReason: auditReason.trim() || undefined,
        isFeatured,
        isTrending,
        genreIds: selectedGenreIds,
      };

      if (editingMovie) {
        await adminApi.updateMovie(editingMovie.id, payload);
        success(`Successfully updated movie "${title}" and recorded audit entry`);
      } else {
        await adminApi.createMovie(payload);
        success(`Successfully registered "${title}" with rights status ${contentRightsStatus}`);
      }

      setIsModalOpen(false);
      loadData();
      if (activeTab === 'audit') loadAuditLogs();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.rights?.[0] ||
        err.response?.data?.errors?.license?.[0] ||
        'Failed to save movie due to rights validation constraints.';
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const openWorkflowModal = (m: Movie, nextStatus: PublicationStatus) => {
    setWorkflowTargetMovie(m);
    setWorkflowTargetStatus(nextStatus);
    setWorkflowReason('');
    setIsWorkflowModalOpen(true);
  };

  const handleWorkflowTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowTargetMovie) return;

    if (!workflowReason.trim()) {
      error('An audit explanation reason is required for any publication workflow status transition.');
      return;
    }

    try {
      setIsTransitioning(true);
      await adminApi.updateWorkflow(workflowTargetMovie.id, workflowTargetStatus, workflowReason.trim());
      success(`Updated publication status of "${workflowTargetMovie.title}" to ${workflowTargetStatus}`);
      setIsWorkflowModalOpen(false);
      loadData();
      if (activeTab === 'audit') loadAuditLogs();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.rights?.[0] ||
        'Workflow status transition rejected.';
      error(msg);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDelete = async (id: string, movieTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${movieTitle}"? This will log a deletion audit event.`)) return;
    try {
      await adminApi.deleteMovie(id);
      success(`Deleted "${movieTitle}"`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      if (activeTab === 'audit') loadAuditLogs();
    } catch {
      error('Failed to delete movie.');
    }
  };

  const toggleGenreSelection = (genreId: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const filteredMovies = movies.filter((m) => {
    const statusMatch =
      statusFilter === 'ALL' ||
      m.contentRightsStatus === statusFilter ||
      (m as any).licenseStatus === statusFilter;
    const workflowMatch =
      workflowFilter === 'ALL' || m.publicationStatus === workflowFilter;
    return statusMatch && workflowMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEO title="Content Rights & Movie Management" description="Enforce copyright law, license verification, and publishing workflows." />
      <AdminHeader />

      {/* Mandatory Admin Warning Notice Banner */}
      <div className="p-4 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3.5 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
            Mandatory Content Rights Compliance Notice
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            {ADMIN_COPYRIGHT_WARNING}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'movies'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Catalog & Rights Management ({movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Content Rights Audit Trail</span>
        </button>
      </div>

      {activeTab === 'movies' ? (
        <>
          {/* Action Bar & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalog titles..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Rights Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Rights Statuses</option>
                <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN</option>
                <option value="OWNED_CONTENT">OWNED_CONTENT</option>
                <option value="LICENSED">LICENSED</option>
                <option value="AUTHORIZED_PROVIDER">AUTHORIZED_PROVIDER</option>
                <option value="TRAILER_ONLY">TRAILER_ONLY</option>
                <option value="UNVERIFIED">UNVERIFIED</option>
              </select>

              {/* Publication Status Filter */}
              <select
                value={workflowFilter}
                onChange={(e) => setWorkflowFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Workflow States</option>
                <option value="DRAFT">DRAFT</option>
                <option value="RIGHTS_REVIEW">RIGHTS_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="UNPUBLISHED">UNPUBLISHED</option>
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add & Verify Film
            </button>
          </div>

          {/* Movies Catalog Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Title / Year</th>
                    <th className="p-4">Content Rights Status</th>
                    <th className="p-4">Publication Workflow</th>
                    <th className="p-4">Streaming Mode</th>
                    <th className="p-4">Workflow Actions</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">Loading catalog...</td>
                    </tr>
                  ) : filteredMovies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No movies match the selected filters.</td>
                    </tr>
                  ) : (
                    filteredMovies.map((m) => {
                      const rights = m.contentRightsStatus || (m as any).licenseStatus;
                      const pub = m.publicationStatus || 'DRAFT';

                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={m.posterUrl} alt={m.title} className="w-9 h-13 object-cover rounded shadow" />
                              <div>
                                <p className="font-bold text-white text-xs">{m.title}</p>
                                <span className="text-[11px] text-slate-400">{m.releaseYear} • {m.language || 'English'}</span>
                                {m.director && (
                                  <p className="text-[10px] text-slate-500">Dir: {m.director}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <LicenseBadge status={rights} provider={m.sourceProvider || m.externalStreamProvider} />
                            {m.isLicenseExpired && (
                              <span className="block mt-1 text-[10px] text-amber-400 font-bold">
                                License Expired
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                pub === 'PUBLISHED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : pub === 'APPROVED'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : pub === 'RIGHTS_REVIEW'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : pub === 'UNPUBLISHED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {pub}
                            </span>
                          </td>
                          <td className="p-4">
                            {m.isLicenseExpired ? (
                              <span className="text-[11px] text-rose-400 font-semibold">Unavailable (Expired)</span>
                            ) : m.canStreamDirect ? (
                              <span className="text-[11px] text-emerald-400 font-semibold">Direct Legal Stream</span>
                            ) : m.canStreamExternal || rights === 'AUTHORIZED_PROVIDER' ? (
                              <span className="text-[11px] text-amber-400 font-semibold">{m.sourceProvider || m.externalStreamProvider || 'External Partner'}</span>
                            ) : (
                              <span className="text-[11px] text-purple-400 font-semibold">Trailer Only</span>
                            )}
                          </td>
                          <td className="p-4">
                            {/* Workflow state transition triggers */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {pub === 'DRAFT' && (
                                <button
                                  onClick={() => openWorkflowModal(m, 'RIGHTS_REVIEW')}
                                  className="px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Submit Review
                                </button>
                              )}
                              {pub === 'RIGHTS_REVIEW' && (
                                <>
                                  <button
                                    onClick={() => openWorkflowModal(m, 'APPROVED')}
                                    className="px-2 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    Approve Rights
                                  </button>
                                  <button
                                    onClick={() => openWorkflowModal(m, 'DRAFT')}
                                    className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
                                  >
                                    Return Draft
                                  </button>
                                </>
                              )}
                              {pub === 'APPROVED' && (
                                <button
                                  onClick={() => openWorkflowModal(m, 'PUBLISHED')}
                                  className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                >
                                  Publish
                                </button>
                              )}
                              {pub === 'PUBLISHED' && (
                                <button
                                  onClick={() => openWorkflowModal(m, 'UNPUBLISHED')}
                                  className="px-2 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Unpublish
                                </button>
                              )}
                              {pub === 'UNPUBLISHED' && (
                                <button
                                  onClick={() => openWorkflowModal(m, 'DRAFT')}
                                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
                                >
                                  Return to Draft
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/movies/${m.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                                title="Preview Page"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => openEditModal(m)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                                title="Edit Movie & Rights"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(m.id, m.title)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 cursor-pointer"
                                title="Delete Movie"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Content Rights Audit Trail Table */
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Immutable Content Rights Audit Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every title creation, rights verification review, workflow transition, and license expiration is permanently logged.
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={isAuditLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAuditLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Admin</th>
                  <th className="p-3.5">Movie</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Rights Status</th>
                  <th className="p-3.5">Workflow State</th>
                  <th className="p-3.5">Audit Reason / Legal Grounds</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isAuditLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">Loading audit records...</td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">No audit records found.</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-semibold text-white block">{log.admin?.name || 'System Admin'}</span>
                        <span className="text-[10px] text-slate-500">{log.admin?.email}</span>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {log.movie?.title || 'Unknown Title'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <LicenseBadge status={log.rightsStatus} showIcon={false} />
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {log.publicationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-slate-300 text-[11px] leading-relaxed">
                        {log.reason}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal (with all 16 required fields) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingMovie ? `Edit Film & Legal Verification: ${editingMovie.title}` : 'Add & Verify New Film for CineVault'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Warning in Modal */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">
                {ADMIN_COPYRIGHT_WARNING}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* SECTION 1: Core Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  1. Title & General Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. His Girl Friday"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Original Title (Optional)</label>
                    <input
                      type="text"
                      value={originalTitle}
                      onChange={(e) => setOriginalTitle(e.target.value)}
                      placeholder="Optional alternate title"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis / Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Comprehensive description of the movie..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year *</label>
                    <input
                      type="number"
                      required
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Min) *</label>
                    <input
                      type="number"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Language *</label>
                    <input
                      type="text"
                      required
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Director *</label>
                    <input
                      type="text"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      placeholder="e.g. Howard Hawks"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cast Members *</label>
                    <input
                      type="text"
                      value={cast}
                      onChange={(e) => setCast(e.target.value)}
                      placeholder="e.g. Cary Grant, Rosalind Russell, Ralph Bellamy"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Mandatory Content Rights Verification */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> 2. Content Rights Management & Licensing *
                  </div>
                  <span className="text-[11px] text-slate-400">Strict Enforcement Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Content Rights Status *
                    </label>
                    <select
                      value={contentRightsStatus}
                      onChange={(e) => setContentRightsStatus(e.target.value as ContentRightsStatus)}
                      className="w-full bg-slate-950 border border-emerald-500/60 rounded-xl p-2.5 text-xs text-white font-bold"
                    >
                      <option value="PUBLIC_DOMAIN">1. PUBLIC_DOMAIN (Admin can publish)</option>
                      <option value="OWNED_CONTENT">2. OWNED_CONTENT (Requires ownership confirmation)</option>
                      <option value="LICENSED">3. LICENSED (Requires docs & valid dates)</option>
                      <option value="AUTHORIZED_PROVIDER">4. AUTHORIZED_PROVIDER (External stream only)</option>
                      <option value="TRAILER_ONLY">5. TRAILER_ONLY (Promotional trailer only)</option>
                      <option value="UNVERIFIED">6. UNVERIFIED (Cannot be published)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Publication Workflow State *
                    </label>
                    <select
                      value={publicationStatus}
                      onChange={(e) => setPublicationStatus(e.target.value as PublicationStatus)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold"
                    >
                      <option value="DRAFT">DRAFT (Initial intake)</option>
                      <option value="RIGHTS_REVIEW">RIGHTS_REVIEW (Legal team audit)</option>
                      <option value="APPROVED">APPROVED (Ready for publishing)</option>
                      <option value="PUBLISHED">PUBLISHED (Live to end users)</option>
                      <option value="UNPUBLISHED">UNPUBLISHED (Taken down)</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Notice based on Status */}
                {contentRightsStatus === 'UNVERIFIED' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                    ⚠️ <strong>UNVERIFIED status:</strong> This movie cannot be published until verified. Attempting to set status to PUBLISHED will be blocked.
                  </div>
                )}

                {contentRightsStatus === 'OWNED_CONTENT' && (
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-blue-300">
                      Ownership Verification Declaration (Rule 2)
                    </p>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ownershipConfirmed}
                        onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                        className="mt-0.5 rounded border-blue-400 text-blue-500"
                      />
                      <span className="text-xs text-white font-medium">
                        I confirm that CineVault or its parent entity owns all worldwide distribution, streaming, and copyright rights to this original work.
                      </span>
                    </label>
                  </div>
                )}

                {/* Rights Holder & Supporting License Document */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Rights Holder {contentRightsStatus === 'LICENSED' ? '*' : '(If applicable)'}
                    </label>
                    <input
                      type="text"
                      value={rightsHolder}
                      onChange={(e) => setRightsHolder(e.target.value)}
                      placeholder="e.g. Cinema Guild LLC / Studio Canal"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      License Document / Contract Reference {contentRightsStatus === 'LICENSED' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={licenseDocument}
                      onChange={(e) => setLicenseDocument(e.target.value)}
                      placeholder="e.g. Agreement DOC-2026-CV-8823"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* License Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      License Start Date {contentRightsStatus === 'LICENSED' ? '*' : ''}
                    </label>
                    <input
                      type="date"
                      value={licenseStartDate}
                      onChange={(e) => setLicenseStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      License End Date (Expiration) {contentRightsStatus === 'LICENSED' ? '*' : ''}
                    </label>
                    <input
                      type="date"
                      value={licenseEndDate}
                      onChange={(e) => setLicenseEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    License Notes & Legal Grounds *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={licenseNotes}
                    onChange={(e) => setLicenseNotes(e.target.value)}
                    placeholder="Specify legal basis (e.g. Pre-1929 US publication, unrenewed copyright, creative commons attribution, or commercial license details)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* SECTION 3: Streaming URLs and Assets */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  3. Media, Streaming Links & Source Provider
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Official Trailer URL *</label>
                    <input
                      type="url"
                      required
                      value={trailerUrl}
                      onChange={(e) => setTrailerUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Source / Provider Name *
                    </label>
                    <input
                      type="text"
                      value={sourceProvider}
                      onChange={(e) => setSourceProvider(e.target.value)}
                      placeholder="e.g. Internet Archive / Paramount+ / CineVault Studio"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Conditional Video URL or External Stream URL */}
                {contentRightsStatus === 'PUBLIC_DOMAIN' || contentRightsStatus === 'OWNED_CONTENT' || contentRightsStatus === 'LICENSED' ? (
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      Direct Video Source URL (MP4 / WebM / HLS)
                    </label>
                    <input
                      type="url"
                      value={videoSourceUrl}
                      onChange={(e) => setVideoSourceUrl(e.target.value)}
                      placeholder="https://archive.org/... or authorized CDN link"
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Direct playback enabled for verified public domain or licensed content.</p>
                  </div>
                ) : contentRightsStatus === 'AUTHORIZED_PROVIDER' ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-amber-300">
                      Authorized External Streaming URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={externalStreamUrl}
                      onChange={(e) => setExternalStreamUrl(e.target.value)}
                      placeholder="https://partner.com/watch/..."
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-white"
                    />
                    <p className="text-[10px] text-amber-200/80">
                      Rule 4: Do not upload the movie file unless agreement permits it. Users will be redirected to this authorized provider link.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-purple-300 text-xs">
                    ℹ️ For TRAILER_ONLY titles, no direct or external full film video source is permitted.
                  </div>
                )}

                {/* Posters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Image URL *</label>
                    <input
                      type="url"
                      required
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Backdrop Image URL</label>
                    <input
                      type="url"
                      value={backdropUrl}
                      onChange={(e) => setBackdropUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Genres and Flags */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Assign Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const isSelected = selectedGenreIds.includes(g.id);
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => toggleGenreSelection(g.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span className="text-white font-semibold">Feature on Hero Banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span className="text-white font-semibold">Mark as Trending</span>
                  </label>
                </div>
              </div>

              {/* SECTION 5: Mandatory Audit Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Log Reason / Rationale *
                </label>
                <input
                  type="text"
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="Record why this film was uploaded or changed for the immutable audit log"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Verifying & Saving...' : editingMovie ? 'Update Movie & Rights' : 'Save & Register Film'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Transition Confirmation Modal */}
      {isWorkflowModalOpen && workflowTargetMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Workflow Status Transition: {workflowTargetMovie.title}
              </h3>
              <button onClick={() => setIsWorkflowModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are changing the workflow state from{' '}
              <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                {workflowTargetMovie.publicationStatus}
              </strong>{' '}
              to{' '}
              <strong className="text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {workflowTargetStatus}
              </strong>
              .
            </p>

            <form onSubmit={handleWorkflowTransition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Reason (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={workflowReason}
                  onChange={(e) => setWorkflowReason(e.target.value)}
                  placeholder="Provide legal or operational grounds (e.g. Rights verified via contract DOC-9921, approved for public exhibition)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWorkflowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransitioning}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isTransitioning ? 'Recording Audit...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
