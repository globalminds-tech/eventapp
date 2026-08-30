import React, { useState } from 'react';
import { Store, Search, PlusCircle, ArrowUpDown, Eye, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const ManageStall = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const stallData = [
        { code: 'EVT-22', name: 'Valluvar Kottam Craft & Food Expo', stalls: 45, allocated: 38, requested: 5, pendingPay: 2 },
        { code: 'EVT-9', name: 'Furniture & Home Products Expo', stalls: 80, allocated: 65, requested: 10, pendingPay: 5 },
        { code: 'EVT-12', name: 'LOGMAT Logistics & Supply Chain Expo', stalls: 120, allocated: 90, requested: 18, pendingPay: 12 }
    ];

    const filtered = stallData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            Manage Stalls & Exhibition Halls
                        </h1>
                        <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
                            Stall Allocation Hub
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">
                        Design floor plans, approve exhibitor booth applications, and track stall payments.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        onClick={() => alert("Opening Stall Floor Plan Builder")}
                        className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4.5 py-2.5 rounded-xl shadow-md shadow-cyan-500/25 border-none cursor-pointer gap-2"
                    >
                        <PlusCircle size={18} />
                        <span>Add Stall Layout</span>
                    </Button>
                </div>
            </div>

            {/* ── KPI METRICS STRIP ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-slate-200/80 shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Exhibition Stalls</p>
                            <h3 className="text-2xl font-extrabold text-slate-900">245 Stalls</h3>
                            <p className="text-xs font-medium text-slate-500">Across 3 Active Expos</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                            <Store size={22} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocated & Confirmed</p>
                            <h3 className="text-2xl font-extrabold text-emerald-600">193 Bootees</h3>
                            <p className="text-xs font-medium text-emerald-600">78.7% Occupancy Rate</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <CheckCircle2 size={22} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approval & Payment</p>
                            <h3 className="text-2xl font-extrabold text-amber-600">33 Booths</h3>
                            <p className="text-xs font-medium text-amber-600">Action Required</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Clock size={22} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── STALL ALLOCATION TABLE ── */}
            <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-slate-900">Event Stall Allocation Overview</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search event code or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-5">Event Details</th>
                                <th className="py-3.5 px-4 text-center">Total Stalls</th>
                                <th className="py-3.5 px-4 text-center">Allocated</th>
                                <th className="py-3.5 px-4 text-center">Requested</th>
                                <th className="py-3.5 px-4 text-center">Pending Payment</th>
                                <th className="py-3.5 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                            {filtered.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                                                {item.code}
                                            </Badge>
                                            <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold text-slate-900">{item.stalls}</td>
                                    <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-emerald-50/50 rounded-xl">{item.allocated}</td>
                                    <td className="py-4 px-4 text-center font-bold text-sky-600">{item.requested}</td>
                                    <td className="py-4 px-4 text-center font-bold text-amber-600">{item.pendingPay}</td>
                                    <td className="py-4 px-5 text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => alert(`Managing stall layout for ${item.name}`)}
                                            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer gap-1.5 shadow-xs"
                                        >
                                            <Eye size={14} />
                                            <span>Manage Layout</span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageStall;