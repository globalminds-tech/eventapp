import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  ScrollText,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectItem } from "@/components/ui/Select";

export default function AddPolicyModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const blankForm = {
    policy_name: "",
    policy_type: "",
    policy_group: "",
    status: "Active",
    description: "",
  };
  const [formData, setFormData] = useState(blankForm);

  const [policyTypes, setPolicyTypes] = useState([]);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");

  const [policyGroups, setPolicyGroups] = useState([]);
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroup, setNewGroup] = useState("");


  // Pre-fill when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        policy_name: editData.policy_name || "",
        policy_type: editData.policy_type || "",
        policy_group: editData.policy_group || "",
        status: editData.status || "Active",
        description: editData.description || "",
      });
    } else if (isOpen && !isEditMode) {
      setFormData(blankForm);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const typesRes = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-policy-types`);
        if (typesRes.data && typesRes.data.length > 0) {
          const fetchedTypes = typesRes.data.map((item) => item.policy_type).filter(Boolean);
          setPolicyTypes((prev) => Array.from(new Set([...prev, ...fetchedTypes])));
        }
      } catch (err) {
        console.error("Error fetching policy types", err);
      }
      try {
        const groupsRes = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-policy-groups`);
        if (groupsRes.data && groupsRes.data.length > 0) {
          const fetchedGroups = groupsRes.data.map((item) => item.policy_group).filter(Boolean);
          setPolicyGroups((prev) => Array.from(new Set([...prev, ...fetchedGroups])));
        }
      } catch (err) {
        console.error("Error fetching policy groups", err);
      }
    };
    if (isOpen) {
      fetchPolicyData();
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.policy_name || !formData.policy_type || !formData.policy_group) {
      alert("Please fill in all required fields (Policy Name, Policy Type, Policy Group).");
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-policy/${editData.id}`, formData);
      } else {
        const payload = { ...formData, organizer_id: organizerId };
        await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create-policy`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving policy:", error);
      alert("Failed to save policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const applyTemplate = (sampleText) => {
    setFormData((prev) => ({ ...prev, description: sampleText }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      {/* ── HEADER ── */}
      <DialogHeader className="p-5 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
            <ScrollText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Policy Details" : "New Policy Details"}
              </DialogTitle>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                Legal & Compliance
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Define reusable event terms, cancellation policies, and visitor guidelines
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* ── CONTENT ── */}
      <DialogContent className="p-5 max-h-[calc(88vh-140px)] overflow-y-auto space-y-4 bg-slate-50/50">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Policy Name *"
              name="policy_name"
              value={formData.policy_name}
              onChange={handleChange}
              placeholder="e.g. Standard Pass Refund Policy"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Policy Type *</label>
                {!isAddingNewType && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewType(true)}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 border-none cursor-pointer"
                  >
                    + New Type
                  </button>
                )}
              </div>
              {isAddingNewType ? (
                <div className="relative flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter type..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newType.trim()) {
                          setPolicyTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                          setFormData((prev) => ({ ...prev, policy_type: newType.trim() }));
                        }
                        setNewType("");
                        setIsAddingNewType(false);
                      } else if (e.key === "Escape") {
                        setIsAddingNewType(false);
                        setNewType("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newType.trim()) {
                        setPolicyTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                        setFormData((prev) => ({ ...prev, policy_type: newType.trim() }));
                      }
                      setNewType("");
                      setIsAddingNewType(false);
                    }}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check size={15} />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.policy_type}
                  placeholder="Select Policy Type"
                  options={policyTypes.map((t) => ({ value: t, label: t }))}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, policy_type: val }))}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Select Group *</label>
                {!isAddingNewGroup && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewGroup(true)}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 border-none cursor-pointer"
                  >
                    + New Group
                  </button>
                )}
              </div>
              {isAddingNewGroup ? (
                <div className="relative flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    placeholder="Enter group..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newGroup.trim()) {
                          setPolicyGroups((prev) => Array.from(new Set([...prev, newGroup.trim()])));
                          setFormData((prev) => ({ ...prev, policy_group: newGroup.trim() }));
                        }
                        setNewGroup("");
                        setIsAddingNewGroup(false);
                      } else if (e.key === "Escape") {
                        setIsAddingNewGroup(false);
                        setNewGroup("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newGroup.trim()) {
                        setPolicyGroups((prev) => Array.from(new Set([...prev, newGroup.trim()])));
                        setFormData((prev) => ({ ...prev, policy_group: newGroup.trim() }));
                      }
                      setNewGroup("");
                      setIsAddingNewGroup(false);
                    }}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check size={15} />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.policy_group}
                  placeholder="Select Policy Group"
                  options={policyGroups.map((g) => ({ value: g, label: g }))}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, policy_group: val }))}
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <div className="h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Active & Published</span>
                <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-cyan-600" />
              <span className="text-[11px] font-bold text-slate-600">Quick Template Starters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "All ticket purchases are final. In case of official event rescheduling, tickets will be transferred to the new date. Refunds are processed within 7-10 business days only if the event is cancelled permanently."
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-[11px] font-semibold text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              >
                Refund Standard
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "Entry requires a valid digital badge QR code with government-issued photo ID. Organizers reserve the right to refuse entry or inspect baggage at security checkpoints."
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-[11px] font-semibold text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              >
                Gate Security
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "Exhibitors must complete stall setup 4 hours prior to gate opening. Sub-leasing or transferring allotted stalls without written approval is strictly prohibited."
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-[11px] font-semibold text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              >
                Exhibitor Rule
              </button>
            </div>
          </div>

          <Textarea
            label="Policy Terms & Description *"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Write or paste comprehensive policy guidelines, clauses, and conditions..."
          />
        </div>
      </DialogContent>

      {/* ── FOOTER ── */}
      <DialogFooter className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 px-4 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:text-slate-900"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Policy" : "Save Policy"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
