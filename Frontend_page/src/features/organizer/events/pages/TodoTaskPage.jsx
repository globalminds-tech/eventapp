import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Eye, Search, Plus, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { getTasks, createTasks } from "@/Services/api";

const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const StatusBadge = ({ status }) => {
  const styles = {
    "In-Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles["In-Progress"]}`}>
      {status}
    </span>
  );
};

const PctBadge = ({ pct }) => (
  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
    {pct}%
  </span>
);

/* ══════════════════════════════════════════
   PAGE 1 — LIST VIEW
══════════════════════════════════════════ */
function ListView({ onAdd }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewingTask, setViewingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTasks();
      if (res.success) setTasks(res.data);
      else setError(res.error || "Failed to load tasks");
    } catch {
      setError("Cannot connect to backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = tasks.filter((t) =>
    (t.task_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.todo_list_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.assigned_to || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-10 text-slate-800 bg-sky-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-900">To-Do Task</h1>
        <button
          onClick={onAdd}
          className="bg-sky-600 px-4 py-2 rounded text-white flex gap-2 items-center hover:bg-sky-700 transition shadow-lg font-bold"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      <div className="flex justify-start mb-6">
        <div className="relative w-full max-w-sm group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
          />
          <input
            placeholder="Search tasks, users, or lists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-white text-slate-800 placeholder-slate-400 border border-sky-200 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

        {error && (
          <div className="m-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600">
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Task name</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">To-do list name</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Start date</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">End date</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Assigned to</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Complete %</th>
                <th className="px-6 py-4 text-left text-md font-bold text-white tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-20"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" /></td></tr>
              ) : currentTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Info size={40} />
                      <p className="font-bold">No Tasks Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setViewingTask(t)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-sky-900 font-bold">{t.task_name}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{t.todo_list_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm whitespace-nowrap">{fmtDate(t.start_date)}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm whitespace-nowrap">{fmtDate(t.end_date)}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{t.assigned_to}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4"><PctBadge pct={t.complete_percent} /></td>
                    <td className="px-6 py-4 text-slate-600 italic max-w-[180px] truncate">{t.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {filteredTasks.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTasks.length)} of {filteredTasks.length} entries
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

      {/* Detail Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Task Details</h3>
                <p className="text-blue-600 font-bold text-sm tracking-wide mt-0.5">{viewingTask.task_name}</p>
              </div>
              <button 
                onClick={() => setViewingTask(null)}
                className="p-3 hover:bg-gray-200 rounded-2xl transition-all text-gray-400 active:scale-90"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-50">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Main Description</label>
                    <p className="text-slate-700 font-medium leading-relaxed italic">
                      "{viewingTask.task_description || 'No description provided.'}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assignee</label>
                      <p className="font-bold text-slate-800">{viewingTask.assigned_to}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Milestone Status</label>
                      <StatusBadge status={viewingTask.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Milestone Progress</label>
                    <div className="text-4xl font-black text-emerald-700">{viewingTask.complete_percent}%</div>
                    <div className="w-full bg-emerald-200/50 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${viewingTask.complete_percent}%` }} />
                    </div>
                  </div>
                  
                  <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Remarks</label>
                    <p className="text-xs font-bold text-amber-800 italic leading-relaxed">
                      {viewingTask.remarks || 'No remarks added.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Associated Items Section */}
              <div>
                <h4 className="text-slate-900 font-black text-sm mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Milestone Timeline
                </h4>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Milestone</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Start date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">End date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tasks.filter(t => t.task_name === viewingTask.task_name).map((m, idx) => (
                        <tr key={idx} className={m.id === viewingTask.id ? "bg-blue-50/50" : ""}>
                          <td className="px-6 py-4 font-bold text-slate-700 text-sm">{m.todo_list_name}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{fmtDate(m.start_date)}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{fmtDate(m.end_date)}</td>
                          <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button
                onClick={() => setViewingTask(null)}
                className="px-10 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════
   PAGE 2 — FORM VIEW  (exact image match)
══════════════════════════════════════════ */
const EMPTY_ITEM = {
  todo_list_name: "", start_date: "", end_date: "",
  assigned_to: "", status: "In-Progress", complete_percent: "0", remarks: ""
};

function FormView({ onSaved }) {
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [summaryItems, setSummaryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const fc = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addToSummary = () => {
    const { todo_list_name, start_date, end_date, assigned_to, remarks } = form;
    if (!todo_list_name || !start_date || !end_date || !assigned_to || !remarks) {
      setFormErr("Please fill all required fields."); return;
    }
    setFormErr("");
    setSummaryItems((p) => [...p, { ...form }]);
    setForm({ ...EMPTY_ITEM });
  };

  const removeItem = (idx) => setSummaryItems((p) => p.filter((_, i) => i !== idx));

  const saveTask = async () => {
    if (!taskName.trim() || !taskDesc.trim()) {
      setSaveErr("Task Name and Description are required.");
      return;
    }
    if (summaryItems.length === 0) {
      setSaveErr("Add at least one To-Do List entry before saving.");
      return;
    }
    setSaveErr("");
    setSaving(true);
    try {
      const res = await createTasks({
        task_name: taskName.trim(),
        task_description: taskDesc.trim(),
        todo_items: summaryItems.map((i) => ({
          ...i,
          complete_percent: parseInt(i.complete_percent) || 0
        }))
      });
      if (res.success) onSaved();
      else setSaveErr(res.error || "Save failed.");
    } catch {
      setSaveErr("API Error");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700 text-sm";
  const lbl = "block text-sm font-bold text-slate-500 mb-2 ml-1";
  const req = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSaved()}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-600 active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Create Task</h1>
            <p className="text-gray-500 font-medium tracking-wide">Configure task details and milestones</p>
          </div>
        </div>

        <button 
          onClick={saveTask} 
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Finalize & Save</span>
            </>
          )}
        </button>
      </div>

      {saveErr && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600">
          <span className="text-sm font-bold">{saveErr}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left: Task Info */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              Task Information
            </h3>
            <div>
              <label className={lbl}>Task Name {req}</label>
              <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g. Website Launch" className={inp} />
            </div>
            <div>
              <label className={lbl}>Description {req}</label>
              <textarea 
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
                placeholder="Details of the main task..." 
                className={`${inp} h-48 resize-none`} 
              />
            </div>
          </div>
        </div>

        {/* Middle: To-Do Entry */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              To-Do Item Details
            </h3>
            
            <div>
              <label className={lbl}>Milestone Name {req}</label>
              <input name="todo_list_name" value={form.todo_list_name} onChange={fc} placeholder="e.g. Design Mockups" className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Start Date {req}</label>
                <input type="date" name="start_date" value={form.start_date} onChange={fc} className={inp} />
              </div>
              <div>
                <label className={lbl}>End Date {req}</label>
                <input type="date" name="end_date" value={form.end_date} onChange={fc} className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Assign To {req}</label>
              <input name="assigned_to" value={form.assigned_to} onChange={fc} placeholder="Username" className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Status {req}</label>
                <select name="status" value={form.status} onChange={fc} className={inp}>
                  <option>In-Progress</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Progress %</label>
                <input type="number" name="complete_percent" value={form.complete_percent} onChange={fc} min="0" max="100" className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Remarks {req}</label>
              <textarea name="remarks" value={form.remarks} onChange={fc} placeholder="Notes..." className={`${inp} h-24 resize-none`} />
            </div>

            {formErr && <p className="text-xs text-red-500 font-bold">{formErr}</p>}

            <button 
              onClick={addToSummary}
              className="w-full py-4 text-sm font-black text-blue-600 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl hover:bg-blue-100 hover:border-blue-300 transition-all"
            >
              + Add to Checklist
            </button>
          </div>
        </div>

        {/* Right: Summary Table */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              Task Checklist
            </h3>
            
            <div className="flex-1 bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400">Action</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400">Milestone</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400">Dates</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                          No items added yet.
                        </td>
                      </tr>
                    ) : (
                      summaryItems.map((item, i) => (
                        <tr key={i} className="hover:bg-white transition-colors group">
                          <td className="px-4 py-3">
                            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition-all p-1 hover:bg-red-50 rounded-lg">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700 text-sm">{item.todo_list_name}</td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">
                            {fmtDate(item.start_date)} - {fmtDate(item.end_date)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function ToDoApp() {
  const [page, setPage] = useState("list");
  return page === "list"
    ? <ListView onAdd={() => setPage("form")} />
    : <FormView onSaved={() => setPage("list")} />;
}