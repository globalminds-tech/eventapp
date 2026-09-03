import { useState, useEffect } from "react";
import { Eye, ArrowLeft, Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { createProgram as createProgramAPI, getProgramEvents, getProgramsByEvent } from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";
import { useSelector } from "react-redux";

export default function CreateProgram() {
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");

  const [events, setEvents] = useState([]);

  // Page 2 states
  const [progSearch, setProgSearch] = useState("");
  const [viewBy, setViewBy] = useState("All");
  const [programs, setPrograms] = useState([]);

  // Page 3 states
  const [formData, setFormData] = useState({
    name: "", category: "", type: "", start: "", end: "", venue: "", maxPart: "", budget: "", coordName: "", coordEmail: "", desc: "", status: "Active",
  });
  const [toast, setToast] = useState(false);
  const [errors, setErrors] = useState({ name: "" });

  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const now = new Date();
  const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  useEffect(() => {
    if (organizer?.id) {
      fetchEvents();
    }
  }, [organizer?.id]);

  const fetchEvents = async () => {
    try {
      const data = await getProgramEvents(organizer.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrograms = async (eventId) => {
    try {
      const data = await getProgramsByEvent(eventId);
      setPrograms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    fetchPrograms(event.id);
    setFormData(prev => ({
      ...prev,
      start: event.start_date,
      end: event.end_date
    }));
    setPage(2);
  };

  const filtered = events.filter((e) =>
    (e.event_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages1 = Math.ceil(filtered.length / itemsPerPage);
  const currentEvents = filtered.slice((currentPage1 - 1) * itemsPerPage, currentPage1 * itemsPerPage);

  useEffect(() => {
    setCurrentPage1(1);
  }, [search]);

  const filteredPrograms = programs.filter((p) =>
    (p.program_name || "").toLowerCase().includes(progSearch.toLowerCase())
  ).filter((p) => {
    if (viewBy === "All") return true;
    return p.status === viewBy;
  });

  const totalPages2 = Math.ceil(filteredPrograms.length / itemsPerPage);
  const currentProgramsList = filteredPrograms.slice((currentPage2 - 1) * itemsPerPage, currentPage2 * itemsPerPage);

  useEffect(() => {
    setCurrentPage2(1);
  }, [progSearch, viewBy]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Custom validation
    const newErrors = { name: "" };
    if (!formData.name.trim()) newErrors.name = "Program Name is required";
    setErrors(newErrors);
    if (newErrors.name) return;

    try {
      await createProgramAPI({ ...formData, event_id: selectedEvent.id });
      setToast(true);
      setTimeout(() => {
        setToast(false);
        setPage(2);
        setFormData({
          name: "", category: "", type: "", start: selectedEvent.start_date, end: selectedEvent.end_date, venue: "", maxPart: "", budget: "", coordName: "", coordEmail: "", desc: "", status: "Active"
        });
        setErrors({ name: "" });
        fetchPrograms(selectedEvent.id);
        fetchEvents();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-sm">

      {/* ================= PAGE 1 ================= */}
      {page === 1 && (
        <>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Programs</h1>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Inprocess</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Approved</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentEvents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                              <Eye className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-bold italic">No Events Found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEvents.map((event, i) => (
                        <tr key={i} className="hover:bg-sky-50/30 transition-all group">
                          <td className="p-4 pl-8">
                            <button
                              onClick={() => handleSelectEvent(event)}
                              className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:text-white hover:scale-110 transition-all shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              {event.event_code}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-black text-slate-800">{event.event_name}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                              {event.created}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 border border-amber-200">
                              {event.inprocess}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 border border-emerald-200">
                              {event.approved}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 border border-rose-200">
                              {event.rejected}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Page 1 */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-slate-500 text-sm font-medium">
                    Showing {((currentPage1 - 1) * itemsPerPage) + 1} to {Math.min(currentPage1 * itemsPerPage, filtered.length)} of {filtered.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage1(1);
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

                {totalPages1 > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage1(p => Math.max(1, p - 1))}
                      disabled={currentPage1 === 1}
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    {[...Array(totalPages1)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage1(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage1 === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage1(p => Math.min(totalPages1, p + 1))}
                      disabled={currentPage1 === totalPages1}
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      <ChevronRight size={20} className="text-slate-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= PAGE 2 ================= */}
      {page === 2 && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setPage(1)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedEvent?.event_name} ({selectedEvent?.event_code})
            </h1>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search Program..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={progSearch}
                  onChange={(e) => setProgSearch(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium text-xs whitespace-nowrap">View By:</span>
                  <Select
                    value={viewBy}
                    onValueChange={(val) => setViewBy(val)}
                    className="w-36"
                    triggerClassName="border-gray-300 rounded-xl h-9 text-xs font-semibold bg-white focus:border-blue-500"
                  >
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Active">Approved</SelectItem>
                    <SelectItem value="Inactive">Rejected</SelectItem>
                    <SelectItem value="Inprocess">Inprocess</SelectItem>
                  </Select>
                </div>

                <button
                  onClick={() => setPage(3)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={20} /> New Program
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sky-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Program Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Program Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentProgramsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                              <Eye className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-bold italic">No Programs match your filter</p>
                            <p className="text-slate-300 text-xs">Click "+ New Program" to add your first program</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentProgramsList.map((prog, idx) => (
                        <tr key={idx} className="hover:bg-sky-50/30 transition-all group">
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              {prog.program_code}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-black text-slate-800">{prog.program_name}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-bold text-slate-600">{prog.category}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-bold text-slate-600">{prog.type}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${prog.status === "Active"
                              ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                              : prog.status === "Inactive"
                                ? "bg-rose-100 text-rose-600 border border-rose-200"
                                : "bg-amber-100 text-amber-600 border border-amber-200"
                              }`}>
                              {prog.status === "Active" ? "Approved" : prog.status === "Inactive" ? "Rejected" : prog.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Page 2 */}
            {filteredPrograms.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-slate-500 text-sm font-medium">
                    Showing {((currentPage2 - 1) * itemsPerPage) + 1} to {Math.min(currentPage2 * itemsPerPage, filteredPrograms.length)} of {filteredPrograms.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage2(1);
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

                {totalPages2 > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage2(p => Math.max(1, p - 1))}
                      disabled={currentPage2 === 1}
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    {[...Array(totalPages2)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage2(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage2 === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage2(p => Math.min(totalPages2, p + 1))}
                      disabled={currentPage2 === totalPages2}
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      <ChevronRight size={20} className="text-slate-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= PAGE 3 ================= */}
      {page === 3 && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setPage(2)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Create Program for {selectedEvent?.event_name}
            </h1>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
            {toast && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-bounce z-10">
                ✅ Program created successfully!
              </div>
            )}

            <form className="p-2" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">

                  {/* Program Name */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium">
                      Program Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z ]/g, "");
                        setFormData({ ...formData, name: val });
                        if (val.trim()) setErrors(prev => ({ ...prev, name: "" }));
                      }}
                      type="text"
                      maxLength={20}
                      className={`w-full border rounded px-3 py-2 outline-none focus:border-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                      placeholder="e.g. Inaugural Session"
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                      <span className="text-xs text-gray-400 ml-auto">{formData.name.length}/20</span>
                    </div>
                  </div>

                  {/* Program Code is now automatic */}

                  <div>
                    <label className="block text-gray-600 mb-1 font-medium">Category</label>
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={20}
                      className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="e.g. Keynote"
                    />
                    <span className="text-xs text-gray-400 float-right mt-1">{formData.category.length}/20</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Start Date</label>
                      <input 
                        name="start" 
                        value={formData.start} 
                        onChange={handleInputChange} 
                        type="date" 
                        min={selectedEvent?.start_date} 
                        max={selectedEvent?.end_date} 
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">End Date</label>
                      <input 
                        name="end" 
                        value={formData.end} 
                        onChange={handleInputChange} 
                        type="date" 
                        min={formData.start || selectedEvent?.start_date} 
                        max={selectedEvent?.end_date} 
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium">Venue</label>
                    <input
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={10}
                      className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="e.g. Hall A"
                    />
                    <span className="text-xs text-gray-400 float-right mt-1">{formData.venue.length}/10</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Max Participants</label>
                      <input
                        name="maxPart"
                        value={formData.maxPart}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val === "" || parseInt(val) <= 5000) {
                            setFormData({ ...formData, maxPart: val });
                          }
                        }}
                        onKeyDown={(e) => ["-", "e", "E", "+", "."].includes(e.key) && e.preventDefault()}
                        type="text"
                        inputMode="numeric"
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="Max 5000"
                      />
                      <span className="text-xs text-gray-400 mt-1 block">Maximum allowed: 5,000</span>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Budget (₹)</label>
                      <input
                        name="budget"
                        value={formData.budget}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val === "" || parseInt(val) <= 500000) {
                            setFormData({ ...formData, budget: val });
                          }
                        }}
                        onKeyDown={(e) => ["-", "e", "E", "+", "."].includes(e.key) && e.preventDefault()}
                        type="text"
                        inputMode="numeric"
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="Max ₹5,00,000"
                      />
                      <span className="text-xs text-gray-400 mt-1 block">Maximum allowed: ₹5,00,000</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Coordinator Name</label>
                      <input
                        name="coordName"
                        value={formData.coordName}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z ]/g, "");
                          setFormData({ ...formData, coordName: val });
                        }}
                        type="text"
                        maxLength={20}
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="e.g. John Doe"
                      />
                      <span className="text-xs text-gray-400 float-right mt-1">{formData.coordName.length}/20</span>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Coordinator Email</label>
                      <input name="coordEmail" value={formData.coordEmail} onChange={handleInputChange} type="email" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <Select
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      triggerClassName="w-full border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-blue-500 bg-white h-10"
                    >
                      <SelectItem value="Active">Approved</SelectItem>
                      <SelectItem value="Inactive">Rejected</SelectItem>
                      <SelectItem value="Inprocess">Inprocess</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-gray-600 mb-1 font-medium">Description</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength={250}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
                  placeholder="Program details..."
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${formData.desc.length >= 230 ? "text-red-400" : "text-gray-400"}`}>
                    {formData.desc.length}/250
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPage(2)}
                  className="px-6 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}