import React, { useMemo, useRef, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Save,
  Search,
  X,
  Upload,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const ROLE_OPTIONS = ["Super Admin", "Event Manager"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const initialUsers = [
  {
    id: 1,
    userName: "arunkumar",
    password: "Arun@123",
    roleName: "Super Admin",
    mailId: "arunak16112000@gmail.com",
    contactNumber: "9361826137",
    status: "Active",
    createdBy: "Sakthi",
    createdOn: "10/03/2026",
    modifiedBy: "Sakthi",
    modifiedOn: "10/03/2026",
    profileImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    userName: "Parthi",
    password: "Parthi@123",
    roleName: "Super Admin",
    mailId: "jbparthi07@gmail.com",
    contactNumber: "9677440785",
    status: "Active",
    createdBy: "Sakthi",
    createdOn: "08/03/2026",
    modifiedBy: "Sakthi",
    modifiedOn: "08/03/2026",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    userName: "Vikas",
    password: "Vikas@123",
    roleName: "Event Manager",
    mailId: "vikas19052004@gmail.com",
    contactNumber: "8531938400",
    status: "Active",
    createdBy: "Sakthi",
    createdOn: "08/03/2026",
    modifiedBy: "Sakthi",
    modifiedOn: "08/03/2026",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    userName: "Sakthi",
    password: "Sakthi@123",
    roleName: "Super Admin",
    mailId: "sakthivelganesan@gmail.com",
    contactNumber: "8056897132",
    status: "Active",
    createdBy: "Leiten Technologies Pvt Ltd",
    createdOn: "03/03/2025",
    modifiedBy: "Sakthi",
    modifiedOn: "07/03/2026",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
];

const emptyForm = {
  id: null,
  userName: "",
  password: "",
  roleName: "",
  mailId: "",
  contactNumber: "",
  status: "Active",
  createdBy: "Sakthi",
  createdOn: "",
  modifiedBy: "Sakthi",
  modifiedOn: "",
  profileImage: "",
};

const todayString = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function User() {
  const [page, setPage] = useState("list"); // list | form | view
  const [users, setUsers] = useState(initialUsers);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);

  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      [
        user.userName,
        user.roleName,
        user.contactNumber,
        user.mailId,
        user.status,
        user.createdBy,
        user.modifiedBy,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({ ...emptyForm, createdBy: "Sakthi", modifiedBy: "Sakthi" });
    setErrors({});
    setShowPassword(false);
  };

  const handleAdd = () => {
    resetForm();
    setPage("form");
  };

  const handleEdit = (user) => {
    setFormData({ ...user });
    setErrors({});
    setPage("form");
  };

  const handleView = (user) => {
    setViewUser(user);
    setPage("view");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    if ((currentPage - 1) * itemsPerPage >= updatedUsers.length && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) newErrors.userName = "User Name is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.roleName) newErrors.roleName = "Role Name is required";
    if (!formData.mailId.trim()) {
      newErrors.mailId = "Mail ID is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.mailId.trim())) {
      newErrors.mailId = "Mail ID must end with @gmail.com";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Contact Number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const today = todayString();

    if (formData.id) {
      const updatedUsers = users.map((user) =>
        user.id === formData.id
          ? {
            ...formData,
            modifiedBy: "Sakthi",
            modifiedOn: today,
          }
          : user
      );
      setUsers(updatedUsers);
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
        createdBy: "Sakthi",
        createdOn: today,
        modifiedBy: "Sakthi",
        modifiedOn: today,
      };
      setUsers([newUser, ...users]);
    }

    resetForm();
    setPage("list");
    setCurrentPage(1);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Only JPG, PNG and WEBP files are allowed",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-[#eef3fb] px-6 py-4 md:p-6">
      <div className="mx-auto w-full rounded-[6px] border border-[#d9dee8] bg-[#eef3fb]">
        <div className="flex items-center justify-between border-b border-[#d9dee8] bg-[#f7f9fc] px-4 py-3 md:px-5">
          <h1 className="text-[28px] font-semibold leading-none text-[#35507a] md:text-[34px]">
            User
          </h1>

          {page === "list" && (
            <button
              onClick={handleAdd}
              className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#cfd7e6] bg-white text-[#4a6390] transition hover:bg-[#f4f7fc]"
            >
              <Plus size={24} />
            </button>
          )}

          {page === "form" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#cfd7e6] bg-white text-[#4a6390] transition hover:bg-[#f4f7fc]"
              >
                <Save size={22} />
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setPage("list");
                }}
                className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#cfd7e6] bg-white text-[#4a6390] transition hover:bg-[#f4f7fc]"
              >
                <Trash2 size={22} />
              </button>
              <button
                onClick={() => {
                  if (formData.id) {
                    handleView(formData);
                  }
                }}
                className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#cfd7e6] bg-white text-[#4a6390] transition hover:bg-[#f4f7fc]"
              >
                <Search size={22} />
              </button>
            </div>
          )}

          {page === "view" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage("list")}
                className="rounded-[8px] border border-[#cfd7e6] bg-white px-4 py-2 text-sm font-medium text-[#4a6390] hover:bg-[#f4f7fc]"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {page === "list" && (
          <div className="px-6 py-4 md:p-6">
            <div className="rounded-[6px] border border-[#d9dee8] bg-white px-6 py-4 md:p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="relative w-full max-w-[315px]">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search Keyword"
                    className="h-[50px] w-full rounded-[4px] border border-[#cfd7e6] bg-white px-4 text-[15px] text-[#394a6d] outline-none placeholder:text-[#7c8ba7] focus:border-[#6f8cdb]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#cfd7e6] bg-white text-[#4a6390] hover:bg-[#f4f7fc]">
                    <Trash2 size={16} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#cfd7e6] bg-white text-[#4a6390] hover:bg-[#f4f7fc]">
                    <Save size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      {[
                        "Action",
                        "User Name ⇅",
                        "Role ⇅",
                        "Contact Number ⇅",
                        "Email Id ⇅",
                        "Status ⇅",
                        "Created By ⇅",
                        "Created On ⇅",
                        "Modified By ⇅",
                        "Modified On ⇅",
                      ].map((header) => (
                        <th key={header}
                          className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleView(user)}
                                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d7deea] bg-white text-[#5d7298] hover:bg-[#f4f7fc]"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(user)}
                                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d7deea] bg-white text-[#5d7298] hover:bg-[#f4f7fc]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d7deea] bg-white text-[#5d7298] hover:bg-[#f4f7fc]"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-sky-900 whitespace-nowrap">{user.userName}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.roleName}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.contactNumber}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.mailId}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.status}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.createdBy}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.createdOn}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.modifiedBy}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{user.modifiedOn}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-sky-50/50 transition-colors duration-200 group">
                        <td
                          colSpan={10}
                          className="px-6 py-8 text-center text-sm text-slate-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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
        )}

        {page === "form" && (
          <div className="px-6 py-4 md:p-6">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[570px_minmax(0,1fr)]">
              <div className="min-h-[650px] rounded-[6px] border border-[#d9dee8] bg-white p-7">
                <h2 className="mb-5 text-[28px] font-medium text-[#3f5cf4]">Profile Upload</h2>

                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-[190px] w-[190px] flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-[#d4d9e2] bg-[#f7f9fc] text-[#252525] transition hover:bg-[#f1f5fb]"
                    >
                      <Upload size={42} className="mb-3 text-[#222]" />
                      <span className="text-[18px] leading-7">Profile</span>
                      <span className="text-[18px] leading-7">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="mt-3 text-[15px] text-[#111]">
                      Supported Files. JPG, PNG, WEBP
                    </p>
                    {errors.profileImage && (
                      <p className="mt-2 text-sm text-red-500">{errors.profileImage}</p>
                    )}
                  </div>

                  <div className="h-[190px] w-[190px] overflow-hidden rounded-[4px] bg-[#eef2f8]">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#70809b]">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-h-[650px] rounded-[6px] border border-[#d9dee8] bg-white p-5 md:p-7">
                <h2 className="mb-6 text-[28px] font-medium text-[#3f5cf4]">User Information</h2>

                <div className="grid grid-cols-1 gap-x-5 gap-y-6 xl:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      User Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => handleInputChange("userName", e.target.value)}
                      className="h-[48px] w-full rounded-[4px] border border-[#cfd7e6] bg-[#eef3fb] px-4 text-[16px] outline-none focus:border-[#6f8cdb]"
                    />
                    {errors.userName && <p className="mt-1 text-sm text-red-500">{errors.userName}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="h-[48px] w-full rounded-[4px] border border-[#cfd7e6] bg-[#eef3fb] px-4 pr-12 text-[16px] outline-none focus:border-[#6f8cdb]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f7d96]"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.roleName}
                        onChange={(e) => handleInputChange("roleName", e.target.value)}
                        className="h-[48px] w-full appearance-none rounded-[4px] border border-[#cfd7e6] bg-white px-4 pr-12 text-[16px] text-[#66758f] outline-none focus:border-[#6f8cdb]"
                      >
                        <option value="">Select Role Name</option>
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6f7d96]"
                      />
                    </div>
                    {errors.roleName && <p className="mt-1 text-sm text-red-500">{errors.roleName}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      Mail ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.mailId}
                      onChange={(e) => handleInputChange("mailId", e.target.value)}
                      placeholder="Enter Mail ID"
                      className="h-[48px] w-full rounded-[4px] border border-[#cfd7e6] bg-white px-4 text-[16px] outline-none placeholder:text-[#7c8ba7] focus:border-[#6f8cdb]"
                    />
                    {errors.mailId && <p className="mt-1 text-sm text-red-500">{errors.mailId}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.contactNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "contactNumber",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Enter Contact Number"
                      className="h-[48px] w-full rounded-[4px] border border-[#cfd7e6] bg-white px-4 text-[16px] outline-none placeholder:text-[#7c8ba7] focus:border-[#6f8cdb]"
                    />
                    {errors.contactNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-[17px] font-semibold text-black">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="h-[48px] w-full appearance-none rounded-[4px] border border-[#cfd7e6] bg-[#f5f6f8] px-4 pr-12 text-[16px] text-[#7c8595] outline-none focus:border-[#6f8cdb]"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6f7d96]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page === "view" && viewUser && (
          <div className="px-6 py-4 md:p-6">
            <div className="rounded-[6px] border border-[#d9dee8] bg-white p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="h-36 w-36 overflow-hidden rounded-xl border border-[#d4d9e2] bg-[#eef3fb]">
                  {viewUser.profileImage ? (
                    <img
                      src={viewUser.profileImage}
                      alt={viewUser.userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#70809b]">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-[#35507a]">{viewUser.userName}</h2>
                  <p className="mt-2 text-base text-[#6a7891]">{viewUser.roleName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["User Name", viewUser.userName],
                  ["Password", viewUser.password],
                  ["Role Name", viewUser.roleName],
                  ["Mail ID", viewUser.mailId],
                  ["Contact Number", viewUser.contactNumber],
                  ["Status", viewUser.status],
                  ["Created By", viewUser.createdBy],
                  ["Created On", viewUser.createdOn],
                  ["Modified By", viewUser.modifiedBy],
                  ["Modified On", viewUser.modifiedOn],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[8px] border border-[#d9dee8] bg-[#f9fbff] px-6 py-4">
                    <p className="mb-1 text-sm font-medium text-[#7b87a0]">{label}</p>
                    <p className="break-words text-[17px] font-semibold text-[#33425f]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => handleEdit(viewUser)}
                  className="rounded-[8px] bg-[#3f5cf4] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setPage("list")}
                  className="rounded-[8px] border border-[#cfd7e6] bg-white px-5 py-3 text-sm font-semibold text-[#4a6390] hover:bg-[#f4f7fc]"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}