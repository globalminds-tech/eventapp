import React, { useState } from "react";
import { X, Loader2, Bold, Italic, Underline, Strikethrough, Quote, Code, List, ListOrdered, ChevronDown, Baseline, Type } from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";

export default function AddPolicyModal({ isOpen, onClose, onSuccess }) {
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policy_name: "",
    policy_type: "",
    policy_group: "",
    status: "Active",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.policy_name || !formData.policy_type || !formData.policy_group) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        organizer_id: organizerId,
      };
      await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create-policy`, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating policy:", error);
      alert("Failed to create policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock Text Editor Action
  const insertFormatting = (tag) => {
    // In a real rich text editor, this would wrap selected text.
    // We are just simulating a UI here.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Styled to match your eventapp cyan/blue design system instead of the image's navy blue */}
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">New Policy Details</h2>
            <p className="text-sm text-slate-500 font-medium">Define terms and conditions for your events</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors border border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Policy Name <span className="text-red-500">*</span></label>
              <input type="text" name="policy_name" value={formData.policy_name} onChange={handleChange} placeholder="Enter Policy Name" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Policy Type <span className="text-red-500">*</span></label>
              <select name="policy_type" value={formData.policy_type} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none bg-slate-50 text-slate-700">
                <option value="">Select Policy Type</option>
                <option value="Cancellation">Cancellation</option>
                <option value="Refund">Refund</option>
                <option value="Privacy">Privacy</option>
                <option value="Terms of Service">Terms of Service</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Select Group <span className="text-red-500">*</span></label>
              <select name="policy_group" value={formData.policy_group} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none bg-slate-50 text-slate-700">
                <option value="">Select Policy Group</option>
                <option value="General">General</option>
                <option value="Ticketing">Ticketing</option>
                <option value="Exhibitor">Exhibitor</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Status</label>
              <input type="text" readOnly value="Active" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 text-slate-500 font-medium" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">Description</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
              
              {/* Fake Rich Text Toolbar */}
              <div className="flex items-center flex-wrap gap-1 p-2 border-b border-slate-100 bg-white">
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Bold size={16} strokeWidth={2.5}/></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Italic size={16} /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Underline size={16} /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Strikethrough size={16} /></button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Quote size={16} /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Code size={16} /></button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><ListOrdered size={16} /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><List size={16} /></button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                
                <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 bg-slate-50">
                  Normal <ChevronDown size={14} className="text-slate-400"/>
                </button>
                
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Baseline size={16} /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"><Type size={16} className="bg-slate-200 rounded-sm" /></button>
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-serif italic text-sm font-bold">Tˣ</button>
              </div>

              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Provide comprehensive details about this policy..." 
                className="w-full h-48 p-4 text-sm outline-none placeholder:text-slate-400 resize-none font-sans"
              ></textarea>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 flex items-center justify-end gap-4 rounded-b-2xl border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
}
