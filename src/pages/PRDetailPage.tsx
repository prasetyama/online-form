import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, User, Building, Landmark, Calendar,
    Package, Layers, ShieldCheck, ExternalLink, Edit3, Loader2, Info
} from 'lucide-react';
import { prNonTradeService, PRNonTradeData } from '../services/prNonTradeService';
import { useToast } from '../context/ToastContext';

export const PRDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const approvalUrl = import.meta.env.VITE_APPROVAL_URL || 'http://localhost:5175';

    const [pr, setPr] = useState<PRNonTradeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const loadDetail = async () => {
            setLoading(true);
            try {
                const data = await prNonTradeService.getDetail(id);
                setPr(data);
            } catch (err: any) {
                toast.error('Gagal memuat detail PR.');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
                <Loader2 size={36} className="animate-spin text-blue-600" />
                <span className="text-sm font-medium">Memuat detail PR...</span>
            </div>
        );
    }

    if (!pr) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <p className="text-slate-600 font-semibold">Data PR tidak ditemukan.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
                >
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                Detail Purchase Request
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${pr.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                    pr.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {pr.status || 'DRAFT'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">
                            ID: {pr.transaction_id || `Draft #${pr.id}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {pr.status === 'DRAFT' ? (
                        <button
                            onClick={() => navigate(`/${pr.id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <Edit3 size={16} />
                            <span>Edit Draft</span>
                        </button>
                    ) : pr.approval_request ? (
                        <a
                            href={`${approvalUrl}/workflow/${pr.approval_request}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
                        >
                            <ShieldCheck size={17} />
                            <span>Tracking Approval Hub</span>
                            <ExternalLink size={14} />
                        </a>
                    ) : null}

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali</span>
                    </button>
                </div>
            </div>

            {/* Requestor Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                    <User size={18} className="text-blue-600" />
                    <span>Informasi Requestor & Transaksi</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Transaction ID</span>
                        <p className="font-mono font-bold text-sm text-blue-700 mt-1">{pr.transaction_id || '-'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Tanggal Pengajuan</span>
                        <p className="font-medium text-sm text-slate-800 mt-1">{pr.transaction_date || '-'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Requestor Name</span>
                        <p className="font-bold text-sm text-slate-800 mt-1">{pr.requestor_name || '-'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Department</span>
                        <p className="font-medium text-sm text-slate-800 mt-1">{pr.requester_department || '-'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Company / Entity</span>
                        <p className="font-medium text-sm text-slate-800 mt-1">{pr.requester_company || '-'}</p>
                    </div>
                </div>
            </div>

            {/* General Data */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                    <Layers size={18} className="text-blue-600" />
                    <span>General Data</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Purpose</span>
                        <p className="font-medium text-sm text-slate-800 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            {pr.purpose}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Goods/Service Type</span>
                            <p className="font-semibold text-sm text-slate-800 mt-1 capitalize">{pr.goods_service_type}</p>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Purchase Type</span>
                            <p className="font-semibold text-sm text-slate-800 mt-1 capitalize">{pr.purchase_type}</p>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">CAR / TBR No</span>
                            <p className="font-medium text-sm text-slate-800 mt-1">{pr.car_tbr_no || '-'}</p>
                        </div>

                        {pr.purchase_type === 'asset' && (
                            <>
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Asset Type</span>
                                    <p className="font-semibold text-sm text-slate-800 mt-1 capitalize">{pr.asset_type}</p>
                                </div>
                                {pr.asset_type === 'non_wbs' && (
                                    <div>
                                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Asset No</span>
                                        <p className="font-mono font-bold text-sm text-slate-800 mt-1">{pr.asset_no || '-'}</p>
                                    </div>
                                )}
                                {pr.asset_type === 'wbs' && (
                                    <div>
                                        <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">WBS No</span>
                                        <p className="font-mono font-bold text-sm text-slate-800 mt-1">{pr.wbs_no || '-'}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">Equipment Name</span>
                                    <p className="font-medium text-sm text-slate-800 mt-1">{pr.equipment_name || '-'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Items */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Package size={18} className="text-blue-600" />
                        <span>Detail Items ({pr.items?.length || 0})</span>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-sm">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">#</th>
                                <th className="py-3 px-4">Goods Code</th>
                                <th className="py-3 px-4">Goods Name</th>
                                <th className="py-3 px-4 text-center">Unit</th>
                                <th className="py-3 px-4 text-right">Quantity</th>
                                <th className="py-3 px-4">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pr.items?.map((it, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/70">
                                    <td className="py-3 px-4 text-center font-mono text-sm text-slate-400">{idx + 1}</td>
                                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{it.goods_code}</td>
                                    <td className="py-3 px-4 font-medium text-slate-800">{it.goods_name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-sm font-medium">
                                            {it.unit}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800">{it.quantity}</td>
                                    <td className="py-3 px-4 text-slate-500 text-sm">{it.remark || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submission Remark */}
            {pr.submission_remark && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-2">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Submission Remark</span>
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{pr.submission_remark}</p>
                </div>
            )}
        </div>
    );
};
