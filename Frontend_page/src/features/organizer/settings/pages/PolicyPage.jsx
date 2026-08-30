import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Eye,
  Plus,
  X,
  CheckCircle,
  Trash2,
  AlertCircle,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Edit
} from "lucide-react";
import { saveAs } from "file-saver";
import {
  getPolicies,
  createPolicy,
  getPolicyById,
  deletePolicy,
  exportPoliciesExcel,
  exportPoliciesPdf,
  updatePolicy
} from "@/Services/api";

export const PolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [form, setForm] = useState({
    policy_name: "",
    policy_type: "",
    policy_group: "",
    description: "",
    status: "Active",
  });

  const [editId, setEditId] = useState(null);

  const editorRef = useRef(null);

  const execFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setForm((prev) => ({ ...prev, description: html }));
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setForm((prev) => ({ ...prev, description: html }));
    }
  };

  // Sync editor content when modal opens or when editing an existing policy
  useEffect(() => {
    if (showForm && editorRef.current) {
      editorRef.current.innerHTML = form.description || "";
    }
  }, [showForm, editId]);

  const resetForm = () => {
    setForm({
      policy_name: "",
      policy_type: "",
      policy_group: "",
      description: "",
      status: "Active",
    });
    setFieldErrors({});
    setEditId(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };
  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;
  useEffect(() => {
    if (organizer?.id) {
      loadPolicies();
    }
  }, [organizer?.id]);

  // ================= TOAST =================
  const showToast = (message, type = "success") => {
    setPopup({ show: true, message, type });

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ================= LOAD =================



  const loadPolicies = async () => {
    try {
      const res = await getPolicies(organizer.id);
      setPolicies(res.data);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.policy_name) errors.policy_name = "Policy name is required";
    if (!form.policy_type) errors.policy_type = "Policy Type is required";
    if (!form.policy_group) errors.policy_group = "Policy Group is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        organizer_id: Redexorganizer?.id || storedUser.id,
      };

      if (editId) {
        await updatePolicy(editId, payload);
        showToast("Policy updated successfully", "success");
      } else {
        await createPolicy(payload);
        showToast("Policy added successfully", "success");
      }

      resetForm();
      setShowForm(false);
      loadPolicies();
    } catch (error) {
      showToast(editId ? "Failed to update policy" : "Failed to add policy", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = async (id) => {
    try {
      const res = await getPolicyById(id);
      const data = res.data;
      setForm({
        policy_name: data.policy_name || "",
        policy_type: data.policy_type || "",
        policy_group: data.policy_group || "",
        description: data.description || "",
        status: data.status || "Active",
      });
      setEditId(id);
      setShowForm(true);
    } catch (error) {
      showToast("Error fetching policy details");
    }
  };

  // ================= VIEW =================

  const viewPolicy = async (id) => {
    try {
      const res = await getPolicyById(id);
      setViewData(res.data);
    } catch (error) {
      showToast("Error fetching policy details");
    }
  };

  const handleExportExcel = async () => {
    if (policies.length === 0) {
      showToast("No data available for export.", "error");
      return;
    }
    try {
      setIsExcelLoading(true);
      showToast("Generating Excel report...", "success");
      const response = await exportPoliciesExcel();
      const filename = `policy_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.xlsx`;
      saveAs(response.data, filename);
      showToast("Policy data exported successfully.", "success");
    } catch (error) {
      console.error("Excel export failed:", error);
      showToast("Failed to generate Excel export.", "error");
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (policies.length === 0) {
      showToast("No data available for export.", "error");
      return;
    }
    try {
      setIsPdfLoading(true);
      showToast("Generating PDF report...", "success");
      const response = await exportPoliciesPdf();
      const filename = `policy_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
      saveAs(response.data, filename);
      showToast("Policy report generated successfully.", "success");
    } catch (error) {
      console.error("PDF export failed:", error);
      showToast("Failed to generate PDF export.", "error");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      setLoading(true);
      const res = await deletePolicy(id);
      if (res.data.status) {
        showToast("✓ Policy Deleted Successfully!", "success");
        setDeleteModal({ isOpen: false, id: null });
        loadPolicies();
      } else {
        showToast(res.data.message || "Failed to delete policy", "error");
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      showToast("Error deleting policy", "error");
      setDeleteModal({ isOpen: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((p) =>
    p.policy_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="px-6 py-4 sm:p-10 min-h-screen bg-sky-50">
      <style>{`
        .rich-editor[contenteditable]:empty::before {
          content: attr(placeholder);
          color: #94a3b8;
          font-style: italic;
          pointer-events: none;
          position: absolute;
        }
        .rich-editor ul, .policy-desc-view ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-editor ol, .policy-desc-view ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-editor li, .policy-desc-view li {
          display: list-item !important;
        }
        .rich-editor h1, .policy-desc-view h1 {
          font-size: 2rem !important;
          font-weight: 800 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.25 !important;
        }
        .rich-editor h2, .policy-desc-view h2 {
          font-size: 1.6rem !important;
          font-weight: 700 !important;
          margin-top: 0.875rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.25 !important;
        }
        .rich-editor h3, .policy-desc-view h3 {
          font-size: 1.3rem !important;
          font-weight: 650 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.25 !important;
        }
        .rich-editor h4, .policy-desc-view h4 {
          font-size: 1.15rem !important;
          font-weight: 650 !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.25rem !important;
          line-height: 1.25 !important;
        }
        .rich-editor h5, .policy-desc-view h5 {
          font-size: 1.05rem !important;
          font-weight: 600 !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.25rem !important;
          line-height: 1.25 !important;
        }
        .rich-editor h6, .policy-desc-view h6 {
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.25rem !important;
          line-height: 1.25 !important;
        }
      `}</style>
      {/* TOAST */}
      {/* TOAST NOTIFICATION */}
      {popup.show && (
        <div className={`fixed top-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${popup.type === "success"
          ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
          : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{popup.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
          Policy Management
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative group flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              disabled={isExcelLoading}
              className="bg-emerald-600 px-4 py-2 rounded-lg text-white flex gap-2 items-center hover:bg-emerald-700 transition shadow-md disabled:opacity-50 text-xs font-semibold h-11"
            >
              {isExcelLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FileSpreadsheet size={18} />
              )}
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isPdfLoading}
              className="bg-rose-600 px-4 py-2 rounded-lg text-white flex gap-2 items-center hover:bg-rose-700 transition shadow-md disabled:opacity-50 text-xs font-semibold h-11"
            >
              {isPdfLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FileText size={18} />
              )}
              <span>PDF</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl flex gap-2 items-center justify-center font-bold shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 text-sm h-11"
            >
              <Plus size={18} />
              Add Policy
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* HEADER */}
            <thead>
              <tr className="bg-sky-600 text-white">

                <th className="px-6 py-4 text-center text-md font-bold text-white tracking-wider">
                  Action
                </th>

                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">
                  Policy Code
                </th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">
                  Policy Name
                </th>

                <th className="px-8 py-4 text-left text-md font-bold text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Created By</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Created On</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Modified By</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Modified On</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-slate-50">
              {currentPolicies.length > 0 ? (
                currentPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/50 transition-colors duration-200 group"
                  >
                    {/* ACTION */}

                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => viewPolicy(p.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: p.id })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                        {p.policy_code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {p.policy_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-left text-slate-600 whitespace-nowrap">{p.created_by || "N/A"}</td>
                    <td className="px-6 py-4 text-left text-slate-600 whitespace-nowrap">{formatDate(p.created_on)}</td>
                    <td className="px-6 py-4 text-left text-slate-600 whitespace-nowrap">{p.modified_by || "N/A"}</td>
                    <td className="px-6 py-4 text-left text-slate-600 whitespace-nowrap">{formatDate(p.modified_on)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Info size={40} />
                      <p className="font-bold">No policies found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {filteredPolicies.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPolicies.length)} of {filteredPolicies.length} entries
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm font-medium">Records per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] px-6 py-4">
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editId ? "Edit Policy Details" : "New Policy Details"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Define terms and conditions for your events
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full shadow-sm transition-all border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* POLICY NAME */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="policy_name"
                    value={form.policy_name}
                    onChange={handleChange}
                    maxLength={20}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${fieldErrors.policy_name
                      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                      }`}
                    placeholder="Enter Policy Name"
                    required
                  />
                  {fieldErrors.policy_name && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_name}
                    </p>
                  )}
                </div>

                {/* POLICY TYPE */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="policy_type"
                    value={form.policy_type}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none appearance-none ${fieldErrors.policy_type
                      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                      }`}
                    required
                  >
                    <option value="">Select Policy Type</option>
                    <option>Exhibitor</option>
                    <option>Visitor</option>
                    <option>Vendor</option>
                  </select>
                  {fieldErrors.policy_type && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_type}
                    </p>
                  )}
                </div>

                {/* POLICY GROUP */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Select  Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="policy_group"
                    value={form.policy_group}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none appearance-none ${fieldErrors.policy_group
                      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                      }`}
                    required
                  >
                    <option value="">Select Policy Group</option>
                    <option>Cancellation Policy</option>
                    <option>Refund Policy</option>
                    <option>Safety Policy</option>
                    <option>Privacy Policy</option>
                    <option>Payment Policy</option>
                    <option>Paper Submission Guidelines</option>
                    <option>Registration Policy</option>
                  </select>
                  {fieldErrors.policy_group && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_group}
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Status 
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none appearance-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!editId}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Description
                </label>

                <div className="border-2 border-slate-100 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 rounded-2xl overflow-hidden bg-slate-50 transition-all shadow-sm">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 px-4 py-2.5 border-b border-slate-100 bg-white select-none">
                    {/* Bold */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("bold"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-extrabold text-slate-700 transition"
                      title="Bold"
                    >
                      B
                    </button>
                    {/* Italic */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("italic"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center italic font-serif text-slate-700 font-bold transition"
                      title="Italic"
                    >
                      I
                    </button>
                    {/* Underline */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("underline"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center underline text-slate-700 font-bold transition"
                      title="Underline"
                    >
                      U
                    </button>
                    {/* Strikethrough */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("strikeThrough"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center line-through text-slate-700 font-bold transition"
                      title="Strikethrough"
                    >
                      S
                    </button>

                    <span className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Blockquote */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("formatBlock", "blockquote"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 text-lg transition"
                      title="Blockquote"
                    >
                      ❝
                    </button>

                    {/* Code Block */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("formatBlock", "pre"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-mono text-slate-700 transition text-sm font-bold"
                      title="Code Block"
                    >
                      {"</>"}
                    </button>

                    <span className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Ordered List */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("insertOrderedList"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                      title="Numbered List"
                    >
                      <span className="text-xs font-bold font-sans">1.三</span>
                    </button>

                    {/* Unordered List */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("insertUnorderedList"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                      title="Bulleted List"
                    >
                      <span className="text-xs font-bold font-sans">•三</span>
                    </button>

                    <span className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Format Block Dropdown */}
                    <div className="relative flex items-center">
                      <select
                        onChange={(e) => execFormat("formatBlock", e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg pl-2 pr-6 py-1 bg-white h-8 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-100 cursor-pointer appearance-none"
                      >
                        <option value="p">Normal</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <span className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Text Color */}
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition cursor-pointer">
                      <input
                        type="color"
                        onChange={(e) => execFormat("foreColor", e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Text Color"
                      />
                      <span className="text-md font-bold text-slate-700 border-b-2 border-slate-400 pb-0.5 leading-none">A</span>
                    </div>

                    {/* Background Color */}
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition cursor-pointer">
                      <input
                        type="color"
                        onChange={(e) => execFormat("hiliteColor", e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Highlight Color"
                      />
                      <span className="text-md font-bold text-slate-700 bg-slate-200 px-1 py-0.5 rounded leading-none">A</span>
                    </div>

                    {/* Clear Formatting */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); execFormat("removeFormat"); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                      title="Clear Formatting"
                    >
                      <span className="font-semibold text-slate-700 italic">T</span>
                      <span className="text-[10px] text-slate-500 font-bold ml-0.5 -mt-1">x</span>
                    </button>
                  </div>

                  {/* Content Editable Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    placeholder="Provide comprehensive details about this policy..."
                    className="rich-editor relative min-h-[160px] max-h-[240px] overflow-y-auto p-5 text-sm text-slate-700 focus:outline-none bg-slate-50/50"
                    style={{ lineHeight: 1.6 }}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
              <div className="flex justify-end gap-4 px-8 py-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loading ? "Saving..." : (editId ? "Update Policy" : "Save Policy")}
                  <CheckCircle size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] px-6 py-4">
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  View Policy Details
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Define terms and conditions for your events
                </p>
              </div>
              <button
                onClick={() => setViewData(null)}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full shadow-sm transition-all border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* POLICY NAME */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.policy_name}
                    </div>
                  </div>

                  {/* POLICY TYPE */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Policy Type <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.policy_type}
                    </div>
                  </div>

                  {/* POLICY GROUP */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Policy Group <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.policy_group}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Status
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.status}
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Description
                  </label>

                  <div className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-slate-50 transition-all shadow-sm">
                    {/* Fake Toolbar to look exactly like Edit */}
                    <div className="flex flex-wrap items-center gap-1 px-4 py-2.5 border-b border-slate-100 bg-white select-none opacity-60 pointer-events-none">
                      {/* Bold */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-slate-700 transition" title="Bold">B</button>
                      {/* Italic */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center italic font-serif text-slate-700 font-bold transition" title="Italic">I</button>
                      {/* Underline */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center underline text-slate-700 font-bold transition" title="Underline">U</button>
                      {/* Strikethrough */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center line-through text-slate-700 font-bold transition" title="Strikethrough">S</button>
                      <span className="w-px h-6 bg-slate-200 mx-1" />
                      {/* Blockquote */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 text-lg transition" title="Blockquote">❝</button>
                      {/* Code Block */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-slate-700 transition text-sm font-bold" title="Code Block">{"</>"}</button>
                      <span className="w-px h-6 bg-slate-200 mx-1" />
                      {/* Ordered List */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 transition" title="Numbered List"><span className="text-xs font-bold font-sans">1.三</span></button>
                      {/* Unordered List */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 transition" title="Bulleted List"><span className="text-xs font-bold font-sans">•三</span></button>
                      <span className="w-px h-6 bg-slate-200 mx-1" />
                      {/* Format Block Dropdown */}
                      <div className="relative flex items-center">
                        <select className="text-xs border border-slate-200 rounded-lg pl-2 pr-6 py-1 bg-white h-8 text-slate-700 font-semibold appearance-none pointer-events-none">
                          <option>Normal</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <span className="w-px h-6 bg-slate-200 mx-1" />
                      {/* Text Color */}
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-lg transition"><span className="text-md font-bold text-slate-700 border-b-2 border-slate-400 pb-0.5 leading-none">A</span></div>
                      {/* Background Color */}
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-lg transition"><span className="text-md font-bold text-slate-700 bg-slate-200 px-1 py-0.5 rounded leading-none">A</span></div>
                      {/* Clear Formatting */}
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 transition" title="Clear Formatting"><span className="font-semibold text-slate-700 italic">T</span><span className="text-[10px] text-slate-500 font-bold ml-0.5 -mt-1">x</span></button>
                    </div>

                    {/* Content Area */}
                    <div
                      className="rich-editor relative min-h-[160px] max-h-[240px] overflow-y-auto p-5 text-sm text-slate-700 focus:outline-none bg-slate-50/50"
                      style={{ lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: viewData.description || "No description provided." }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-4 px-8 py-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setViewData(null)}
                className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] px-6 py-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-500 font-medium">
                Do you really want to delete this policy? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-sky-100 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Delete Policy</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="px-6 py-3 border border-sky-200 rounded-xl text-sky-700 font-semibold hover:bg-sky-50 transition w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};