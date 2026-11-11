import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, FileText, Search, Edit3, Eye, Trash2, Loader2,
    ExternalLink, RefreshCw, CheckCircle2, Clock, AlertCircle, XCircle, Filter,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { prNonTradeService, PRNonTradeData } from '../services/prNonTradeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const PRNonTradeListPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const approvalUrl = import.meta.env.VITE_APPROVAL_URL || 'http://localhost:5175';

    const [items, setItems] = useState<PRNonTradeData[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isServerPaginated, setIsServerPaginated] = useState<boolean>(false);
    const [summaryCounts, setSummaryCounts] = useState<{
        totalAll: number;
        draft: number;
        submitted: number;
        approved: number;
        rejected: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState<number>(10);
    const limitOptions = [10, 30, 50];

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleStatusFilterChange = (st: 'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
        setStatusFilter(st);
        setCurrentPage(1);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await prNonTradeService.getList({
                page: currentPage,
                limit,
                search: debouncedSearch || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
            });
            if (Array.isArray(res)) {
                setItems(res);
                setTotalCount(res.length);
                setIsServerPaginated(false);
                setSummaryCounts(null);
            } else {
                const list = res.results || [];
                setItems(list);
                setTotalCount(typeof res.count === 'number' ? res.count : list.length);
                setIsServerPaginated(typeof res.count === 'number');
                if (typeof res.total_all === 'number') {
                    setSummaryCounts({
                        totalAll: res.total_all,
                        draft: res.draft_count ?? 0,
                        submitted: res.submitted_count ?? 0,
                        approved: res.approved_count ?? 0,
                        rejected: res.rejected_count ?? 0,
                    });
                }
            }
        } catch (err: any) {
            toast.error('Gagal memuat daftar PR Non-Trade.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, limit, debouncedSearch, statusFilter]);

    const handleDeleteDraft = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus draft ini?')) return;
        try {
            await prNonTradeService.deleteDraft(id);
            toast.success('Draft berhasil dihapus.');
            loadData();
        } catch (err: any) {
            toast.error('Gagal menghapus draft.');
        }
    };

    const filteredItems = items.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchesQuery = (
            (item.transaction_id || '').toLowerCase().includes(q) ||
            (item.purpose || '').toLowerCase().includes(q) ||
            (item.requestor_name || '').toLowerCase().includes(q) ||
            (item.requester_department || '').toLowerCase().includes(q) ||
            (item.status || '').toLowerCase().includes(q)
        );

        if (statusFilter === 'ALL') return matchesQuery;
        if (statusFilter === 'SUBMITTED') {
            return matchesQuery && ['SUBMITTED', 'IN_PROGRESS', 'PENDING'].includes(item.status || '');
        }
        return matchesQuery && item.status === statusFilter;
    });

    const totalItems = isServerPaginated ? totalCount : filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedItems = isServerPaginated ? filteredItems : filteredItems.slice(startIndex, startIndex + limit);
    const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + paginatedItems.length, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (safePage > 3) {
                pages.push('...');
            }

            const start = Math.max(2, safePage - 1);
            const end = Math.min(totalPages - 1, safePage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (safePage < totalPages - 2) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const totalAllCount = summaryCounts ? summaryCounts.totalAll : items.length;
    const draftCount = summaryCounts ? summaryCounts.draft : items.filter(i => i.status === 'DRAFT').length;
    const submittedCount = summaryCounts ? summaryCounts.submitted : items.filter(i => ['SUBMITTED', 'IN_PROGRESS', 'PENDING'].includes(i.status || '')).length;
    const approvedCount = summaryCounts ? summaryCounts.approved : items.filter(i => i.status === 'APPROVED').length;
    const rejectedCount = summaryCounts ? summaryCounts.rejected : items.filter(i => i.status === 'REJECTED').length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                Daftar Purchase Request (PR)
                            </h1>
                            <p className="text-slate-500 text-sm md:text-sm mt-0.5">
                                Kelola pengajuan PR Non-Trade & Trade terintegrasi Approval HUB
                            </p>
                        </div>
                    </div>
                </div>

                {!user.is_approver && (
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm transition-colors cursor-pointer"
                            title="Muat Ulang Data"
                        >
                            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                        </button>

                        <button
                            onClick={() => navigate('/create')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                        >
                            <Plus size={18} />
                            <span>Buat PR Baru</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Metrics Quick Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                    onClick={() => handleStatusFilterChange('ALL')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'ALL'
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total PR</span>
                        <FileText size={18} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{totalAllCount}</p>
                </div>

                <div
                    onClick={() => handleStatusFilterChange('DRAFT')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'DRAFT'
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Draft Tersimpan</span>
                        <Clock size={18} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-900 mt-2">{draftCount}</p>
                </div>

                <div
                    onClick={() => handleStatusFilterChange('SUBMITTED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'SUBMITTED'
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">On Process</span>
                        <Clock size={18} className="text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-900 mt-2">{submittedCount}</p>
                </div>

                <div
                    onClick={() => handleStatusFilterChange('APPROVED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'APPROVED'
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Approved</span>
                        <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-900 mt-2">{approvedCount}</p>
                </div>

                <div
                    onClick={() => handleStatusFilterChange('REJECTED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'REJECTED'
                        ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Rejected</span>
                        <XCircle size={18} className="text-rose-600" />
                    </div>
                    <p className="text-2xl font-bold text-rose-900 mt-2">{rejectedCount}</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari Transaction ID, Purpose, Requestor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-xs"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
                        {(['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilterChange(st)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${statusFilter === st
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {st === 'ALL' ? 'Semua' : st}
                            </button>
                        ))}
                    </div>

                    <div className="text-sm text-slate-500 font-medium whitespace-nowrap pl-2">
                        <span className="font-bold text-slate-800">{totalItems}</span> baris
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                        <Loader2 size={36} className="animate-spin text-blue-600" />
                        <span className="text-sm font-medium">Memuat data Purchase Request...</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-base font-semibold text-slate-800">Tidak ada pengajuan PR yang ditemukan</p>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'Coba ubah kata kunci pencarian atau filter status.' : 'Mulai buat pengajuan formulir PR baru dengan mengklik tombol di bawah.'}
                        </p>
                        {!user.is_approver && (
                            <button
                                onClick={() => navigate('/create')}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Buat PR Sekarang</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-md tracking-wider">
                                    <tr>
                                        <th className="py-3.5 px-4 text-md">No</th>
                                        <th className="py-3.5 px-4">Transaction ID</th>
                                        <th className="py-3.5 px-4">Tanggal</th>
                                        <th className="py-3.5 px-4">Requestor</th>
                                        <th className="py-3.5 px-4">Purpose</th>
                                        <th className="py-3.5 px-4 text-center">Status</th>
                                        <th className="py-3.5 px-4 text-center">Item</th>
                                        <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4 text-center text-md">{startIndex + index + 1}</td>
                                            <td className="py-3.5 px-4">
                                                {item.transaction_id ? (
                                                    <button
                                                        onClick={() => navigate(`/detail/${item.id}`)}
                                                        className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                                    >
                                                        {item.transaction_id}
                                                    </button>
                                                ) : (
                                                    <span className="text-amber-700 font-medium italic text-sm bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                        Draft (Belum diset)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-medium text-sm whitespace-nowrap">
                                                {item.transaction_date || '-'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-800 text-sm">
                                                    {item.requestor_name || '-'}
                                                </div>
                                                <div className="text-sm text-slate-400 mt-0.5">
                                                    {item.requester_department || item.requester_company}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 font-medium text-sm">
                                                {item.purpose || '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {item.status === 'DRAFT' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                                        <Clock size={12} />
                                                        DRAFT
                                                    </span>
                                                )}
                                                {(item.status === 'SUBMITTED' || item.status === 'PENDING') && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                                                        <CheckCircle2 size={12} />
                                                        ON PROCESS
                                                    </span>
                                                )}
                                                {item.status === 'IN_PROGRESS' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
                                                        <Clock size={12} />
                                                        IN PROGRESS
                                                    </span>
                                                )}
                                                {item.status === 'APPROVED' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle2 size={12} />
                                                        APPROVED
                                                    </span>
                                                )}
                                                {item.status === 'REVISED' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        REVISE
                                                    </span>
                                                )}
                                                {item.status === 'REJECTED' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        REJECTED
                                                    </span>
                                                )}
                                                {item.status === 'CANCELLED' && (
                                                    <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        CANCELLED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-sm">
                                                    {item.items?.length || 0}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* View Detail Local */}
                                                    <button
                                                        onClick={() => navigate(`/detail/${item.id}`)}
                                                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Lihat Detail Form PR"
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {!user?.is_approver && (item.status === 'DRAFT' || item.status === 'REVISE' || item.status === 'REVISED') ? (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/${item.id}/edit`)}
                                                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit / Revisi Pengajuan"
                                                            >
                                                                <Edit3 size={17} />
                                                            </button>
                                                            <button
                                                                onClick={() => item.id && handleDeleteDraft(item.id)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Hapus Draft"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        item.approval_request && (
                                                            <a
                                                                href={`${approvalUrl}/workflow/${item.approval_request}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                                                                title="Buka Tracking Approval di Centralized Approval Hub"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-4 bg-white border-t border-slate-200/80 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center gap-3">
                                <span>
                                    Menampilkan <strong className="font-semibold text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</strong> -{' '}
                                    <strong className="font-semibold text-slate-900">{endIndex}</strong> dari{' '}
                                    <strong className="font-semibold text-slate-900">{totalItems}</strong> baris
                                </span>

                                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                                    <label htmlFor="pr-limit-select" className="text-xs text-slate-500">
                                        Limit:
                                    </label>
                                    <select
                                        id="pr-limit-select"
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer transition-colors"
                                    >
                                        {limitOptions.map((size) => (
                                            <option key={size} value={size}>
                                                {size} / halaman
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safePage <= 1}
                                    aria-label="Halaman pertama"
                                    title="Halaman pertama"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronsLeft size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(safePage - 1)}
                                    disabled={safePage <= 1}
                                    aria-label="Halaman sebelumnya"
                                    title="Halaman sebelumnya"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                <div className="hidden sm:flex items-center gap-1">
                                    {getPageNumbers().map((page, idx) => {
                                        if (page === '...') {
                                            return (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="px-2 text-xs font-semibold text-slate-400 select-none"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        const isCurrent = page === safePage;
                                        return (
                                            <button
                                                key={`page-${page}`}
                                                type="button"
                                                onClick={() => setCurrentPage(page as number)}
                                                className={`inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer ${isCurrent
                                                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <span className="sm:hidden px-2 text-xs font-medium text-slate-600">
                                    Hal {safePage} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(safePage + 1)}
                                    disabled={safePage >= totalPages}
                                    aria-label="Halaman berikutnya"
                                    title="Halaman berikutnya"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={safePage >= totalPages}
                                    aria-label="Halaman terakhir"
                                    title="Halaman terakhir"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight size={15} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
