import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
  Info,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { saveAs } from "file-saver";
import {
  getVenueDetails,
  createVenue,
  getVenues,
  getCountries,
  getStates,
  getCities,
  deleteVenue,
  exportVenuesExcel,
  exportVenuesPdf,
  updateVenue
} from "../../Services/api";

export const Venuepage = () => {
  const { t } = useTranslation();

  const isPDF = (url) => {
    if (!url) return false;
    return url.startsWith("data:application/pdf") || url.toLowerCase().includes(".pdf");
  };

  const [venues, setVenues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editId, setEditId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [imagePreview, setImagePreview] = useState(null);
  const [fullPreview, setFullPreview] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [form, setForm] = useState({
    venue_name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pin_code: "",
    status: "Active",
    venue_image: "",
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
      loadVenues();
    }
    loadCountries();
  }, [organizer?.id]);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch(form.country || "");
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
        setStateSearch(form.state || "");
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
        setCitySearch(form.city || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [form.country, form.state, form.city]);



  // ================= VENUES =================

  const loadVenues = async () => {
    try {
      const res = await getVenues(organizer.id);

      setVenues(Array.isArray(res) ? [...res].reverse() : []);
    } catch (error) {
      console.error("Error loading venues:", error);
      setVenues([]);
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
    setLoadingStates(true);
    try {
      const res = await getStates(countryCode);
      setStates(res);
    } catch (error) {
      console.error("Error loading states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    setLoadingCities(true);
    try {
      const res = await getCities(countryCode, stateCode);
      setCities(res);
    } catch (error) {
      console.error("Error loading cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (form.country) {
      const selectedCountry = countries.find(c => c.country_name === form.country);
      if (selectedCountry) {
        loadStates(selectedCountry.id);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [form.country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (form.state && form.country) {
      const selectedCountry = countries.find(c => c.country_name === form.country);
      const selectedState = states.find(s => s.state_name === form.state);
      if (selectedCountry && selectedState) {
        loadCities(selectedCountry.id, selectedState.id);
      }
    } else {
      setCities([]);
    }
  }, [form.state, states, form.country, countries]);

  const fetchPincodeByCity = async (cityName) => {
    if (!cityName) return;
    try {
      // Use Indian postal pincode API for India
      const res = await axios.get(`https://api.postalpincode.in/postoffice/${cityName}`);
      if (res.data && res.data[0].Status === "Success") {
        const pincode = res.data[0].PostOffice[0].Pincode;
        setForm(prev => ({ ...prev, pin_code: pincode }));
        if (fieldErrors.pin_code) {
          setFieldErrors(prev => ({ ...prev, pin_code: "" }));
        }
      }
    } catch (error) {
      console.error("Error fetching pincode:", error);
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

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setForm({
        ...form,
        venue_image: reader.result,
      });
      if (fieldErrors.venue_image) {
        setFieldErrors((prev) => ({ ...prev, venue_image: "" }));
      }
    };
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm({
      ...form,
      venue_image: "",
    });
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

    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size should be less than 5MB", "error");
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
      showNotification("Maximum 3 documents allowed", "error");
      return;
    }

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

  const resetForm = () => {
    setForm({
      venue_name: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pin_code: "",
      status: "Active",
      venue_image: "",
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
  };



  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.venue_name) errors.venue_name = "Venue name is required";
    if (!form.address) errors.address = "Address is required";
    if (!form.country && !countrySearch) errors.country = "Country is required";
    if (!form.state && !stateSearch) errors.state = "State is required";
    if (!form.city && !citySearch) errors.city = "City is required";
    if (!form.pin_code) errors.pin_code = "Pin code is required";
    else if (!/^\d{6}$/.test(form.pin_code)) errors.pin_code = "Pin code must be 6 digits";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Document Validation
    const filledDocs = documents.filter(
      (d) => d.document_type || d.document_number || d.document_file,
    );

    for (let i = 0; i < filledDocs.length; i++) {
      const doc = filledDocs[i];
      if (!doc.document_type) {
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
      const payload = {
        ...form,
        country: form.country || countrySearch,
        state: form.state || stateSearch,
        city: form.city || citySearch,
        organizer_id: organizer.id,
        documents: filledDocs,
      };

      if (editId) {
        await updateVenue(editId, payload);
        showNotification("Venue updated successfully!", "success");
      } else {
        await createVenue(payload);
        showNotification("Venue created successfully!", "success");
      }

      setShowForm(false);
      resetForm();
      loadVenues();
    } catch (error) {
      console.error("Failed to save venue:", error);
      showNotification("Failed to save venue", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getVenueDetails(id);
      const venue = res.venue;
      const docs = res.documents;

      setForm({
        venue_name: venue.venue_name || "",
        address: venue.address || "",
        country: venue.country_name || "",
        state: venue.state_name || "",
        city: venue.city_name || "",
        pin_code: venue.pin_code || "",
        status: venue.status || "Active",
        venue_image: venue.venue_image || "",
      });

      setCountrySearch(venue.country_name || "");
      setStateSearch(venue.state_name || "");
      setCitySearch(venue.city_name || "");

      setImagePreview(venue.venue_image || null);

      if (docs && docs.length > 0) {
        setDocuments(docs.map(doc => ({
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
      setShowForm(true);
    } catch (error) {
      showNotification("Failed to fetch venue details", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW =================

  const viewVenue = async (id) => {
    const res = await getVenueDetails(id);

    setViewData(res);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      setLoading(true);
      await deleteVenue(deleteConfirm.id);
      showNotification("Venue deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      loadVenues();
    } catch (error) {
      console.error("Failed to delete venue:", error);
      showNotification("Failed to delete venue", "error");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  const handleExportExcel = async () => {
    if (venues.length === 0) {
      showNotification("No data available for export.", "error");
      return;
    }
    try {
      setIsExcelLoading(true);
      showNotification("Generating Excel report...", "success");
      const response = await exportVenuesExcel();
      const filename = `venue_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.xlsx`;
      saveAs(response.data, filename);
      showNotification("Venue data exported successfully.", "success");
    } catch (error) {
      console.error("Excel export failed:", error);
      showNotification("Failed to generate Excel export.", "error");
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (venues.length === 0) {
      showNotification("No data available for export.", "error");
      return;
    }
    try {
      setIsPdfLoading(true);
      showNotification("Generating PDF report...", "success");
      const response = await exportVenuesPdf();
      const filename = `venue_list_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
      saveAs(response.data, filename);
      showNotification("Venue report generated successfully.", "success");
    } catch (error) {
      console.error("PDF export failed:", error);
      showNotification("Failed to generate PDF export.", "error");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const filteredCountries = countrySearch && countrySearch !== form.country
    ? countries.filter((c) => c.country_name.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const filteredStates = stateSearch && stateSearch !== form.state
    ? states.filter((s) => s.state_name.toLowerCase().includes(stateSearch.toLowerCase()))
    : states;

  const filteredCities = citySearch && citySearch !== form.city
    ? cities.filter((c) => c.city_name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  // ================= SEARCH =================

  const filteredVenues = venues.filter(
    (v) =>
      (v.venue_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.venue_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.address || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVenues = filteredVenues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ================= UI =================

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Venue Management Setup
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage venue locations, addresses, hall layouts, and master location records.
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
            <span>Add Venue</span>
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
            placeholder="Search venue name, code, address..."
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
                <th className="px-4 py-3.5">Code</th>
                <th className="px-5 py-3.5">Venue Name</th>
                <th className="px-5 py-3.5">Address</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created By</th>
                <th className="px-4 py-3.5">Created On</th>
                <th className="px-4 py-3.5">Modified By</th>
                <th className="px-4 py-3.5">Modified On</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {currentVenues.length > 0 ? (
                currentVenues.map((v) => (
                  <tr key={v.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(v.id)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => viewVenue(v.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>


                    <td className="px-6 py-4 font-medium text-sky-900">{v.venue_code}</td>

                    <td className="px-6 py-4 text-slate-700">{v.venue_name}</td>

                    <td className="px-6 py-4 text-slate-600">{v.address}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${v.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{v.created_by || "N/A"}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(v.created_on)}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{v.modified_by || "N/A"}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(v.modified_on)}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Info size={40} />
                      <p className="font-bold">No Venue found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {filteredVenues.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVenues.length)} of {filteredVenues.length} entries
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
        <div className="fixed inset-0 bg-sky-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-3">

          {/* MODAL */}
          <div className="bg-white border border-sky-100 shadow-2xl rounded-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white shrink-0">
              <h2 className="text-xl font-bold">{editId ? "Edit Venue Details" : "New Venue Details"}</h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="flex-grow overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 h-[calc(95vh-120px)]"
            >

              {/* COLUMN 1: VENUE INFORMATION */}
              <div className="flex flex-col h-full bg-sky-50 rounded-xl border border-sky-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-sky-100/50 bg-sky-50/50 shrink-0">
                  <h3 className="text-sm font-semibold text-sky-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-sky-600 rounded-full"></span>
                    Venue Information
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {/* VENUE IMAGE */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-slate-700">
                      Venue Image
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 cursor-pointer hover:border-sky-400 transition bg-white ${fieldErrors.venue_image ? "border-red-500" : "border-sky-200"
                        }`}
                    >
                      <span className="text-sky-500 text-sm font-semibold">Upload Image</span>
                     

                      <input
                        type="file"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Supported files: jpg, png, jpeg, webp</p>

                    {fieldErrors.venue_image && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.venue_image}
                      </p>
                    )}

                    {imagePreview && (
                      <div
                        className="relative mt-3 group cursor-pointer"
                        onClick={() => setFullPreview(imagePreview)}
                      >
                        <img
                          src={imagePreview}
                          className="rounded-lg h-48 w-full object-cover border border-sky-100 shadow-sm"
                        />

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                          <Eye size={20} className="text-white" />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* VENUE NAME */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Venue Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="venue_name"
                      value={form.venue_name}
                      placeholder="Enter venue name"
                      onChange={handleChange}
                      className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm outline-none transition ${fieldErrors.venue_name ? "border-red-500" : "border-sky-200"
                        }`}
                    />

                    {fieldErrors.venue_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.venue_name}
                      </p>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Address <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      rows="3"
                      placeholder="Enter address"
                      onChange={handleChange}
                      className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm resize-none outline-none transition ${fieldErrors.address ? "border-red-500" : "border-sky-200"
                        }`}
                    />

                    {fieldErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>

                  {/* COUNTRY */}
                  <div className="relative" ref={countryRef}>
                    <label className="text-xs font-medium text-slate-700">
                      Country <span className="text-red-500">*</span>
                    </label>

                    <div className="relative flex items-center mt-1">
                      <Search className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search Country"
                        value={countrySearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCountrySearch(val);
                          setShowCountryDropdown(true);
                          // If user clears or changes text, clear dependent IDs
                          if (val === "") {
                            setForm({ ...form, country: "", state: "", city: "" });
                            setStateSearch("");
                            setCitySearch("");
                          }
                        }}
                        onFocus={() => setShowCountryDropdown(true)}
                        className={`w-full p-2 pl-9 pr-14 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm outline-none transition-all ${fieldErrors.country ? "border-red-500" : "border-sky-200"
                          }`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm({ ...form, country: "", state: "", city: "" });
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
                            className={`w-4 h-4 transition-transform duration-200 ${showCountryDropdown ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* DROPDOWN */}
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {filteredCountries.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setForm({ ...form, country: c.country_name, state: "", city: "" });
                              setCountrySearch(c.country_name);
                              setStateSearch("");
                              setCitySearch("");
                              setShowCountryDropdown(false);
                            }}
                            className={`p-2 cursor-pointer transition-colors text-sm ${form.country === c.country_name
                                ? "bg-sky-600 text-white"
                                : "hover:bg-sky-100 text-slate-700"
                              }`}
                          >
                            {c.country_name}
                          </div>
                        ))}

                        {filteredCountries.length === 0 && (
                          <div className="p-2 text-gray-400 text-sm">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STATE */}
                  <div className="relative" ref={stateRef}>
                    <label className="text-xs font-medium text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>

                    <div className="relative flex items-center mt-1">
                      <Search className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={form.country ? "Search State" : "Select Country first"}
                        value={stateSearch}
                        disabled={!form.country}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStateSearch(val);
                          setShowStateDropdown(true);
                          if (val === "") {
                            setForm({ ...form, state: "", city: "" });
                            setCitySearch("");
                          }
                        }}
                        onFocus={() => setShowStateDropdown(true)}
                        className={`w-full p-2 pl-9 pr-14 rounded-lg outline-none transition-all text-sm ${!form.country
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : `bg-white border focus:ring-2 focus:ring-sky-500 ${fieldErrors.state ? "border-red-500" : "border-sky-200"
                            }`
                          }`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {stateSearch && form.country && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm({ ...form, state: "", city: "" });
                              setStateSearch("");
                              setCitySearch("");
                              setShowStateDropdown(true);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                        {loadingStates ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-600 mr-0.5" />
                        ) : (
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
                              className={`w-4 h-4 transition-transform duration-200 ${showStateDropdown ? "rotate-180" : ""
                                }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {showStateDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {loadingStates ? (
                          <div className="p-2 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-sky-600 w-4 h-4" />
                            Loading states...
                          </div>
                        ) : filteredStates.length === 0 ? (
                          <div className="p-2 text-gray-400 text-sm italic">
                            {!form.country ? "Please select a country first" : "No results found"}
                          </div>
                        ) : (
                          filteredStates.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setForm({ ...form, state: s.state_name, city: "" });
                                setStateSearch(s.state_name);
                                setCitySearch("");
                                setShowStateDropdown(false);
                              }}
                              className={`p-2 cursor-pointer transition-colors text-sm ${form.state === s.state_name
                                  ? "bg-sky-600 text-white"
                                  : "hover:bg-sky-100 text-slate-700"
                                }`}
                            >
                              {s.state_name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* CITY */}
                  <div className="relative" ref={cityRef}>
                    <label className="text-xs font-medium text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>

                    <div className="relative flex items-center mt-1">
                      <Search className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={form.state ? "Search City" : "Select State first"}
                        value={citySearch}
                        disabled={!form.state}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCitySearch(val);
                          setShowCityDropdown(true);
                          if (val === "") {
                            setForm({ ...form, city: "" });
                          }
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        className={`w-full p-2 pl-9 pr-14 rounded-lg outline-none transition-all text-sm ${!form.state
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : `bg-white border focus:ring-2 focus:ring-sky-500 ${fieldErrors.city ? "border-red-500" : "border-sky-200"
                            }`
                          }`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
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
                        {loadingCities ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-600 mr-0.5" />
                        ) : (
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
                              className={`w-4 h-4 transition-transform duration-200 ${showCityDropdown ? "rotate-180" : ""
                                }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {showCityDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {loadingCities ? (
                          <div className="p-2 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-sky-600 w-4 h-4" />
                            Loading cities...
                          </div>
                        ) : filteredCities.length === 0 ? (
                          <div className="p-2 text-gray-400 text-sm italic">
                            {!form.state ? "Please select a state first" : "No results found"}
                          </div>
                        ) : (
                          filteredCities.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setForm({ ...form, city: c.city_name });
                                setCitySearch(c.city_name);
                                setShowCityDropdown(false);
                                // Auto-fetch pincode if country is India
                                if (form.country === "India") {
                                  fetchPincodeByCity(c.city_name);
                                }
                              }}
                              className={`p-2 cursor-pointer transition-colors text-sm ${form.city === c.city_name
                                  ? "bg-sky-600 text-white"
                                  : "hover:bg-sky-100 text-slate-700"
                                }`}
                            >
                              {c.city_name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* PIN CODE */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Pin Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pin_code"
                      value={form.pin_code}
                      placeholder="Enter 6-digit pin code"
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setForm({ ...form, pin_code: val });
                        if (fieldErrors.pin_code) {
                          setFieldErrors((prev) => ({ ...prev, pin_code: "" }));
                        }
                      }}
                      className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm outline-none transition ${fieldErrors.pin_code ? "border-red-500" : "border-sky-200"
                        }`}
                    />
                    {fieldErrors.pin_code && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {fieldErrors.pin_code}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value="Active"
                      disabled
                      className="w-full mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none text-sm text-slate-500 cursor-not-allowed"
                    >
                      <option value="Active">Active</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: LOCATION DETAILS */}
              <div className="flex flex-col h-full bg-sky-50 rounded-xl border border-sky-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-sky-100/50 bg-sky-50/50 shrink-0">
                  <h3 className="text-sm font-semibold text-sky-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-sky-600 rounded-full"></span>
                    Location Details
                  </h3>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-hidden">
                  {/* LATITUDE & LONGITUDE */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Latitude"
                        value="Latitude"
                        disabled
                        className="w-full mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Longitude"
                        value="Longitude"
                        disabled
                        className="w-full mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* LOCATION TEXTAREA */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Location
                    </label>
                    <textarea
                      placeholder="Location"
                      value=""
                      disabled
                      className="w-full mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed resize-none h-44"
                    />
                  </div>
                </div>
              </div>

              {/* COLUMN 3: DOCUMENTS DETAILS */}
              <div className="flex flex-col h-full bg-sky-50 rounded-xl border border-sky-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-sky-100/50 bg-sky-50/50 shrink-0">
                  <h3 className="text-sm font-semibold text-sky-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-sky-600 rounded-full"></span>
                    Documents Details (Optional)
                  </h3>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-hidden">
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="space-y-3 p-4 border border-sky-200 rounded-xl bg-white shadow-sm relative group"
                      >
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition p-1 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 shadow"
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
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Select Document Type</option>
                            <option>PAN</option>
                            <option>Aadhar</option>
                            <option>GST</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider">
                            Document Number
                          </label>
                          <input
                            name="document_number"
                            value={doc.document_number}
                            placeholder="Enter Document Number"
                            onChange={(e) => handleDocChange(e, index)}
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider font-semibold">
                            Upload Document
                          </label>
                          {!doc.preview ? (
                            <input
                              type="file"
                              onChange={(e) => handleDocument(e, index)}
                              accept="image/*,.pdf"
                              className="w-full text-xs text-sky-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition cursor-pointer"
                            />
                          ) : (
                            <div
                              className="relative group/preview cursor-zoom-in mt-1"
                              onClick={() => setFullPreview(doc.preview)}
                            >
                              {isPDF(doc.preview) ? (
                                <div className="w-full h-20 rounded-lg border border-sky-200 bg-sky-50 flex flex-col items-center justify-center text-sky-600">
                                  <FileText size={24} />
                                  <span className="text-[10px] font-bold mt-1">PDF Document</span>
                                </div>
                              ) : (
                                <img
                                  src={doc.preview}
                                  alt="Doc Preview"
                                  className="w-full h-20 object-cover rounded-lg border border-sky-200 shadow-sm"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition rounded-lg flex items-center justify-center">
                                <Eye size={16} className="text-white" />
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
                                <X size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={addDocument}
                      className="w-full border border-sky-500 text-sky-600 px-4 py-2 rounded-lg hover:bg-sky-600 hover:text-white transition text-xs font-semibold shadow-sm"
                    >
                      + Add Another Document
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* FOOTER */}
            <div className="px-6 py-3 border-t border-sky-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-5 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>


              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Saving..." : (editId ? "Update Venue" : "Save Venue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm flex justify-center items-center z-[110] px-6 py-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-500 font-medium">
                Do you really want to delete this venue? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-sky-50 border-t border-sky-100">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-sky-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl border border-sky-100">
            {/* Header */}

            <div className="flex justify-between items-center mb-6 border-b border-sky-100 pb-4">
              <h2 className="text-2xl font-bold text-sky-900">View Venue</h2>

              <button
                onClick={closeModal}
                className="text-sky-400 hover:text-sky-600 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Venue Image */}

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Image
                </label>

                <img
                  src={viewData.venue.venue_image}
                  className="w-full h-64 object-cover rounded-lg mt-2 shadow-sm border border-white"
                />
                
              </div>

              {/* Venue Name */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Name
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.venue_name}
                </div>
              </div>

              {/* Venue Code */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Code
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.venue_code}
                </div>
              </div>

              {/* Pin Code */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Pin Code
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.pin_code}
                </div>
              </div>

              {/* Address */}

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Address
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm min-h-[80px]">
                  {viewData.venue.address}
                </div>
              </div>

              {/* Country */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Country
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.country_name}
                </div>
              </div>

              {/* State */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  State
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.state_name}
                </div>
              </div>

              {/* City */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  City
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.city_name}
                </div>
              </div>

              {/* Status */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Status
                </label>

                <div className="mt-1">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${viewData.venue.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {viewData.venue.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {viewData.documents && viewData.documents.length > 0 && (
              <div className="col-span-2 mt-6">
                <h3 className="text-sky-700 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-sky-600 rounded-full"></span>
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-4 shadow-sm"
                    >
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                          {doc.document_type || "Document"}
                        </label>
                        <p className="text-sm font-semibold text-slate-800">
                          {doc.document_number || "N/A"}
                        </p>
                      </div>
                      {doc.document_file && (
                        <div
                          className="w-16 h-16 rounded border border-sky-200 overflow-hidden cursor-zoom-in group relative shadow-sm flex items-center justify-center bg-slate-50"
                          onClick={() => setFullPreview(doc.document_file)}
                        >
                          {isPDF(doc.document_file) ? (
                            <div className="flex flex-col items-center justify-center text-sky-600">
                              <FileText size={20} />
                              <span className="text-[8px] font-bold mt-1">PDF</span>
                            </div>
                          ) : (
                            <img
                              src={doc.document_file}
                              className="w-full h-full object-cover"
                              alt="Document"
                            />
                          )}
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
              className="absolute top-0 right-0 m-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full z-10"
            >
              <X size={32} />
            </button>
            {isPDF(fullPreview) ? (
              <iframe
                src={fullPreview}
                className="w-full h-[80vh] rounded-lg border-0 shadow-2xl bg-white"
                title="PDF Preview"
              />
            ) : (
              <img
                src={fullPreview}
                alt="Full Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};