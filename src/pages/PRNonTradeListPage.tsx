import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, FileText, Search, Edit3, Eye, Trash2, Loader2,
    ExternalLink, RefreshCw, CheckCircle2, Clock, AlertCircle, Filter
} from 'lucide-react';
import { prNonTradeService, PRNonTradeData } from '../services/prNonTradeService';
import { useToast } from '../context/ToastContext';

export const PRNonTradeListPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const approvalUrl = import.meta.env.VITE_APPROVAL_URL || 'http://localhost:5175';

    const [items, setItems] = useState<PRNonTradeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'CANCELLED'>('ALL');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await prNonTradeService.getList();
            const list = Array.isArray(res) ? res : res.results || [];
            setItems(list);
        } catch (err: any) {
            toast.error('Gagal memuat daftar PR Non-Trade.');
        } finally {
            setLoading(false);
        }
    };

    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (initialFetchDone.current) return;
        initialFetchDone.current = true;
        loadData();
    }, []);

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
        return matchesQuery && item.status === statusFilter;
    });

    const draftCount = items.filter(i => i.status === 'DRAFT').length;
    const submittedCount = items.filter(i => i.status === 'SUBMITTED').length;

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
                                Kelola pengajuan PR Non-Trade & Trade terintegrasi Centralized Approval Engine
                            </p>
                        </div>
                    </div>
                </div>

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
            </div>

            {/* Metrics Quick Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    onClick={() => setStatusFilter('ALL')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'ALL'
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total PR</span>
                        <FileText size={18} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{items.length}</p>
                </div>

                <div
                    onClick={() => setStatusFilter('DRAFT')}
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
                    onClick={() => setStatusFilter('SUBMITTED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'SUBMITTED'
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Submitted / On Process</span>
                        <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-900 mt-2">{submittedCount}</p>
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

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {(['ALL', 'DRAFT', 'SUBMITTED'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
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
                        <span className="font-bold text-slate-800">{filteredItems.length}</span> baris
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
                        <button
                            onClick={() => navigate('/create')}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>Buat PR Sekarang</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-md tracking-wider">
                                <tr>
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
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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
                                            {item.status === 'SUBMITTED' && (
                                                <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                                                    <CheckCircle2 size={12} />
                                                    SUBMITTED
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

                                                {item.status === 'DRAFT' ? (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/${item.id}/edit`)}
                                                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Draft"
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
                )}
            </div>
        </div>
    );
};
