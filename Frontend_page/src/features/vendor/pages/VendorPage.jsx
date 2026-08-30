import { useState, useEffect, useRef } from "react";
import { Eye, Plus, X, CheckCircle, AlertCircle, Info, Trash2, Edit, FileSpreadsheet, FileText, Download, Search, ChevronDown } from "lucide-react";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { getVendors, createVendor, getVendorById, deleteVendor, updateVendor, exportVendorsExcel, exportVendorsPdf, getCountries, getStates, getCities } from "@/Services/api";

export const VendorPage = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [toast, setToast] = useState(null);
  const [fullPreview, setFullPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [loading, setLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    vendor_type: "",
    vendor_name: "",
    company_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    country: "",
    state: "",
    city: "",
    address: "",
    bank_name: "",
    account_holder: "",
    ifsc_code: "",
    account_number: "",
    status: "Active",
    bank_passbook: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [bankPreview, setBankPreview] = useState(null);

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
      loadVendors();
    }
    loadCountries();
  }, [organizer?.id]);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-close toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ================= TOAST NOTIFICATION =================

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  // ================= LOAD =================

  const loadVendors = async () => {
    try {
      const res = await getVendors(organizer.id);
      setVendors(res.data || []);
    } catch (error) {
      console.error("Error loading vendors:", error);
      setVendors([]);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  };

  const loadStates = async (countryCode) => {
    try {
      const res = await getStates(countryCode);
      setStates(res);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    try {
      const res = await getCities(countryCode, stateCode);
      setCities(res);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restriction: Only digits allowed for these fields
    if (
      ["primary_contact", "secondary_contact", "account_number"].includes(name)
    ) {
      if (value !== "" && !/^\d+$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBankPassbook = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBankPreview(reader.result);
      setForm({ ...form, bank_passbook: reader.result });
    };
  };

  const removeBankPassbook = () => {
    setBankPreview(null);
    setForm({ ...form, bank_passbook: "" });
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
    if (!file) return;

    // Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const temp = [...documents];
      temp[index].document_file = reader.result;
      temp[index].preview = reader.result;
      setDocuments(temp);
    };
    reader.readAsDataURL(file);
  };

  const addDocument = () => {
    if (documents.length >= 3) {
      showToast("Maximum 3 documents allowed", "error");
      return;
    }

    const lastDoc = documents[documents.length - 1];
    if (lastDoc && !lastDoc.document_file) {
      showToast("Please upload the file for the current document before adding another", "error");
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

  const handleRemoveDocFile = (index) => {
    const temp = [...documents];
    temp[index].document_file = "";
    temp[index].preview = "";
    setDocuments(temp);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      const temp = [...documents];
      temp.splice(index, 1);
      setDocuments(temp);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getVendorById(id);
      const data = res.data;
      setForm({
        vendor_type: data.vendor_type || "",
        vendor_name: data.vendor_name || "",
        company_name: data.company_name || "",
        primary_contact: data.primary_contact || "",
        secondary_contact: data.secondary_contact || "",
        mail_id: data.mail_id || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
        bank_name: data.bank_name || "",
        account_holder: data.account_holder || "",
        ifsc_code: data.ifsc_code || "",
        account_number: data.account_number || "",
        status: data.status || "Active",
        bank_passbook: data.bank_passbook || "",
      });
      setCountrySearch(data.country || "");
      setStateSearch(data.state || "");
      setCitySearch(data.city || "");

      // Load states and cities for editing if needed
      // Note: This logic depends on having the country/state IDs if the CSC library needs them
      // Since CSC library in api.jsx uses isoCode as ID, we might need to store/fetch those
      // But for now we match by name as a fallback or if CSC supports it.

      setBankPreview(data.bank_passbook || null);
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents.map(doc => ({
          ...doc,
          preview: doc.document_file
        })));
      } else {
        setDocuments([{
          document_type: "",
          document_number: "",
          document_file: "",
          preview: "",
        }]);
      }
      setEditId(id);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      showToast("Failed to fetch vendor details", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      vendor_type: "",
      vendor_name: "",
      company_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      country: "",
      state: "",
      city: "",
      address: "",
      bank_name: "",
      account_holder: "",
      ifsc_code: "",
      account_number: "",
      status: "Active",
    });
    setDocuments([
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
    setBankPreview(null);
    setCountrySearch("");
    setStateSearch("");
    setCitySearch("");
    setStates([]);
    setCities([]);
    setShowCountryDropdown(false);
    setShowStateDropdown(false);
    setShowCityDropdown(false);
    setFieldErrors({});
    setEditId(null);
    setIsEditing(false);
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.vendor_type) errors.vendor_type = "Vendor type is required";
    if (!form.vendor_name) errors.vendor_name = "Vendor name is required";
    if (!form.company_name) errors.company_name = "Company name is required";
    if (!form.primary_contact)
      errors.primary_contact = "Primary contact is required";
    if (!form.mail_id) {
      errors.mail_id = "Mail ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail_id)) {
      errors.mail_id = "Invalid email format";
    }
    if (!form.country && !countrySearch) errors.country = "Country is required";
    if (!form.state && !stateSearch) errors.state = "State is required";
    if (!form.city && !citySearch) errors.city = "City is required";
    if (!form.address) errors.address = "Address is required";
    if (!form.account_holder)
      errors.account_holder = "Account holder name is required";
    if (!form.bank_name) errors.bank_name = "Bank name is required";
    if (!form.account_number)
      errors.account_number = "Account number is required";
    if (!form.ifsc_code) errors.ifsc_code = "IFSC code is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("Please fill all mandatory fields", "error");
      return;
    }

    // Document Validation
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      // Skip empty document rows
      if (!doc.document_type && !doc.document_number && !doc.document_file) {
        continue;
      }

      if (!doc.document_type || !doc.document_number || !doc.document_file) {
        showToast(`Document ${i + 1}: Please complete all fields (Type, Number, File) or leave them all blank`, "error");
        return;
      }

      if (doc.document_type === "Aadhar" && doc.document_number.length !== 12) {
        showToast(`Document ${i + 1}: Aadhar must be exactly 12 digits`, "error");
        return;
      }
      if (doc.document_type === "PAN" && doc.document_number.length !== 10) {
        showToast(`Document ${i + 1}: PAN must be exactly 10 characters`, "error");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        country: form.country || countrySearch,
        state: form.state || stateSearch,
        city: form.city || citySearch,
        organizer_id: organizer.id,
        documents: documents.filter(
          (d) => d.document_type && d.document_number && d.document_file
        ),
      };

      if (isEditing) {
        await updateVendor(editId, payload);
        showToast("✓ Vendor Updated Successfully!", "success");
      } else {
        await createVendor(payload);
        showToast("✓ Vendor Created Successfully!", "success");
      }

      setShowForm(false);
      resetForm();
      loadVendors();
    } catch (error) {
      showToast(isEditing ? "Failed to update vendor" : "Failed to create vendor", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW =================

  const viewVendor = async (id) => {
    try {
      const res = await getVendorById(id);
      setViewData(res.data);
    } catch (error) {
      console.error("Error viewing vendor:", error);
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  const handleExportExcel = async () => {
    if (vendors.length === 0) {
      showToast("No data available for export.", "error");
      return;
    }

    try {
      setIsExcelLoading(true);
      showToast("Generating Excel report...", "success");

      const response = await exportVendorsExcel();
      const filename = `vendor_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.xlsx`;

      saveAs(response.data, filename);
      showToast("Vendor data exported successfully.", "success");
    } catch (error) {
      console.error("Excel export failed:", error);
      showToast("Failed to generate Excel export.", "error");
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (vendors.length === 0) {
      showToast("No data available for export.", "error");
      return;
    }

    try {
      setIsPdfLoading(true);
      showToast("Generating PDF report...", "success");

      const response = await exportVendorsPdf();
      const filename = `vendor_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;

      saveAs(response.data, filename);
      showToast("Vendor report generated successfully.", "success");
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
      await deleteVendor(id);
      showToast("✓ Vendor Deleted Successfully!", "success");
      setDeleteModal({ isOpen: false, id: null });
      loadVendors();
    } catch (error) {
      showToast("Failed to delete vendor", "error");
      setDeleteModal({ isOpen: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH & PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVendors = vendors.filter(
    (v) =>
      (v.vendor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Vendor Directory Setup
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Register event suppliers, sound/lighting contractors, catering vendors, and security services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            disabled={isExcelLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex gap-2 items-center transition border border-slate-200 text-xs font-bold cursor-pointer h-10"
          >
            {isExcelLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-700 border-t-transparent" />
            ) : (
              <FileSpreadsheet size={16} className="text-emerald-600" />
            )}
            <span>Excel Export</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isPdfLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex gap-2 items-center transition border border-slate-200 text-xs font-bold cursor-pointer h-10"
          >
            {isPdfLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-700 border-t-transparent" />
            ) : (
              <FileText size={16} className="text-rose-600" />
            )}
            <span>PDF Export</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4.5 py-2 rounded-xl flex gap-2 items-center transition shadow-md shadow-cyan-500/20 text-xs cursor-pointer border-none h-10"
          >
            <Plus size={18} />
            <span>Add Vendor</span>
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
            placeholder="Search vendor name, company..."
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
                <th className="px-5 py-3.5">Action</th>
                <th className="px-4 py-3.5">Vendor Name</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created By</th>
                <th className="px-4 py-3.5">Created On</th>
                <th className="px-4 py-3.5">Modified By</th>
                <th className="px-4 py-3.5">Modified On</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {currentVendors.length > 0 ? (
                currentVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-sky-50/50 transition-colors duration-200 group text-[11px]">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewVendor(v.id)}
                          className="text-sky-600 hover:text-sky-800 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(v.id)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: v.id })}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-2 font-medium text-sky-900 truncate" title={v.vendor_name}>
                      {v.vendor_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700 truncate" title={v.primary_contact}>
                      {v.primary_contact}
                    </td>
                    <td className="px-3 py-2 text-slate-600 truncate" title={v.mail_id}>
                      {v.mail_id}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap ${v.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate" title={v.created_by}>
                      {v.created_by || "N/A"}
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate" title={formatDate(v.created_on)}>
                      {formatDate(v.created_on)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate" title={v.modified_by}>
                      {v.modified_by || "N/A"}
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate" title={formatDate(v.modified_on)}>
                      {formatDate(v.modified_on)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Info size={40} />
                      <p className="font-bold">No Vendor found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-500 text-sm">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} entries
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-sky-50 disabled:opacity-40 transition-all font-semibold text-sky-600"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1
                  ? "bg-sky-600 text-white shadow-lg"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-sky-50 disabled:opacity-40 transition-all font-semibold text-sky-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[95%] max-w-[1400px] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-sky-100">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-sky-100 bg-sky-600 rounded-t-2xl">
              <h2 className="text-2xl font-semibold text-white">
                {isEditing ? "Edit Vendor Details" : "New Vendor Details"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:text-sky-100 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-hidden p-8 flex flex-col"
            >
              <div className="grid grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden">
                {/* ------------------ Vendor Information ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm h-full overflow-y-auto custom-scrollbar">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    VENDOR INFORMATION
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-sky-800 mb-1">
                        Vendor Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vendor_type"
                        value={form.vendor_type}
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.vendor_type ? "border-red-500" : "border-sky-200"}`}
                      >
                        <option value="">Select Vendor Type</option>
                        <option>Suppliers</option>
                        <option>Contractors</option>
                        <option>Distributors</option>
                        <option>Freelancer</option>
                      </select>
                      {fieldErrors.vendor_type && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.vendor_type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="vendor_name"
                        value={form.vendor_name}
                        placeholder="Vendor Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.vendor_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.vendor_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.vendor_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="company_name"
                        value={form.company_name}
                        placeholder="Enter Company Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.company_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.company_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.company_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Primary Contact No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="primary_contact"
                        value={form.primary_contact}
                        placeholder="Enter Primary Contact"
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // allow only numbers
                          handleChange({
                            target: {
                              name: "primary_contact",
                              value: value.slice(0, 10), // max 10 digits
                            },
                          });
                        }}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.primary_contact ? "border-red-500" : "border-sky-200"
                          }`}
                      />
                      {fieldErrors.primary_contact && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.primary_contact}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Secondary Contact No (Optional)
                      </label>
                      <input
                        name="secondary_contact"
                        value={form.secondary_contact}
                        placeholder="Enter Secondary Contact"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // only numbers
                          handleChange({
                            target: {
                              name: "secondary_contact",
                              value: value.slice(0, 10), // max 10 digits
                            },
                          });
                        }}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.secondary_contact ? "border-red-500" : "border-sky-200"
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Mail ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="mail_id"
                        value={form.mail_id}
                        placeholder="Enter Mail ID"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.mail_id ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.mail_id && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.mail_id}
                        </p>
                      )}
                    </div>

                    {/* COUNTRY */}
                    <div className="relative" ref={countryRef}>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400"
                        />
                        <input
                          placeholder="Search Country"
                          value={countrySearch}
                          onFocus={() => setShowCountryDropdown(true)}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setShowCountryDropdown(true);
                          }}
                          className={`w-full border p-2 pl-9 pr-14 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.country ? "border-red-500" : "border-sky-200"}`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ ...form, country: "", country_id: "", state: "", city: "" });
                                setCountrySearch("");
                                setStateSearch("");
                                setCitySearch("");
                                setShowCountryDropdown(true);
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCountryDropdown(!showCountryDropdown);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                showCountryDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {showCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-sky-100 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                          {countries
                            .filter((c) =>
                              c.country_name
                                .toLowerCase()
                                .includes(countrySearch.toLowerCase())
                            )
                            .map((c) => (
                              <div
                                key={c.id}
                                className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setForm({
                                    ...form,
                                    country: c.country_name,
                                    country_id: c.id,
                                    state: "",
                                    city: "",
                                  });
                                  setCountrySearch(c.country_name);
                                  setStateSearch("");
                                  setCitySearch("");
                                  setShowCountryDropdown(false);
                                  loadStates(c.id);
                                  if (fieldErrors.country) {
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      country: "",
                                    }));
                                  }
                                }}
                              >
                                {c.country_name}
                              </div>
                            ))}
                        </div>
                      )}
                      {fieldErrors.country && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.country}
                        </p>
                      )}
                    </div>

                    {/* STATE */}
                    <div className="relative" ref={stateRef}>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400"
                        />
                        <input
                          placeholder="Search State"
                          value={stateSearch}
                          onFocus={() => setShowStateDropdown(true)}
                          onChange={(e) => {
                            setStateSearch(e.target.value);
                            setShowStateDropdown(true);
                          }}
                          disabled={!form.country}
                          className={`w-full border p-2 pl-9 pr-14 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.state ? "border-red-500" : "border-sky-200"} disabled:bg-gray-50`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {stateSearch && form.country && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ ...form, state: "", state_id: "", city: "" });
                                setStateSearch("");
                                setCitySearch("");
                                setShowStateDropdown(true);
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!form.country}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStateDropdown(!showStateDropdown);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform disabled:opacity-50"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                showStateDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {showStateDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-sky-100 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                          {states
                            .filter((s) =>
                              s.state_name
                                .toLowerCase()
                                .includes(stateSearch.toLowerCase())
                            )
                            .map((s) => (
                              <div
                                key={s.id}
                                className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setForm({
                                    ...form,
                                    state: s.state_name,
                                    state_id: s.id,
                                    city: "",
                                  });
                                  setStateSearch(s.state_name);
                                  setCitySearch("");
                                  setShowStateDropdown(false);
                                  loadCities(form.country_id, s.id);
                                  if (fieldErrors.state) {
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      state: "",
                                    }));
                                  }
                                }}
                              >
                                {s.state_name}
                              </div>
                            ))}
                        </div>
                      )}
                      {fieldErrors.state && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.state}
                        </p>
                      )}
                    </div>

                    {/* CITY */}
                    <div className="relative" ref={cityRef}>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400"
                        />
                        <input
                          placeholder="Search City"
                          value={citySearch}
                          onFocus={() => setShowCityDropdown(true)}
                          onChange={(e) => {
                            setCitySearch(e.target.value);
                            setShowCityDropdown(true);
                          }}
                          disabled={!form.state}
                          className={`w-full border p-2 pl-9 pr-14 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.city ? "border-red-500" : "border-sky-200"} disabled:bg-gray-50`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {citySearch && form.state && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ ...form, city: "" });
                                setCitySearch("");
                                setShowCityDropdown(true);
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!form.state}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCityDropdown(!showCityDropdown);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform disabled:opacity-50"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                showCityDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {showCityDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-sky-100 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                          {cities
                            .filter((c) =>
                              c.city_name
                                .toLowerCase()
                                .includes(citySearch.toLowerCase())
                            )
                            .map((c) => (
                              <div
                                key={c.id}
                                className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setForm({ ...form, city: c.city_name });
                                  setCitySearch(c.city_name);
                                  setShowCityDropdown(false);
                                  if (fieldErrors.city) {
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      city: "",
                                    }));
                                  }
                                }}
                              >
                                {c.city_name}
                              </div>
                            ))}
                        </div>
                      )}
                      {fieldErrors.city && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={form.address}
                        placeholder="Enter Full Address"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.address ? "border-red-500" : "border-sky-200"}`}
                        rows={3}
                      />
                      {fieldErrors.address && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-sky-800 mb-1">
                        Status
                      </label>
                      <input
                        value={form.status}
                        disabled
                        className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-sky-600 font-bold outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* ------------------ Account Details ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm h-full overflow-y-auto custom-scrollbar">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    ACCOUNT DETAILS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Account Holder Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_holder"
                        value={form.account_holder}
                        placeholder="Enter Account Holder Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.account_holder ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.account_holder && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.account_holder}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="bank_name"
                        value={form.bank_name}
                        placeholder="Enter Bank Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.bank_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.bank_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.bank_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_number"
                        value={form.account_number}
                        maxLength={20}
                        placeholder="Enter Account Number"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.account_number ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.account_number && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.account_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        IFSC / SWIFT Code <span className="text-red-500">*</span>
                      </label>

                      <input
                        name="ifsc_code"
                        value={form.ifsc_code}
                        maxLength={11}
                        placeholder="Enter IFSC Code"
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^a-zA-Z0-9]/g, "") // remove special characters
                            .toUpperCase(); // optional: convert to uppercase

                          handleChange({
                            target: {
                              name: "ifsc_code",
                              value,
                            },
                          });
                        }}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.ifsc_code ? "border-red-500" : "border-sky-200"
                          }`}
                      />

                      {fieldErrors.ifsc_code && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.ifsc_code}
                        </p>
                      )}
                    </div>

                    {/* Passbook Upload */}
                    <div className="space-y-4 px-6 py-4 border border-sky-200 rounded-xl bg-white shadow-sm mt-4">
                      <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider ">
                        Upload Document
                      </label>
                      {!bankPreview ? (
                        <label className="border-dashed border-2 border-sky-200 rounded-xl p-6 text-center text-sky-400 bg-sky-50 hover:bg-sky-100 transition cursor-pointer flex flex-col items-center justify-center group">
                          <Plus className="mx-auto mb-2 group-hover:scale-110 transition-transform text-sky-600" />
                          <span className="font-medium text-sky-600">Upload Document</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleBankPassbook}
                            accept="image/*,.pdf"
                          />
                        </label>
                      ) : (
                        <div
                          className="relative group cursor-zoom-in mt-1"
                          onClick={() => setFullPreview(bankPreview)}
                        >
                          <img
                            src={bankPreview}
                            alt="Bank Preview"
                            className="w-full h-24 object-cover rounded-xl border border-sky-200 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                            <Eye size={20} className="text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBankPassbook();
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="Remove Passbook"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* ------------------ Document Details ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm h-full overflow-y-auto custom-scrollbar">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    DOCUMENTS DETAILS (Optional)
                  </h3>

                  <div className="space-y-6">

                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="space-y-4 px-6 py-4 border border-sky-200 rounded-xl bg-white shadow-sm relative group"
                      >
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition p-1 bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                            title="Remove Document"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider">
                            Document Type
                          </label>
                          <select
                            name="document_type"
                            value={doc.document_type}
                            onChange={(e) => handleDocChange(e, index)}
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Select Document Type</option>
                            <option>PAN</option>
                            <option>Aadhar</option>
                            <option>GST</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1  tracking-wider">
                            Document Number
                          </label>
                          <input
                            name="document_number"
                            value={doc.document_number}
                            placeholder="Enter Document Number"
                            onChange={(e) => handleDocChange(e, index)}
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider">
                            Upload Document
                          </label>
                          {!doc.preview ? (
                            <label className="border-dashed border-2 border-sky-200 rounded-xl p-6 text-center text-sky-400 bg-sky-50 hover:bg-sky-100 transition cursor-pointer flex flex-col items-center justify-center group">
                              <Plus className="mx-auto mb-2 group-hover:scale-110 transition-transform text-sky-600" />
                              <span className="font-medium text-sky-600">Upload Document</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleDocument(e, index)}
                                accept="image/*,.pdf"
                              />
                            </label>
                          ) : (
                            <div
                              className="relative group/preview cursor-zoom-in mt-1"
                              onClick={() => setFullPreview(doc.preview)}
                            >
                              <img
                                src={doc.preview}
                                alt="Doc Preview"
                                className="w-full h-24 object-cover rounded-xl border border-sky-200 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition rounded-xl flex items-center justify-center">
                                <Eye size={20} className="text-white" />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDocFile(index);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                title="Remove File"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDocument}
                      className="w-full border border-sky-500 text-sky-600 px-4 py-3 rounded-xl hover:bg-sky-600 hover:text-white transition font-semibold shadow-sm"
                    >
                      + Add Another Document
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-8 py-3 border border-sky-200 rounded-xl text-sky-700 font-semibold hover:bg-sky-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (editId ? "Updating..." : "Saving...") : (editId ? "Update Vendor" : "Save Vendor")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[800px] max-h-[90vh] p-8 rounded-2xl shadow-2xl border border-sky-100 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-sky-100 pb-4">
              <h2 className="text-2xl font-bold text-sky-900">
                Vendor Details
              </h2>

              <button
                onClick={closeModal}
                className="text-sky-400 hover:text-sky-600 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Vendor Name
                </label>
                <p className="text-lg font-semibold text-slate-800">
                  {viewData.vendor_name}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Company
                </label>
                <p className="text-lg font-semibold text-slate-800">
                  {viewData.company_name}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Vendor Type
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.vendor_type}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Contact
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.primary_contact}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Email
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.mail_id}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${viewData.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {viewData.status}
                  </span>
                </div>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Country
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.country || "N/A"}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  State
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.state || "N/A"}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  City
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.city || "N/A"}
                </p>
              </div>

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600  tracking-wider">
                  Address
                </label>
                <p className="text-slate-700">{viewData.address}</p>
              </div>

              {/* Bank Details Section */}
              <div className="col-span-2 mt-4">
                <h3 className="text-sky-700 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-sky-600 rounded-full"></span>
                  Bank Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 ">
                      Bank Name
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.bank_name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 ">
                      Account Holder
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.account_holder || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 ">
                      Account Number
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.account_number || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 ">
                      IFSC Code
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.ifsc_code || "N/A"}
                    </p>
                  </div>
                  {viewData.bank_passbook && (
                    <div className="col-span-2 bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-4 mt-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-sky-500 ">
                          Passbook / Cheque
                        </label>
                        <p className="text-sm font-semibold text-sky-600">Document Attached</p>
                      </div>
                      <div
                        className="w-16 h-16 rounded border border-sky-200 overflow-hidden cursor-zoom-in group relative"
                        onClick={() => setFullPreview(viewData.bank_passbook)}
                      >
                        <img
                          src={viewData.bank_passbook}
                          className="w-full h-full object-cover"
                          alt="Bank Passbook"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              {viewData.documents && viewData.documents.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="text-sky-700 font-bold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-sky-600 rounded-full"></span>
                    Documents
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-sky-500 uppercase">
                            {doc.document_type || "Document"}
                          </label>
                          <p className="text-sm font-semibold">
                            {doc.document_number || "N/A"}
                          </p>
                        </div>
                        {doc.document_file && (
                          <div
                            className="w-16 h-16 rounded border border-sky-200 overflow-hidden cursor-zoom-in group relative"
                            onClick={() => setFullPreview(doc.document_file)}
                          >
                            <img
                              src={doc.document_file}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye size={16} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={closeModal}
                className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL IMAGE PREVIEW ================= */}
      {fullPreview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[200] px-6 py-4"
          onClick={() => setFullPreview(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setFullPreview(null)}
              className="absolute top-0 right-0 m-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
            >
              <X size={32} />
            </button>
            <img
              src={fullPreview}
              alt="Full Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
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
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Delete Vendor</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this vendor? This action cannot be undone.
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