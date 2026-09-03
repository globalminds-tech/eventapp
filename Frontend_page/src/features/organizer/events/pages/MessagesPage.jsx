import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMessageGreetings, getMessagesByEventId, createMessage, deleteMessage, uploadImage } from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";



const MESSAGE_GROUPS = [
  "Welcome Message",
  "Thank You Message",
  "Reminder",
  "Announcement",
  "Closing Remarks",
  "Special Greetings",
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 018.586 12L9 13z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function Spinner({ size = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${size} text-blue-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-rose-200">
              !
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Are you sure?</h3>
          <p className="text-slate-500 font-bold leading-relaxed px-4">Do you really want to delete this message? This action cannot be undone.</p>
        </div>
        <div className="flex gap-4 p-6 bg-slate-50/50 border-t border-slate-100">
          <button onClick={onCancel} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-[1.5rem] hover:bg-slate-100 transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-rose-200 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Pagination ────────────────────────────────────────────────────────
function Pagination({ page, totalPages, setPage, totalItems, perPage, onPerPageChange }) {
  const from = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-gray-600 select-none">
      <span>Showing {from} to {to} of {totalItems} entries</span>

      <div className="flex items-center gap-1 ml-3">
        {[
          { lbl: "«", fn: () => setPage(1), dis: page === 1 },
          { lbl: "‹", fn: () => setPage((p) => Math.max(1, p - 1)), dis: page === 1 },
        ].map(({ lbl, fn, dis }) => (
          <button key={lbl} onClick={fn} disabled={dis}
            className="w-8 h-8 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 flex items-center justify-center">
            {lbl}
          </button>
        ))}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => setPage(p)}
            className={`w-8 h-8 rounded border text-sm ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-100"}`}>
            {p}
          </button>
        ))}

        {[
          { lbl: "›", fn: () => setPage((p) => Math.min(totalPages, p + 1)), dis: page === totalPages || totalPages === 0 },
          { lbl: "»", fn: () => setPage(totalPages), dis: page === totalPages || totalPages === 0 },
        ].map(({ lbl, fn, dis }) => (
          <button key={lbl} onClick={fn} disabled={dis}
            className="w-8 h-8 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 flex items-center justify-center">
            {lbl}
          </button>
        ))}
      </div>

      {onPerPageChange && (
        <select value={perPage}
          onChange={(e) => { onPerPageChange(Number(e.target.value)); setPage(1); }}
          className="ml-3 border border-gray-300 rounded px-2 py-1 text-sm bg-white">
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE 1 — Event List
// ─────────────────────────────────────────────────────────────────────────────
function Page1() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMessageGreetings();

        if (data.error) setError(data.error);
        else setEvents(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = events.filter((e) =>
    [`EVT-${e.id}`, e.event_name, e.start_date, e.end_date]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Messages &amp; Greetings</h1>

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search Keyword"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border border-blue-400 rounded-md px-3 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Spinner size="h-5 w-5" /> Loading events...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
            <tr className="bg-sky-600 text-white">
                    {["Action", "Event Code ↑↓", "Event Name ↑↓", "Event StartDate ↑↓", "Event EndDate ↑↓"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">No data found.</td>
                    </tr>
                  ) : (
                    paginated.map((evt, i) => (
                      <tr key={evt.id}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          {/*
                            ✅ Clicking pencil navigates to /messages-greetings/:id
                               The event id goes into the URL param
                          */}
                          <button
                            onClick={() => navigate(`/OrganizerHome/Messages/${evt.id}`)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-100"
                            title={`Edit messages for ${evt.event_name}`}>
                            <PencilIcon />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-left font-mono text-xs text-gray-600 whitespace-nowrap">EVT-{evt.id}</td>
                        <td className="px-6 py-4 text-left font-medium text-gray-800 whitespace-nowrap">{evt.event_name}</td>
                        <td className="px-6 py-4 text-left text-gray-600 whitespace-nowrap">{evt.start_date}</td>
                        <td className="px-6 py-4 text-left text-gray-600 whitespace-nowrap">{evt.end_date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <Pagination
              page={page} totalPages={totalPages} setPage={setPage}
              totalItems={filtered.length} perPage={perPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE 2 — Message Editor  (reads eventId from URL via useParams)
// ─────────────────────────────────────────────────────────────────────────────
function Page2() {
  /*
    ✅ useParams reads the :eventId segment from the URL.
       e.g. /messages-greetings/5  →  eventId = "5"
  */
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventInfo, setEventInfo] = useState(null);
  const [isGreetings, setIsGreetings] = useState(false);
  const [messageGroup, setMessageGroup] = useState("");
  const [topics, setTopics] = useState("");
  const [subTopics, setSubTopics] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const editorRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ✅ On mount (and whenever eventId changes), fetch event info + existing messages
  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      setLoadingMessages(true);
      try {
        // Fetch event label
        const data = await getMessageGreetings();
        const found =
          Array.isArray(data) &&
          data.find((e) => String(e.id) === String(eventId));

        if (found) setEventInfo(found);

        // Fetch messages
        const messagesData = await getMessagesByEventId(eventId);
        setMessages(Array.isArray(messagesData) ? messagesData : []);

      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadData();
  }, [eventId]);

  // ✅ Centralised fetch so we can call it after add/delete too
  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const data = await getMessagesByEventId(eventId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const execFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) setDescription(editorRef.current.innerHTML);
  };

  // ✅ Add — POST to backend with eventId, then re-fetch to show DB data
  const handleAdd = async () => {
    if (!messageGroup) { alert("Please select a Message Group."); return; }
    if (!editorRef.current?.innerText?.trim()) { alert("Please enter a Description."); return; }

    setSaving(true);
    try {
      let imagePath = "";

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const imgRes = await uploadImage(fd);
        imagePath = imgRes.image_path || "";
      }

      const payload = {
        message_group: messageGroup,
        topics,
        sub_topics: subTopics,
        description,
        image_path: imagePath,
        type: isGreetings ? "Greetings" : "Messages",
      };

      const result = await createMessage(eventId, payload);

      if (result.success) {
        fetchMessages();
        setPage(1);
        handleClear();
        showNotification("Message saved successfully!");
      } else {
        showNotification("Error saving: " + (result.error || "Unknown error"), "error");
      }
    } catch (e) {
      showNotification("Error: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setMessageGroup(""); setTopics(""); setSubTopics("");
    setDescription(""); setImageFile(null); setImagePreview(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  // ✅ Delete — re-fetch after deletion to sync UI with DB
  const handleDelete = async (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const result = await deleteMessage(deleteModal.id);
      if (result.success) {
        fetchMessages();
        showNotification("Message deleted successfully!");
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to delete message", "error");
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const totalPages = Math.max(1, Math.ceil(messages.length / perPage));
  const paginated = messages.slice((page - 1) * perPage, page * perPage);

  const toolbarBtns = [
    { cmd: "bold", label: "B", cls: "font-bold" },
    { cmd: "italic", label: "I", cls: "italic" },
    { cmd: "underline", label: "U", cls: "underline" },
    { cmd: "strikeThrough", label: "S", cls: "line-through" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Messages &amp; Greetings</h1>
          <div className="flex items-center gap-3">
            {eventInfo && (
              <span className="text-sm bg-blue-50 border border-blue-100 rounded-md px-3 py-1.5">
                ✦&nbsp;
                <span className="font-medium text-blue-700">{eventInfo.event_name}</span>
                <span className="text-gray-400 ml-2 text-xs">(EVT-{eventId})</span>
              </span>
            )}
            {/* ✅ Back button → goes to the list page */}
            <button onClick={() => navigate("/OrganizerHome/Messages")}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-100 transition-colors">
              ← Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">

          {/* ── Left Panel ──────────────────────────────────── */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 p-5">
            <h2 className="text-blue-600 font-semibold text-base mb-4">Messages</h2>

            {/* Toggle */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-sm font-medium ${!isGreetings ? "text-gray-900" : "text-gray-400"}`}>Messages</span>
              <button onClick={() => setIsGreetings((v) => !v)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isGreetings ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${isGreetings ? "text-gray-900" : "text-gray-400"}`}>Greetings</span>
            </div>

            {/* Message Group */}
            <div className="mb-4">
              <Select
                label="Message Group *"
                value={messageGroup}
                onValueChange={(val) => setMessageGroup(val)}
                placeholder="Message Group"
                triggerClassName="w-full border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 h-10"
              >
                {MESSAGE_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </Select>
            </div>

            {/* Topics */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
              <input type="text" placeholder="Enter a Topics" value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* Sub-Topics */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Topics</label>
              <input type="text" placeholder="Enter a Sub-Topics" value={subTopics}
                onChange={(e) => setSubTopics(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* Image Upload */}
            <div className="flex gap-3 items-start">
              <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors text-center flex-shrink-0">
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageChange} />
                <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-gray-500 leading-tight">Image<br />Upload</span>
              </label>
              {imagePreview && (
                <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Supported Files: JPG, PNG, WEBP</p>
          </div>

          {/* ── Right Panel ─────────────────────────────────── */}
          <div className="flex-1 p-5 min-w-0">
            <h2 className="text-blue-600 font-semibold text-base mb-4">Message Descriptions</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>

            {/* Rich Text Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-300">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                {toolbarBtns.map(({ cmd, label, cls }) => (
                  <button key={cmd}
                    onMouseDown={(e) => { e.preventDefault(); execFormat(cmd); }}
                    className={`w-7 h-7 text-sm rounded hover:bg-gray-200 flex items-center justify-center ${cls}`}>
                    {label}
                  </button>
                ))}
                <span className="w-px h-5 bg-gray-300 mx-1" />
                <button onMouseDown={(e) => { e.preventDefault(); execFormat("insertOrderedList"); }}
                  className="w-7 h-7 text-sm rounded hover:bg-gray-200 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); execFormat("insertUnorderedList"); }}
                  className="w-7 h-7 text-sm rounded hover:bg-gray-200 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                <select onChange={(e) => execFormat("formatBlock", e.target.value)}
                  className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white h-7">
                  <option value="p">Normal</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
              </div>

              {/* Editable area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => { if (editorRef.current) setDescription(editorRef.current.innerHTML); }}
                className="min-h-40 max-h-56 overflow-y-auto p-3 text-sm text-gray-700 focus:outline-none empty:before:content-['Insert_text_here_...'] empty:before:text-gray-400 empty:before:italic"
                style={{ lineHeight: 1.6 }}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={handleAdd} disabled={saving}
                className="px-7 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-60">
                {saving ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Add"}
              </button>
              <button onClick={handleClear}
                className="px-7 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 active:scale-95 transition-all">
                Clear
              </button>
            </div>

            {/* ✅ Messages table — data fetched fresh from DB each time */}
            <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
            <tr className="bg-sky-600 text-white">
                    {["Action", "Message Group ↑↓", "Topics ↑↓", "Sub-Topics ↑↓", "Description"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingMessages ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <span className="flex items-center justify-center gap-2 text-gray-400">
                          <Spinner /> Loading messages...
                        </span>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">No Data Found.</td></tr>
                  ) : (
                    paginated.map((msg, i) => (
                      <tr key={msg.id}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => handleDelete(msg.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                            <TrashIcon />
                          </button>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{msg.message_group}</td>
                        <td className="px-3 py-2 text-gray-600">{msg.topics || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2 text-gray-600">{msg.sub_topics || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-xs">
                          <div className="truncate" dangerouslySetInnerHTML={{ __html: msg.description || "—" }} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page} totalPages={totalPages} setPage={setPage}
              totalItems={messages.length} perPage={perPage}
            />
          </div>
        </div>

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

        <DeleteConfirmModal 
          isOpen={deleteModal.isOpen} 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteModal({ isOpen: false, id: null })}
          loading={deleting}
        />
      </div>
    </div>
  );
}

export default function MessagesGreetings() {
  const { eventId } = useParams();
  return eventId ? <Page2 /> : <Page1 />;
}