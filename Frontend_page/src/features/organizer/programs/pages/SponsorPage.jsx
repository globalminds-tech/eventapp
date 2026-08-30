import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Save,
  Search,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sponsor = () => {
  function getToday() {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const [page, setPage] = useState("list"); // list | sponsorForm | accountForm | view
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const sponsorDocInputRef = useRef(null);
  const accountDocInputRef = useRef(null);

  const [sponsorList, setSponsorList] = useState([
    {
      id: 1,
      sponsorCode: "SPO-4",
      sponsorName: "Vikas",
      primaryContactNo: "9080798079",
      secondaryContactNo: "",
      mailId: "vikas19052004@gmail.com",
      address: "perumbakkam",
      status: "Active",
      createdBy: "Sakthi",
      createdOn: "07/03/2026",
      modifiedBy: "Sakthi",
      modifiedOn: "07/03/2026",
      country: "INDIA",
      state: "TAMIL NADU",
      city: "CHENNAI",
      documents: [],
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountDocuments: [],
    },
  ]);

  const initialForm = {
    sponsorCode: "",
    sponsorName: "",
    primaryContactNo: "",
    secondaryContactNo: "",
    mailId: "",
    address: "",
    status: "Active",
    createdBy: "Sakthi",
    createdOn: getToday(),
    modifiedBy: "Sakthi",
    modifiedOn: getToday(),
    country: "INDIA",
    state: "TAMIL NADU",
    city: "CHENNAI",
    documents: [],
    currentDocumentType: "",
    currentDocumentNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountDocuments: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [sponsorUploadFile, setSponsorUploadFile] = useState(null);
  const [accountUploadFile, setAccountUploadFile] = useState(null);

  const [errors, setErrors] = useState({});

  const filteredSponsors = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return sponsorList;

    return sponsorList.filter((item) =>
      [
        item.sponsorCode,
        item.sponsorName,
        item.primaryContactNo,
        item.mailId,
        item.address,
        item.status,
        item.createdBy,
        item.createdOn,
        item.modifiedBy,
        item.modifiedOn,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [searchKeyword, sponsorList]);

  const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);
  const paginatedData = filteredSponsors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, itemsPerPage]);

  const resetAll = () => {
    setFormData({
      ...initialForm,
      createdOn: getToday(),
      modifiedOn: getToday(),
    });
    setSponsorUploadFile(null);
    setAccountUploadFile(null);
    setEditId(null);
    setViewItem(null);
    setErrors({});
  };

  const handleAddNew = () => {
    resetAll();
    setPage("sponsorForm");
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      sponsorCode: item.sponsorCode || "",
      sponsorName: item.sponsorName || "",
      primaryContactNo: item.primaryContactNo || "",
      secondaryContactNo: item.secondaryContactNo || "",
      mailId: item.mailId || "",
      address: item.address || "",
      status: item.status || "Active",
      createdBy: item.createdBy || "Sakthi",
      createdOn: item.createdOn || getToday(),
      modifiedBy: "Sakthi",
      modifiedOn: getToday(),
      country: item.country || "INDIA",
      state: item.state || "TAMIL NADU",
      city: item.city || "CHENNAI",
      documents: item.documents || [],
      currentDocumentType: "",
      currentDocumentNumber: "",
      accountHolderName: item.accountHolderName || "",
      bankName: item.bankName || "",
      accountNumber: item.accountNumber || "",
      ifscCode: item.ifscCode || "",
      accountDocuments: item.accountDocuments || [],
    });
    setErrors({});
    setPage("sponsorForm");
  };

  const handleView = (item) => {
    setViewItem(item);
    setPage("view");
  };

  const handleDelete = (id) => {
    setSponsorList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateField = (field, value) => {
    let updatedValue = value;

    if (field === "primaryContactNo" || field === "secondaryContactNo") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (field === "mailId") {
      updatedValue = value.toLowerCase();
    }

    if (field === "ifscCode") {
      updatedValue = value.toUpperCase().replace(/\s/g, "");
    }

    if (field === "accountNumber") {
      updatedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSponsorDocChoose = (e) => {
    const file = e.target.files?.[0];
    if (file) setSponsorUploadFile(file);
  };

  const handleAccountDocChoose = (e) => {
    const file = e.target.files?.[0];
    if (file) setAccountUploadFile(file);
  };

  const validateSponsorForm = () => {
    const newErrors = {};
    const contactRegex = /^[0-9]{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

    if (!formData.sponsorName.trim()) {
      newErrors.sponsorName = "Sponsor Name is required";
    }

    if (!formData.primaryContactNo.trim()) {
      newErrors.primaryContactNo = "Primary Contact Number is required";
    } else if (!contactRegex.test(formData.primaryContactNo)) {
      newErrors.primaryContactNo = "Contact Number must be exactly 10 digits";
    }

    if (
      formData.secondaryContactNo &&
      !contactRegex.test(formData.secondaryContactNo)
    ) {
      newErrors.secondaryContactNo =
        "Secondary Contact Number must be exactly 10 digits";
    }

    if (!formData.mailId.trim()) {
      newErrors.mailId = "Mail ID is required";
    } else if (!emailRegex.test(formData.mailId)) {
      newErrors.mailId = "Email must end with @gmail.com";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAccountForm = () => {
    const newErrors = {};

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Example: SBIN0001234
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // 8 or 11 chars
    const accountRegex = /^[0-9]{6,18}$/;

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account Holder Name is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank Name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account Number is required";
    } else if (!accountRegex.test(formData.accountNumber)) {
      newErrors.accountNumber =
        "Account Number must be 6 to 18 digits only";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC / SWIFT Code is required";
    } else if (
      !ifscRegex.test(formData.ifscCode) &&
      !swiftRegex.test(formData.ifscCode)
    ) {
      newErrors.ifscCode =
        "Enter a valid IFSC (e.g. SBIN0001234) or SWIFT code";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const addSponsorDocument = () => {
    if (
      !formData.currentDocumentType ||
      !formData.currentDocumentNumber ||
      !sponsorUploadFile
    ) {
      alert("Please select document type, document number and upload file.");
      return;
    }

    const newDoc = {
      id: Date.now(),
      documentType: formData.currentDocumentType,
      documentNumber: formData.currentDocumentNumber,
      fileName: sponsorUploadFile.name,
      fileObject: sponsorUploadFile,
    };

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      currentDocumentType: "",
      currentDocumentNumber: "",
    }));
    setSponsorUploadFile(null);
    if (sponsorDocInputRef.current) sponsorDocInputRef.current.value = "";
  };

  const addAccountDocument = () => {
    if (!accountUploadFile) {
      alert("Please upload account document.");
      return;
    }

    const newDoc = {
      id: Date.now(),
      fileName: accountUploadFile.name,
      fileObject: accountUploadFile,
    };

    setFormData((prev) => ({
      ...prev,
      accountDocuments: [...prev.accountDocuments, newDoc],
    }));
    setAccountUploadFile(null);
    if (accountDocInputRef.current) accountDocInputRef.current.value = "";
  };

  const handleNext = () => {
    if (!validateSponsorForm()) return;
    setPage("accountForm");
  };

  const handleBack = () => {
    setPage("sponsorForm");
  };

  const handleSave = () => {
    if (!validateAccountForm()) return;

    if (editId) {
      setSponsorList((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
              ...item,
              ...formData,
              modifiedBy: "Sakthi",
              modifiedOn: getToday(),
            }
            : item
        )
      );
    } else {
      const nextId =
        sponsorList.length > 0
          ? Math.max(...sponsorList.map((item) => item.id)) + 1
          : 1;

      const sponsorCode =
        formData.sponsorCode && formData.sponsorCode.trim()
          ? formData.sponsorCode
          : `SPO-${nextId + 3}`;

      setSponsorList((prev) => [
        ...prev,
        {
          id: nextId,
          ...formData,
          sponsorCode,
          createdBy: "Sakthi",
          createdOn: getToday(),
          modifiedBy: "Sakthi",
          modifiedOn: getToday(),
        },
      ]);
    }

    resetAll();
    setPage("list");
  };

  const topActionButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-md border border-[#d8dceb] bg-white text-[#4f6891] shadow-sm hover:bg-[#f8faff]";

  const inputClass =
    "h-12 w-full rounded-md border border-[#cfd6e4] bg-white px-4 text-[15px] text-[#445a7b] outline-none placeholder:text-[#7b8ca8] focus:border-[#8aa5e6]";
  const errorInputClass =
    "h-12 w-full rounded-md border border-red-500 bg-white px-4 text-[15px] text-[#445a7b] outline-none placeholder:text-[#7b8ca8] focus:border-red-500";
  const labelClass = "mb-2 block text-[18px] font-semibold text-[#374d6c]";
  const sectionTitleClass = "mb-4 text-[26px] font-medium text-[#3557ff]";
  const cardClass =
    "rounded-md border border-[#d4d9e7] bg-white p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]";

  return (
    <div className="min-h-screen w-full bg-[#eef2f8] text-[#3f5577]">
      {/* Header */}
      <div className="border-b border-[#dde2ec] bg-[#f7f8fb] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-semibold leading-none text-[#486487]">
            Sponsor
          </h1>

          {page !== "list" && page !== "view" && (
            <div className="flex items-center gap-3">
              {page === "accountForm" && (
                <button
                  className={topActionButtonClass}
                  onClick={handleSave}
                  title="Save"
                >
                  <Save size={22} />
                </button>
              )}
              <button
                className={topActionButtonClass}
                onClick={resetAll}
                title="Clear"
              >
                <Trash2 size={22} />
              </button>
              <button className={topActionButtonClass} title="Search">
                <Search size={22} />
              </button>
            </div>
          )}

          {page === "list" && (
            <button
              className={topActionButtonClass}
              onClick={handleAddNew}
              title="Add Sponsor"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {/* PAGE 1 - LIST */}
      {page === "list" && (
        <div className="p-1">
          <div className="m-1 rounded-md border border-[#d9deea] bg-[#f8f9fc] px-6 py-4">
            <div className="rounded-sm border border-[#d9deea] bg-white px-6 py-4">
              <div className="mb-7 flex items-start justify-between">
                <div className="w-[315px]">
                  <input
                    type="text"
                    placeholder="Search Keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="h-[46px] w-full rounded-[4px] border border-[#cfd6e2] bg-white px-4 text-[16px] text-[#5b6b84] outline-none placeholder:text-[#6f809a]"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#cfd6e2] bg-white text-[#56719a]">
                    <FileText size={16} />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#cfd6e2] bg-white text-[#56719a]">
                    <Upload size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#d6dbe6]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Sponsor Code ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Sponsor Name ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Primary Contact No ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Mail ID ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Address ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Created By ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Created On ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Modified By ↑↓
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Modified On ↑↓
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-3 py-3 text-left text-[15px] text-[#4f6281]"
                        >
                          No Data Found.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="bg-white">
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleView(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d6dbe6] text-[#5570a0]"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d6dbe6] text-[#5570a0]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d6dbe6] text-[#5570a0]"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.sponsorCode}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.sponsorName}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.primaryContactNo}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.mailId}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.address}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.status}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.createdBy}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.createdOn}
                          </td>
                          <td className="border-r border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.modifiedBy}
                          </td>
                          <td className="border-b border-[#e0e5ee] px-3 py-3 text-[16px] text-[#425977]">
                            {item.modifiedOn}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredSponsors.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4 px-4 py-3 bg-white">
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2 - SPONSOR DETAILS */}
      {page === "sponsorForm" && (
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center justify-between px-5">
            <div className="flex flex-1 items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4162f3] text-[18px] font-medium text-white">
                1
              </div>
              <div className="ml-3 text-[16px] font-semibold text-[#465d7e]">
                Sponsor Details
              </div>
              <div className="ml-4 h-[2px] flex-1 bg-[#d6dce8]" />
            </div>

            <div className="ml-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[18px] text-[#5d6e86]">
                2
              </div>
              <div className="text-[16px] font-semibold text-[#697a93]">
                Account Details
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr_1fr]">
            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Sponsor Details</h2>

              <div className="mb-4">
                <label className={labelClass}>
                  Sponsor Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={errors.sponsorName ? errorInputClass : inputClass}
                  placeholder="Enter Sponsor Name"
                  value={formData.sponsorName}
                  onChange={(e) => updateField("sponsorName", e.target.value)}
                />
                {errors.sponsorName && (
                  <p className="mt-1 text-sm text-red-500">{errors.sponsorName}</p>
                )}
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Primary Contact No <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.primaryContactNo ? errorInputClass : inputClass}
                    placeholder="Enter Primary Contact No"
                    value={formData.primaryContactNo}
                    maxLength={10}
                    onChange={(e) =>
                      updateField("primaryContactNo", e.target.value)
                    }
                  />
                  {errors.primaryContactNo && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.primaryContactNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Secondary Contact No</label>
                  <input
                    className={errors.secondaryContactNo ? errorInputClass : inputClass}
                    placeholder="Enter Secondary Contact No"
                    value={formData.secondaryContactNo}
                    maxLength={10}
                    onChange={(e) =>
                      updateField("secondaryContactNo", e.target.value)
                    }
                  />
                  {errors.secondaryContactNo && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.secondaryContactNo}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>
                  Mail ID <span className="text-red-500">*</span>
                </label>
                <input
                  className={errors.mailId ? errorInputClass : inputClass}
                  placeholder="Enter Mail ID"
                  value={formData.mailId}
                  onChange={(e) => updateField("mailId", e.target.value)}
                />
                {errors.mailId && (
                  <p className="mt-1 text-sm text-red-500">{errors.mailId}</p>
                )}
              </div>

              <div className="mb-4">
                <label className={labelClass}>
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`min-h-[112px] w-full rounded-md bg-white px-4 py-3 text-[15px] text-[#445a7b] outline-none placeholder:text-[#7b8ca8] ${errors.address
                    ? "border border-red-500 focus:border-red-500"
                    : "border border-[#cfd6e4] focus:border-[#8aa5e6]"
                    }`}
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputClass}
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  >
                    <option>INDIA</option>
                    <option>USA</option>
                    <option>UAE</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputClass}
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  >
                    <option>TAMIL NADU</option>
                    <option>KERALA</option>
                    <option>KARNATAKA</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputClass}
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  >
                    <option>CHENNAI</option>
                    <option>COIMBATORE</option>
                    <option>MADURAI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Sponsor Documents</h2>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputClass}
                    value={formData.currentDocumentType}
                    onChange={(e) =>
                      updateField("currentDocumentType", e.target.value)
                    }
                  >
                    <option value="">Select Document Type</option>
                    <option>PAN</option>
                    <option>GST</option>
                    <option>LICENSE</option>
                    <option>ID PROOF</option>
                    <option>AADHAR</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Document Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Enter Document Number"
                    value={formData.currentDocumentNumber}
                    onChange={(e) =>
                      updateField("currentDocumentNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className={labelClass}>Upload Document</label>
                <div
                  className="flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d8dce6] bg-[#f7f8fc] text-[#8a8f99]"
                  onClick={() => sponsorDocInputRef.current?.click()}
                >
                  <Upload size={38} />
                  <p className="mt-3 text-[18px]">Upload Document</p>
                  {sponsorUploadFile && (
                    <p className="mt-2 text-sm text-[#4361ee]">
                      {sponsorUploadFile.name}
                    </p>
                  )}
                  <input
                    ref={sponsorDocInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleSponsorDocChoose}
                    accept=".jpeg,.jpg,.png,.webp,.pdf"
                  />
                </div>
              </div>

              <div className="mt-5 text-right text-[14px] text-[#4d5f7f]">
                Supported Files : JPEG , PNG , WEBP , PDF
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={addSponsorDocument}
                  className="rounded-md border-2 border-[#3557ff] px-6 py-2 text-[18px] font-medium text-[#3557ff] hover:bg-[#3557ff] hover:text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Document Details</h2>

              <div className="overflow-x-auto border border-[#d6dbe6]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Document Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        File Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.documents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-2 text-[15px] text-[#4c5f80]"
                        >
                          No Data Found.
                        </td>
                      </tr>
                    ) : (
                      formData.documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="border-r border-b border-[#e1e6ef] px-3 py-2">
                            <button
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  documents: prev.documents.filter(
                                    (d) => d.id !== doc.id
                                  ),
                                }))
                              }
                              className="rounded-md border border-[#d6dbe6] p-2 text-[#5570a0]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                          <td className="border-r border-b border-[#e1e6ef] px-3 py-2 text-[15px]">
                            {doc.documentType}
                          </td>
                          <td className="border-r border-b border-[#e1e6ef] px-3 py-2 text-[15px]">
                            {doc.documentNumber}
                          </td>
                          <td className="border-b border-[#e1e6ef] px-3 py-2 text-[15px]">
                            {doc.fileName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-3 rounded-md border-2 border-[#3557ff] px-6 py-2 text-[18px] font-medium text-[#3557ff] hover:bg-[#3557ff] hover:text-white"
            >
              Next <ArrowRight size={28} />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 3 - ACCOUNT DETAILS */}
      {page === "accountForm" && (
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center justify-between px-5">
            <div className="flex flex-1 items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[18px] text-[#5d6e86]">
                1
              </div>
              <div className="ml-3 text-[16px] font-semibold text-[#465d7e]">
                Sponsor Details
              </div>
              <div className="ml-4 h-[2px] flex-1 bg-[#2f7cf6]" />
            </div>

            <div className="ml-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4162f3] text-[18px] font-medium text-white">
                2
              </div>
              <div className="text-[16px] font-semibold text-[#465d7e]">
                Account Details
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[620px_1fr]">
            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Account Details</h2>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.accountHolderName ? errorInputClass : inputClass}
                    placeholder="Enter Account Holder Name"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      updateField("accountHolderName", e.target.value)
                    }
                  />
                  {errors.accountHolderName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.accountHolderName}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.bankName ? errorInputClass : inputClass}
                    placeholder="Enter Bank Name"
                    value={formData.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                  />
                  {errors.bankName && (
                    <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.accountNumber ? errorInputClass : inputClass}
                    placeholder="Enter Account Number"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      updateField("accountNumber", e.target.value)
                    }
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    IFSC / SWIFT Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.ifscCode ? errorInputClass : inputClass}
                    placeholder="Enter IFSC / SWIFT Code"
                    value={formData.ifscCode}
                    onChange={(e) => updateField("ifscCode", e.target.value)}
                  />
                  {errors.ifscCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.ifscCode}</p>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <label className={labelClass}>Upload Document</label>
                <div
                  className="flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d8dce6] bg-[#f7f8fc] text-[#8a8f99]"
                  onClick={() => accountDocInputRef.current?.click()}
                >
                  <Upload size={38} />
                  <p className="mt-3 text-[18px]">Upload Document</p>
                  {accountUploadFile && (
                    <p className="mt-2 text-sm text-[#4361ee]">
                      {accountUploadFile.name}
                    </p>
                  )}
                  <input
                    ref={accountDocInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleAccountDocChoose}
                    accept=".jpeg,.jpg,.png,.webp,.pdf"
                  />
                </div>
              </div>

              <div className="mt-5 text-right text-[14px] text-[#4d5f7f]">
                Supported Files : JPEG , PNG , WEBP , PDF
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={addAccountDocument}
                  className="rounded-md border-2 border-[#3557ff] px-6 py-2 text-[18px] font-medium text-[#3557ff] hover:bg-[#3557ff] hover:text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Attached File Preview</h2>

              {formData.accountDocuments.length === 0 ? (
                <div className="h-[520px]" />
              ) : (
                <div className="space-y-3">
                  {formData.accountDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-md border border-[#d6dbe6] bg-[#f8faff] px-4 py-3"
                    >
                      <span className="text-[16px] text-[#48617f]">
                        {doc.fileName}
                      </span>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            accountDocuments: prev.accountDocuments.filter(
                              (d) => d.id !== doc.id
                            ),
                          }))
                        }
                        className="rounded-md border border-[#d6dbe6] p-2 text-[#5570a0]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md border-2 border-[#3557ff] px-6 py-2 text-[18px] font-medium text-[#3557ff] hover:bg-[#3557ff] hover:text-white"
            >
              <ArrowLeft size={28} /> Back
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md border-2 border-[#3557ff] px-6 py-2 text-[18px] font-medium text-[#3557ff] hover:bg-[#3557ff] hover:text-white"
            >
              <Save size={22} /> Save
            </button>
          </div>
        </div>
      )}

      {/* VIEW PAGE */}
      {page === "view" && viewItem && (
        <div className="px-6 py-4">
          <div className="rounded-md border border-[#d4d9e7] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[28px] font-medium text-[#3557ff]">
                Sponsor View
              </h2>
              <button
                onClick={() => setPage("list")}
                className="rounded-md border-2 border-[#3557ff] px-5 py-2 text-[17px] font-medium text-[#3557ff]"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-md border border-[#d8deea] p-5">
                <h3 className="mb-4 text-[22px] font-medium text-[#3557ff]">
                  Sponsor Details
                </h3>
                <div className="space-y-3 text-[16px] text-[#465d7e]">
                  <p>
                    <span className="font-semibold">Sponsor Code:</span>{" "}
                    {viewItem.sponsorCode}
                  </p>
                  <p>
                    <span className="font-semibold">Sponsor Name:</span>{" "}
                    {viewItem.sponsorName}
                  </p>
                  <p>
                    <span className="font-semibold">Primary Contact No:</span>{" "}
                    {viewItem.primaryContactNo}
                  </p>
                  <p>
                    <span className="font-semibold">Secondary Contact No:</span>{" "}
                    {viewItem.secondaryContactNo || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Mail ID:</span>{" "}
                    {viewItem.mailId}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {viewItem.address}
                  </p>
                  <p>
                    <span className="font-semibold">Country:</span>{" "}
                    {viewItem.country}
                  </p>
                  <p>
                    <span className="font-semibold">State:</span>{" "}
                    {viewItem.state}
                  </p>
                  <p>
                    <span className="font-semibold">City:</span> {viewItem.city}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {viewItem.status}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-[#d8deea] p-5">
                <h3 className="mb-4 text-[22px] font-medium text-[#3557ff]">
                  Account Details
                </h3>
                <div className="space-y-3 text-[16px] text-[#465d7e]">
                  <p>
                    <span className="font-semibold">Account Holder Name:</span>{" "}
                    {viewItem.accountHolderName || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Bank Name:</span>{" "}
                    {viewItem.bankName || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Account Number:</span>{" "}
                    {viewItem.accountNumber || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">IFSC / SWIFT Code:</span>{" "}
                    {viewItem.ifscCode || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Created By:</span>{" "}
                    {viewItem.createdBy}
                  </p>
                  <p>
                    <span className="font-semibold">Created On:</span>{" "}
                    {viewItem.createdOn}
                  </p>
                  <p>
                    <span className="font-semibold">Modified By:</span>{" "}
                    {viewItem.modifiedBy}
                  </p>
                  <p>
                    <span className="font-semibold">Modified On:</span>{" "}
                    {viewItem.modifiedOn}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-md border border-[#d8deea] p-5">
                <h3 className="mb-4 text-[22px] font-medium text-[#3557ff]">
                  Sponsor Documents
                </h3>
                {viewItem.documents?.length ? (
                  <div className="space-y-2">
                    {viewItem.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-md border border-[#d8deea] bg-[#f8faff] px-4 py-3 text-[15px] text-[#496280]"
                      >
                        {doc.documentType} - {doc.documentNumber} -{" "}
                        {doc.fileName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[15px] text-[#6d7f99]">No documents</p>
                )}
              </div>

              <div className="rounded-md border border-[#d8deea] p-5">
                <h3 className="mb-4 text-[22px] font-medium text-[#3557ff]">
                  Account Documents
                </h3>
                {viewItem.accountDocuments?.length ? (
                  <div className="space-y-2">
                    {viewItem.accountDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-md border border-[#d8deea] bg-[#f8faff] px-4 py-3 text-[15px] text-[#496280]"
                      >
                        {doc.fileName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[15px] text-[#6d7f99]">No documents</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsor;