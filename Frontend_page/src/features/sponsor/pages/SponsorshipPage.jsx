import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Plus, X, CheckCircle, AlertCircle, Trash2, Search, ChevronLeft, ChevronRight, Info, FileSpreadsheet, FileText, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";

import { getSponsors, getSponsorById, createSponsor, deleteSponsor, updateSponsor, exportSponsorsExcel, exportSponsorsPdf } from "@/Services/api";

export const SponsorshipPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fullPreview, setFullPreview] = useState(null);

  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const [form, setForm] = useState({
    sponsor_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    address: "",
    status: "Active",
    sponsor_image: "",
  });

  const [documents, setDocuments] = useState([
    {
      document_type: "",
      document_number: "",
      document_file: "",
      preview: "",
    },
  ]);

  useEffect(() => {
    if (organizer?.id) {
      loadSponsors();
    }
  }, [organizer?.id]);

  // ================= TOAST NOTIFICATION =================
  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ================= LOAD SPONSORS =================

  const loadSponsors = async () => {
    try {
      const res = await getSponsors(organizer.id);
      setSponsors(res || []);
    } catch (error) {
      console.error("Error loading sponsors:", error);
      showNotification("Failed to load sponsors", "error");
    }
  };

  const handleExportExcel = async () => {
    try {
      setExcelLoading(true);
      const res = await exportSponsorsExcel();
      saveAs(res.data, `Sponsors_List_${new Date().toISOString().split('T')[0]}.xlsx`);
      showNotification("Excel Exported Successfully!");
    } catch (error) {
      showNotification("Failed to export Excel", "error");
    } finally {
      setExcelLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await exportSponsorsPdf();
      saveAs(res.data, `Sponsors_List_${new Date().toISOString().split('T')[0]}.pdf`);
      showNotification("PDF Exported Successfully!");
    } catch (error) {
      showNotification("Failed to export PDF", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    let { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    // 1. Spacing Restriction
    if (typeof value === "string") {
      if (name === "mail_id" || name === "primary_contact" || name === "secondary_contact") {
        value = value.replace(/\s/g, ""); // No spaces allowed at all
      } else {
        value = value.trimStart(); // No leading spaces
      }
    }

    // 2. Contact Number Restriction (Numbers Only, Max 10 digits)
    if (name === "primary_contact" || name === "secondary_contact") {
      if (value !== "" && !/^\d*$/.test(value)) {
        return; // Block alphabets/special chars
      }
      if (value.length > 10) return; // Restrict to 10 digits
    }

    setForm({ ...form, [name]: value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      setImagePreview(reader.result);

      setForm({
        ...form,
        sponsor_image: reader.result,
      });
    };
  };

  // ================= DOCUMENT =================

  const handleDocChange = (e, index) => {
    const temp = [...documents];
    let { name, value } = e.target;

    if (name === "document_number") {
      const type = temp[index].document_type;
      if (type === "Aadhar") {
        value = value.replace(/\D/g, "").slice(0, 12);
      } else if (type === "PAN") {
        value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      }
    }

    temp[index][name] = value;
    setDocuments(temp);
  };

  const handleDocument = (e, index) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const temp = [...documents];

      temp[index].document_file = reader.result;
      temp[index].preview = reader.result;

      setDocuments(temp);
    };
  };

  const addDocument = () => {
    if (documents.length >= 3) {
      showNotification("Maximum 3 documents allowed", "error");
      return;
    }

    // Check if the current last document has a file uploaded
    const lastDoc = documents[documents.length - 1];
    if (lastDoc && !lastDoc.document_file) {
      showNotification("Please upload the file for the current document before adding another", "error");
      return;
    }

    setDocuments([
      ...documents,
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    } else {
      // If it's the last one, just clear it instead of removing
      setDocuments([
        {
          document_type: "",
          document_number: "",
          document_file: "",
          preview: "",
        },
      ]);
    }
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Mandatory Field Validation
    if (!form.sponsor_name.trim()) newErrors.sponsor_name = "Sponsor Name is required";
    if (!form.primary_contact.trim()) newErrors.primary_contact = "Primary contact is required";
    if (!form.mail_id.trim()) newErrors.mail_id = "Mail ID is required";
    if (!form.address.trim()) newErrors.address = "Address is required";

    // 2. Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.mail_id && !emailRegex.test(form.mail_id)) {
      newErrors.mail_id = "Invalid email format (e.g., abc@gmail.com)";
    }

    // 3. Contact Number Validation
    if (form.primary_contact && form.primary_contact.length !== 10) {
      newErrors.primary_contact = "Contact must be exactly 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 4. Document Validation
    const filledDocs = documents.filter(
      (d) => d.document_type || d.document_number || d.document_file,
    );

    for (let i = 0; i < filledDocs.length; i++) {
      const doc = filledDocs[i];
      if (!doc.document_type || doc.document_type === "Document Type") {
        showNotification(
          `Document ${i + 1}: Please select document type`,
          "error",
        );
        return;
      }
      if (!doc.document_number) {
        showNotification(
          `Document ${i + 1}: Please enter document number`,
          "error",
        );
        return;
      }
      if (doc.document_type === "Aadhar" && doc.document_number.length !== 12) {
        showNotification(
          `Document ${i + 1}: Aadhar must be exactly 12 digits`,
          "error",
        );
        return;
      }
      if (doc.document_type === "PAN" && doc.document_number.length !== 10) {
        showNotification(
          `Document ${i + 1}: PAN must be exactly 10 characters`,
          "error",
        );
        return;
      }
      if (!doc.document_file) {
        showNotification(
          `Document ${i + 1}: Please upload the document file`,
          "error",
        );
        return;
      }
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateSponsor(editId, {
          ...form,
          organizer_id: organizer.id,
          documents: filledDocs,
          modified_by: organizer.name || "System"
        });
        showNotification("Sponsor Updated Successfully!", "success");
      } else {
        await createSponsor({
          ...form,
          organizer_id: organizer.id,
          documents: filledDocs,
          created_by: organizer.name || "System"
        });
        showNotification("Sponsor Created Successfully!", "success");
      }

      setShowForm(false);
      handleReset();
      loadSponsors();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Failed to save sponsor. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const onBack = () => {
    navigate("/OrganizerHome/SponsorshipPage");
  };

  const handleReset = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      sponsor_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      address: "",
      status: "Active",
      sponsor_image: "",
    });
    setDocuments([
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
    setImagePreview(null);
    setErrors({});
  };

  // ================= VIEW =================

  const viewSponsor = async (id) => {
    try {
      const res = await getSponsorById(id);

      setViewData(res);
    } catch (error) {
      showNotification("Failed to load sponsor details", "error");
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getSponsorById(id);
      setForm({
        sponsor_name: res.sponsor_name || "",
        primary_contact: res.primary_contact || "",
        secondary_contact: res.secondary_contact || "",
        mail_id: res.mail_id || "",
        address: res.address || "",
        status: res.status || "Active",
        sponsor_image: res.sponsor_image || "",
      });

      if (res.documents && res.documents.length > 0) {
        setDocuments(res.documents.map(d => ({
          document_type: d.document_type,
          document_number: d.document_number,
          document_file: d.document_file,
          preview: d.document_file
        })));
      } else {
        setDocuments([{ document_type: "", document_number: "", document_file: "", preview: "" }]);
      }

      setEditId(id);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      showNotification("Failed to load sponsor for editing", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteSponsor(confirmDeleteId);
      showNotification("Sponsor Deleted Successfully!", "success");
      loadSponsors();
    } catch (error) {
      showNotification("Failed to delete sponsor", "error");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setConfirmDeleteId(null);
    }
  };

  // ================= SEARCH =================

  const filteredSponsors = sponsors.filter(
    (s) =>
      (s.sponsor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.sponsor_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSponsors = filteredSponsors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${toast.type === "success"
          ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
          : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sponsorship Tiers & Partners
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage event sponsors, corporate partners, brand placement tiers, and sponsorship packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            disabled={excelLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex gap-2 items-center transition border border-slate-200 text-xs font-bold cursor-pointer h-10"
          >
            {excelLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-700 border-t-transparent" />
            ) : (
              <FileSpreadsheet size={16} className="text-emerald-600" />
            )}
            <span>Excel Export</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={pdfLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex gap-2 items-center transition border border-slate-200 text-xs font-bold cursor-pointer h-10"
          >
            {pdfLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-700 border-t-transparent" />
            ) : (
              <FileText size={16} className="text-rose-600" />
            )}
            <span>PDF Export</span>
          </button>

          <button
            onClick={() => {
              handleReset();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4.5 py-2 rounded-xl flex gap-2 items-center transition shadow-md shadow-cyan-500/20 text-xs cursor-pointer border-none h-10"
          >
            <Plus size={18} />
            <span>Add Sponsor</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="flex justify-start">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search sponsors by name, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-9 pr-4 rounded-xl bg-white text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold shadow-2xs"
          />
        </div>
      </div>

      {/* ── SHADCN TABLE ── */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 text-center">Action</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-5 py-3.5">Sponsor Name</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Mail ID</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created By</th>
                <th className="px-4 py-3.5 text-center">Created On</th>
                <th className="px-4 py-3.5">Modified By</th>
                <th className="px-4 py-3.5 text-center">Modified On</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Eye className="text-slate-300" size={32} />
                      </div>
                      <p className="text-slate-400 font-bold italic">No sponsors found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSponsors.map((s, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-sky-50/30 transition-all group"
                  >
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewSponsor(s.id)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(s.id)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                        {s.sponsor_code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 truncate max-w-[150px]" title={s.sponsor_name}>{s.sponsor_name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600" title={s.primary_contact}>
                      {s.primary_contact}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-sky-600 truncate max-w-[150px] block" title={s.mail_id}>
                      {s.mail_id}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                        }`}>
                        {s.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{s.created_by || "System"}</td>

                    <td className="px-6 py-4 text-center text-sm text-slate-600 whitespace-nowrap">
                      {s.created_on ? new Date(s.created_on).toLocaleDateString('en-GB') : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {s.modified_by || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-slate-600 whitespace-nowrap">
                      {s.modified_on ? new Date(s.modified_on).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredSponsors.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4 px-4 py-3 bg-white border border-slate-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSponsors.length)} of {filteredSponsors.length} entries
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
                  {editId ? "Edit Sponsor Details" : "New Sponsor Details"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Manage sponsor information and documents
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  handleReset();
                }}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full shadow-sm transition-all border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* SPONSOR NAME */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Sponsor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="sponsor_name"
                      placeholder="Enter Name"
                      value={form.sponsor_name}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${errors.sponsor_name
                        ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                        }`}
                    />
                    {errors.sponsor_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.sponsor_name}</p>}
                  </div>

                  {/* MAIL ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Mail ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="mail_id"
                      placeholder="Email ID"
                      value={form.mail_id}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${errors.mail_id
                        ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                        }`}
                    />
                    {errors.mail_id && <p className="text-red-500 text-xs font-bold ml-1">{errors.mail_id}</p>}
                  </div>

                  {/* PRIMARY CONTACT */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Primary Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="primary_contact"
                      placeholder="Primary No"
                      value={form.primary_contact}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${errors.primary_contact
                        ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                        }`}
                    />
                    {errors.primary_contact && <p className="text-red-500 text-xs font-bold ml-1">{errors.primary_contact}</p>}
                  </div>

                  {/* SECONDARY CONTACT */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Secondary Contact
                    </label>
                    <input
                      name="secondary_contact"
                      placeholder="Secondary No"
                      value={form.secondary_contact}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500`}
                    />
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
                  
                  {/* ADDRESS */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      placeholder="Complete Address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none min-h-[100px] resize-none ${errors.address
                        ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                        }`}
                    />
                    {errors.address && <p className="text-red-500 text-xs font-bold ml-1">{errors.address}</p>}
                  </div>

                  {/* DOCUMENTS SECTION */}
                  <div className="md:col-span-2 border-t border-slate-100 pt-6">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center justify-between">
                      Sponsor Documents (Optional)
                      <button
                        type="button"
                        onClick={addDocument}
                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm transition-all font-bold"
                      >
                        + Add Document
                      </button>
                    </h3>

                    <div className="space-y-4">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="relative bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center"
                        >
                          <select
                            name="document_type"
                            value={doc.document_type}
                            onChange={(e) => handleDocChange(e, index)}
                            className="p-3 w-full md:w-1/3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-700 font-medium"
                          >
                            <option value="">Document Type</option>
                            <option value="Aadhar">Aadhar</option>
                            <option value="PAN">PAN</option>
                          </select>
                          
                          <input
                            name="document_number"
                            placeholder="Number"
                            value={doc.document_number}
                            onChange={(e) => handleDocChange(e, index)}
                            className="p-3 w-full md:w-1/3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-700 font-medium"
                          />

                          <input
                            type="file"
                            id={`doc-file-${index}`}
                            onChange={(e) => handleDocument(e, index)}
                            className="hidden"
                          />
                          <label
                            htmlFor={`doc-file-${index}`}
                            className="w-full md:w-1/3 p-3 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold cursor-pointer text-center hover:bg-blue-50 transition-all flex justify-between items-center"
                          >
                            <span className="text-sm truncate mr-2">{documents[index].document_file ? "File Uploaded" : "Choose File"}</span>
                            <span className="bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-700">Browse</span>
                          </label>

                          {documents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-4 px-8 py-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setShowForm(false);
                  }}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Saving..." : (editId ? "Update Sponsor" : "Save Sponsor")}
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
                  View Sponsor Details
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Manage sponsor information and documents
                </p>
              </div>
              <button
                onClick={() => setViewData(null)}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full shadow-sm transition-all border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* SPONSOR CODE */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Sponsor Code
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.sponsor_code}
                    </div>
                  </div>

                  {/* SPONSOR NAME */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Sponsor Name
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.sponsor_name}
                    </div>
                  </div>

                  {/* MAIL ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Mail ID
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none truncate">
                      {viewData.mail_id}
                    </div>
                  </div>

                  {/* PRIMARY CONTACT */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Primary Contact
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none">
                      {viewData.primary_contact}
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
                  
                  {/* ADDRESS */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Address
                    </label>
                    <div className="w-full p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 text-slate-700 outline-none min-h-[100px]">
                      {viewData.address}
                    </div>
                  </div>

                  {/* DOCUMENTS SECTION */}
                  {viewData.documents && viewData.documents.length > 0 && (
                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center justify-between">
                        Sponsor Documents
                      </h3>

                      <div className="space-y-4">
                        {viewData.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="relative bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center"
                          >
                            <div className="p-3 w-full md:w-1/3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-center">
                              {doc.document_type}
                            </div>
                            
                            <div className="p-3 w-full md:w-1/3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-center">
                              {doc.document_number}
                            </div>

                            <div 
                              className="w-full md:w-1/3 p-3 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold text-center flex justify-center items-center gap-3"
                            >
                               {doc.document_file && (
                                 <button
                                   onClick={() => setFullPreview(doc.document_file)}
                                   className="flex items-center gap-2 hover:text-blue-700 transition-colors"
                                 >
                                   <Eye size={18} /> View Document
                                 </button>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-[400px] overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                You are about to delete this sponsor. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= FULL IMAGE PREVIEW ================= */}
      {fullPreview && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[10000] p-4 cursor-zoom-out"
          onClick={() => setFullPreview(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-12 -right-12 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setFullPreview(null)}
            >
              <X size={32} />
            </button>
            <img
              src={fullPreview}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
