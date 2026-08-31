import React, { useState } from 'react';
import {
  Users, QrCode, Search, Filter, Download, PlusCircle, CheckCircle2, Clock, Mail, Phone,
  Building, ShieldCheck, Sparkles, Send, Eye, XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const ExhibitorLeadsPage = () => {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'staff'
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', mobile: '', interest: 'High Intent' });

  // Sample Leads dataset
  const [leads, setLeads] = useState([
    { id: 1, name: "Vikram Sethi", company: "Metro Logistics Pvt Ltd", email: "vikram@metrologistics.com", mobile: "9876543210", interest: "High Intent", notes: "Requested price quote for 5 warehouse robots.", date: "Today, 11:20 AM" },
    { id: 2, name: "Kavitha R", company: "South Craft Retails", email: "kavitha@southcraft.in", mobile: "9841098765", interest: "Medium Intent", notes: "Collected catalog and visiting card.", date: "Today, 10:15 AM" },
    { id: 3, name: "Deepak Sharma", company: "Apex Audio & Sound", email: "deepak@apexaudio.com", mobile: "9790011223", interest: "High Intent", notes: "Interested in exclusive distributor partnership.", date: "Yesterday, 04:45 PM" }
  ]);

  // Sample Booth Staff Passes dataset
  const [staffPasses, setStaffPasses] = useState([
    { id: 101, name: "Siddharth Verma", role: "Booth Manager", mobile: "9812345678", pass_code: "STF-9901", status: "Active", checkins: 4 },
    { id: 102, name: "Meera Nair", role: "Product Specialist", mobile: "9823456789", pass_code: "STF-9902", status: "Active", checkins: 2 }
  ]);

  const handleAddLeadSubmit = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) return;
    const added = { ...newLead, id: Date.now(), date: "Just now", notes: "Spot registration lead" };
    setLeads([added, ...leads]);
    setIsAddLeadModalOpen(false);
    setNewLead({ name: '', company: '', email: '', mobile: '', interest: 'High Intent' });
    setToastMessage("✓ New visitor lead logged successfully!");
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleResendStaffPass = (staff) => {
    setToastMessage(`✓ QR Gate Pass sent to ${staff.name} (${staff.mobile})`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Visitor Leads & Booth Staff Portal
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              Exhibitor Lead Intelligence
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track on-site visitor leads, export buyer inquiries, and manage booth staff QR gate passes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 border-none cursor-pointer gap-2"
          >
            <PlusCircle size={18} />
            <span>Add Spot Lead</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads Logged</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{leads.length} Buyers</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Scanned on-site</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Users size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hot Intent Leads</p>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-1">
              {leads.filter(l => l.interest === "High Intent").length} High Intent
            </h3>
            <p className="text-[11px] font-medium text-orange-600 mt-0.5">Ready for quote follow-up</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Sparkles size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff QR Passes</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">{staffPasses.length} Staff Passes</h3>
            <p className="text-[11px] font-medium text-teal-600 mt-0.5">Gate entry granted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
            <QrCode size={22} />
          </div>
        </Card>
      </div>

      {/* Portal Tabs & Table */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visitor Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Booth Staff Passes ({staffPasses.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search leads or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Visitor Leads View */}
        {activeTab === 'leads' && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Visitor & Company</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Buying Intent</th>
                  <th className="py-3.5 px-4">Logged Notes</th>
                  <th className="py-3.5 px-4 text-right">Logged Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{l.name}</h4>
                        <p className="text-[11px] font-semibold text-slate-500">{l.company}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1 font-semibold text-[11px]"><Mail size={11} />{l.email}</p>
                        <p className="flex items-center gap-1 text-slate-500 text-[11px]"><Phone size={11} />{l.mobile}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                        l.interest === "High Intent"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}>
                        <Sparkles size={11} /> {l.interest}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate">
                      {l.notes}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-400 text-[11px]">
                      {l.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff Passes View */}
        {activeTab === 'staff' && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Name & Designation</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Gate Pass Code</th>
                  <th className="py-3.5 px-4">Pass Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {staffPasses.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{s.name}</h4>
                        <p className="text-[11px] font-semibold text-slate-500">{s.role}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{s.mobile}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {s.pass_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active Pass
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleResendStaffPass(s)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1 border border-teal-200 ml-auto"
                      >
                        <Send size={12} />
                        <span>Resend Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Spot Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddLeadSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Add Spot Visitor Lead</h3>
              <button type="button" onClick={() => setIsAddLeadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Visitor Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Firm Name</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="e.g. Tech Matrix Pvt Ltd"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newLead.mobile}
                    onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddLeadModalOpen(false)} className="text-xs font-bold rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer">
                Save Visitor Lead
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExhibitorLeadsPage;
