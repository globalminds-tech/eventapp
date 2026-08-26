import React, { useEffect, useState, useRef } from "react";
import { getPolicies, createPolicy } from "../../../../Services/api";
import { useSelector } from "react-redux";
import { Plus, X, CheckCircle, Trash2, Eye, ChevronRight, ChevronDown, Info, Edit } from "lucide-react";

const Step5Terms = ({ formData, setFormData }) => {
  const [policyData, setPolicyData] = useState({});
  const [policyGroup, setPolicyGroup] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDescription, setViewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [newPolicy, setNewPolicy] = useState({
    policy_name: "",
    policy_type: "",
    policy_group: "",
    description: "",
    status: "Active"
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);

  const groupRef = useRef(null);
  const typeRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (groupRef.current && !groupRef.current.contains(e.target)) setIsGroupOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setIsTypeOpen(false);
      if (nameRef.current && !nameRef.current.contains(e.target)) setIsNameOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  useEffect(() => {
    if (organizer?.id) {
      fetchPolicies();
    }
  }, [organizer?.id]);

  const fetchPolicies = async () => {
    try {
      const res = await getPolicies(organizer.id);
      const policies = res.data || [];
      const grouped = {};

      policies.forEach((item) => {
        const group = item.policy_group;
        const type = item.policy_type;
        const name = item.policy_name;
        const desc = item.description;

        if (!grouped[group]) grouped[group] = {};
        if (!grouped[group][type]) grouped[group][type] = {};

        grouped[group][type][name] = desc;
      });

      setPolicyData(grouped);
    } catch (error) {
      console.error("Failed to load policies", error);
      showNotification("Failed to load policies", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const getAvailableTypes = () => {
    if (policyGroup === "All") {
      const types = new Set();
      Object.values(policyData).forEach(groupObj => {
        Object.keys(groupObj).forEach(type => types.add(type));
      });
      return Array.from(types);
    }
    return Object.keys(policyData[policyGroup] || {});
  };

  const getAvailableNames = () => {
    const names = new Set();
    if (policyGroup === "All") {
      Object.values(policyData).forEach(groupObj => {
        if (groupObj[policyType]) {
          Object.keys(groupObj[policyType]).forEach(name => names.add(name));
        }
      });
    } else {
      if (policyData[policyGroup] && policyData[policyGroup][policyType]) {
        Object.keys(policyData[policyGroup][policyType]).forEach(name => names.add(name));
      }
    }
    return Array.from(names);
  };

  const getSelectedDescription = () => {
    if (!policyGroup || !policyType || !policyName) return "";
    if (policyGroup === "All") {
      for (const g of Object.keys(policyData)) {
        if (policyData[g][policyType] && policyData[g][policyType][policyName]) {
          return policyData[g][policyType][policyName];
        }
      }
    } else {
      return policyData[policyGroup][policyType][policyName] || "";
    }
    return "";
  };

  const addPolicy = () => {
    if (!policyGroup || !policyType || !policyName) {
      showNotification("Please select all fields", "error");
      return;
    }

    let exactGroup = policyGroup;
    let description = "";

    if (policyGroup === "All") {
      let found = false;
      for (const g of Object.keys(policyData)) {
        if (policyData[g][policyType] && policyData[g][policyType][policyName]) {
          exactGroup = g;
          description = policyData[g][policyType][policyName];
          found = true;
          break;
        }
      }
    } else {
      description = policyData[policyGroup][policyType][policyName] || "";
    }

    const newPolicyItem = { policyGroup: exactGroup, policyType, policyName, description, isDefault };
    const existing = formData.terms || [];

    const isDuplicate = existing.some(
      (p) =>
        p.policyGroup === exactGroup &&
        p.policyType === policyType &&
        p.policyName === policyName
    );

    if (isDuplicate && editingIndex === null) {
      showNotification("Policy already added to selection", "error");
      return;
    }

    if (editingIndex !== null) {
      const updatedTerms = [...formData.terms];
      updatedTerms[editingIndex] = newPolicyItem;
      setFormData({ ...formData, terms: updatedTerms });
      setEditingIndex(null);
      showNotification("Policy updated successfully!");
    } else {
      setFormData({
        ...formData,
        terms: [...existing, newPolicyItem],
      });
      showNotification("Policy added to selection!");
    }

    resetForm();
  };

  const resetForm = () => {
    setPolicyGroup("");
    setPolicyType("");
    setPolicyName("");
    setIsDefault(false);
    setEditingIndex(null);
  };

  const removePolicy = (index) => {
    const updatedTerms = formData.terms.filter((_, i) => i !== index);
    setFormData({ ...formData, terms: updatedTerms });
    showNotification("Policy removed from selection", "error");
  };

  const editPolicy = (index) => {
    const policy = formData.terms[index];
    setPolicyGroup(policy.policyGroup);
    setPolicyType(policy.policyType);
    setPolicyName(policy.policyName);
    setIsDefault(policy.isDefault || false);
    setEditingIndex(index);
    showNotification("You can now edit the selected policy", "success");
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newPolicy.policy_name.trim()) errors.policy_name = "Policy name is required";
    if (!newPolicy.policy_type) errors.policy_type = "Policy Type is required";
    if (!newPolicy.policy_group) errors.policy_group = "Policy Group is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await createPolicy({ ...newPolicy, organizer_id: organizer.id });
      await fetchPolicies();
      showNotification("Policy created successfully!");
      setShowAddModal(false);
      setNewPolicy({ policy_name: "", policy_type: "", policy_group: "", description: "", status: "Active" });
      setFieldErrors({});
    } catch (error) {
      console.error("Failed to create policy", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTerms = (formData.terms || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((formData.terms || []).length / itemsPerPage);

  const cardClasses = "bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 transition-all duration-200 hover:shadow-sm";
  const labelClasses = "block text-xs font-bold text-slate-700 mb-1 ml-1";
  const selectClasses = "w-full h-9 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 animate-in fade-in duration-300">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[3000] px-8 py-5 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 flex items-center gap-4 border-l-8 ${toast.type === "success" ? "bg-white text-emerald-600 border-emerald-500 shadow-emerald-100" : "bg-white text-rose-600 border-rose-500 shadow-rose-100"
          }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {toast.type === "success" ? <CheckCircle size={20} /> : <Info size={20} />}
          </div>
          <p className="font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT SECTION: PREMIUM SELECTION FORM */}
        <div className={`${cardClasses} flex flex-col md:h-[calc(110vh-290px)] md:overflow-y-auto custom-scrollbar pr-2`}>
          <div className="flex justify-between items-center mb-8 border-l-4 border-purple-500 pl-5">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Terms & Conditions</h2>
              <p className="text-[10px] font-bold text-slate-400  mt-1 tracking-widest">Select and configure event policies</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-full transition-all duration-500 shadow-sm group"
              title="Add New Policy to Master"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {/* Policy Group */}
            <div className="space-y-1.5" ref={groupRef}>
              <label className={labelClasses}>Policy Group <span className="text-red-500">*</span></label>
              <div className="relative">
                <div
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-900 transition-all hover:border-cyan-400"
                >
                  <span className={policyGroup ? "text-slate-900 font-medium" : "text-slate-400 font-normal"}>
                    {policyGroup || "Select Group"}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isGroupOpen ? "rotate-180 text-cyan-600" : ""}`} />
                </div>

                {isGroupOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-48 overflow-y-auto">
                      <div
                        onClick={() => { setPolicyGroup("All"); setPolicyType(""); setPolicyName(""); setIsGroupOpen(false); }}
                        className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${policyGroup === "All" ? "bg-cyan-50 text-cyan-800 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        All Groups
                      </div>
                      {Array.from(new Set([
                        "Cancellation Policy",
                        "Refund Policy",
                        "Safety Policy",
                        "Privacy Policy",
                        "Payment Policy",
                        "Paper Submission Guidelines",
                        "Registration Policy",
                        ...Object.keys(policyData)
                      ])).map((group) => (
                        <div
                          key={group}
                          onClick={() => { setPolicyGroup(group); setPolicyType(""); setPolicyName(""); setIsGroupOpen(false); }}
                          className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${policyGroup === group ? "bg-cyan-50 text-cyan-800 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          {group}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Policy Type */}
            <div className="space-y-1.5" ref={typeRef}>
              <label className={labelClasses}>Policy Type <span className="text-red-500">*</span></label>
              <div className="relative">
                <div
                  onClick={() => policyGroup && setIsTypeOpen(!isTypeOpen)}
                  className={`w-full h-9 bg-slate-50 border rounded-xl px-3 flex items-center justify-between text-xs font-semibold transition-all ${
                    policyGroup ? "cursor-pointer hover:border-cyan-400 text-slate-900 border-slate-200" : "cursor-not-allowed opacity-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <span className={policyType ? "text-slate-900 font-medium" : "text-slate-400 font-normal"}>
                    {policyType || "Select Type"}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isTypeOpen ? "rotate-180 text-cyan-600" : ""}`} />
                </div>

                {isTypeOpen && policyGroup && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-48 overflow-y-auto">
                      {getAvailableTypes().map((type) => (
                        <div
                          key={type}
                          onClick={() => { setPolicyType(type); setPolicyName(""); setIsTypeOpen(false); }}
                          className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${policyType === type ? "bg-cyan-50 text-cyan-800 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Policy Name */}
            <div className="space-y-1.5" ref={nameRef}>
              <label className={labelClasses}>Policy Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div
                  onClick={() => policyType && setIsNameOpen(!isNameOpen)}
                  className={`w-full h-9 bg-slate-50 border rounded-xl px-3 flex items-center justify-between text-xs font-semibold transition-all ${
                    policyType ? "cursor-pointer hover:border-cyan-400 text-slate-900 border-slate-200" : "cursor-not-allowed opacity-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <span className={policyName ? "text-slate-900 font-medium" : "text-slate-400 font-normal"}>
                    {policyName || "Select Policy"}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isNameOpen ? "rotate-180 text-cyan-600" : ""}`} />
                </div>

                {isNameOpen && policyType && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-48 overflow-y-auto">
                      {getAvailableNames().map((name) => (
                        <div
                          key={name}
                          onClick={() => { setPolicyName(name); setIsNameOpen(false); }}
                          className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${policyName === name ? "bg-cyan-50 text-cyan-800 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* DESCRIPTION PREVIEW */}
            {policyName && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className={labelClasses}>Policy Description Preview</label>
                <div 
                  className="w-full px-6 py-4 rounded-3xl border border-slate-200 bg-slate-50 text-xs text-slate-600 max-h-40 overflow-y-auto custom-scrollbar policy-desc-view whitespace-pre-wrap shadow-inner"
                  dangerouslySetInnerHTML={{ __html: getSelectedDescription() || "<i>No description available for this policy.</i>" }}
                />
              </div>
            )}

            <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 transition-all hover:bg-purple-50 group">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-5 h-5 rounded-md border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-all"
                />
              </div>
              <label htmlFor="isDefault" className="text-sm font-black text-slate-700 cursor-pointer select-none tracking-tight">
                Set as Default Policy
              </label>
            </div>

            <div className="pt-3">
              <button
                onClick={addPolicy}
                disabled={!policyGroup || !policyType || !policyName}
                className="w-full h-9 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-xs transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-xs cursor-pointer border-none"
              >
                {editingIndex !== null ? <Edit size={14} /> : <Plus size={14} />}
                <span>{editingIndex !== null ? "Update Policy" : "Add to Selection"}</span>
              </button>
              {editingIndex !== null && (
                <button
                  onClick={resetForm}
                  className="w-full mt-4 py-2 text-[10px] font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: PREMIUM PREVIEW TABLE */}
        <div className={`${cardClasses} flex flex-col lg:h-[calc(110vh-290px)] lg:overflow-y-auto custom-scrollbar pr-2`}>
          <div className="flex justify-between items-center mb-8 border-l-4 border-indigo-500 pl-5">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Preview</h2>
              <p className="text-[10px] font-bold text-slate-400  mt-1 tracking-widest">Review added policies</p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest text-center w-16">Action</th>
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest">Group</th>
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest">Name</th>
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest">Type</th>
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest text-center">Info</th>
                    <th className="px-6 py-4 font-black text-[10px] tracking-widest text-center">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentTerms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Info size={32} />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest">No policies selected</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentTerms.map((p, i) => {
                      const realIndex = indexOfFirstItem + i;
                      return (
                        <tr key={realIndex} className="group hover:bg-slate-50/80 transition-all duration-300">
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => editPolicy(realIndex)}
                               className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                              >
                               <Edit size={14} />
                              </button>
                              <button
                                onClick={() => removePolicy(realIndex)}
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-black text-slate-800 leading-tight">{p.policyGroup}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-600 leading-tight">{p.policyName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
                              {p.policyType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setViewDescription(p.description);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={p.isDefault || false}
                                onChange={(e) => {
                                  const updatedTerms = [...formData.terms];
                                  updatedTerms[realIndex] = { ...updatedTerms[realIndex], isDefault: e.target.checked };
                                  setFormData({ ...formData, terms: updatedTerms });
                                }}
                                className="w-4 h-4 rounded border-slate-200 text-purple-600 focus:ring-purple-500 cursor-pointer transition-all"
                              />
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
        </div>
      </div>

      {/* MODAL: VIEW DESCRIPTION */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-[5000] p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Policy Insight</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed terms overview</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 text-purple-100 opacity-50"><Info size={40} /></div>
                <div 
                  className="relative z-10 text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 policy-desc-view whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: viewDescription || "<i>No detailed description provided for this specific policy.</i>" }}
                />
              </div>
            </div>
            <div className="px-10 py-6 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setShowViewModal(false)} className="px-8 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 transition-all">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW POLICY (RE-PREMIUMIZED) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[5000] p-4">
          <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-12 py-8 bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight ">Master Policy Creator</h2>
                <p className="text-[10px] font-bold text-slate-400  tracking-[0.2em] mt-1">Register new criteria in your database</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 shadow-sm border border-slate-100 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Policy Name</label>
                  <input
                    value={newPolicy.policy_name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policy_name: e.target.value })}
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-700 shadow-inner"
                    placeholder="e.g. Exhibitor Safety"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Policy Type</label>
                  <select
                    value={newPolicy.policy_type}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policy_type: e.target.value })}
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-700 shadow-inner appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option>Exhibitor</option>
                    <option>Visitor</option>
                    <option>Vendor</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Policy Group</label>
                  <select
                    value={newPolicy.policy_group}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policy_group: e.target.value })}
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-700 shadow-inner appearance-none"
                  >
                    <option value="">Select Grouping</option>
                    <option>Cancellation Policy</option>
                    <option>Refund Policy</option>
                    <option>Safety Policy</option>
                    <option>Privacy Policy</option>
                    <option>Payment Policy</option>
                    <option>Paper Submission Guidelines</option>
                    <option>Registration Policy</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Detailed Description</label>
                  <textarea
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    rows="4"
                    className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-slate-600 shadow-inner resize-none leading-relaxed"
                    placeholder="Elaborate on the policy details here..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-5 pt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-2 text-[10px] font-black text-slate-300 hover:text-slate-600  tracking-[0.2em] transition-all">
                  Discard
                </button>
                <button type="submit" disabled={loading} className="px-12 py-4 bg-slate-900 text-white rounded-full font-black text-xs  tracking-widest shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "Synching..." : "Register Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Terms;